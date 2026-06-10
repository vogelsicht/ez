// =================================================================
//  EZ Cockpit · Cloudflare Worker · v0.2a
// -----------------------------------------------------------------
//  Zwei Aufgaben:
//   1. Anthropic-API-Proxy  (POST, alles ausser /clockify/*)
//      → identisch zum bisherigen Worker (Übergabe-Doc §4.2),
//        Co-Lead + Transkript-Import laufen unverändert.
//   2. Clockify-API-Proxy   (GET/POST /clockify/*)
//      → Browser schickt den Clockify-Key im Header `X-Clockify-Key`
//        (kommt aus Firebase clockifyConfig, auth-geschützt).
//        Fallback: Worker-Secret CLOCKIFY_API_KEY (Phase-B-Härtung).
//   3. Cron-Trigger (alle 2h): pullt TimeEntries der letzten 7 Tage
//      aus Clockify und schreibt sie dedupliziert nach Firebase.
//      Braucht Worker-Secret FIREBASE_DB_SECRET (Database-Secret aus
//      Firebase Console → Project Settings → Service Accounts →
//      Database Secrets). OHNE dieses Secret tut der Cron nichts —
//      Manual-Sync im Frontend funktioniert trotzdem.
//
//  Secrets (Worker → Settings → Variables):
//   ANTHROPIC_API_KEY   (Pflicht — existiert bereits)
//   FIREBASE_DB_SECRET  (optional — nur für Cron-Auto-Sync)
//   CLOCKIFY_API_KEY    (optional — Fallback wenn kein Header-Key)
//
//  Cron aktivieren: Worker → Settings → Triggers → Cron: 0 */2 * * *
// =================================================================

const FIREBASE_DB_URL = 'https://vogelsicht-ez-default-rtdb.europe-west1.firebasedatabase.app';
const ROOT_NODE = 'ezcockpit';
const LEGACY_TIME_NODE = 'ezarbeitsjournal';
const CLOCKIFY_BASE = 'https://api.clockify.me/api/v1';
const CRON_LOOKBACK_DAYS = 7;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, anthropic-version, X-Clockify-Key',
  'Access-Control-Max-Age': '86400'
};

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ---------- Clockify-Proxy ----------
    if (url.pathname.startsWith('/clockify/')) {
      if (request.method !== 'GET') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
      }
      const apiKey = request.headers.get('X-Clockify-Key') || env.CLOCKIFY_API_KEY;
      if (!apiKey) {
        return jsonResponse({ error: 'Kein Clockify-API-Key (Header X-Clockify-Key fehlt, kein Worker-Secret gesetzt).' }, 401);
      }
      // Pfad 1:1 durchreichen: /clockify/user → /user, /clockify/workspaces/... → /workspaces/...
      const cfPath = url.pathname.replace(/^\/clockify/, '');
      const cfUrl = CLOCKIFY_BASE + cfPath + url.search;
      const cfResp = await fetch(cfUrl, {
        headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' }
      });
      const body = await cfResp.text();
      return new Response(body, {
        status: cfResp.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // ---------- Anthropic-Proxy (bestehender Pfad, unverändert) ----------
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    const body = await request.text();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body
    });
    const respBody = await response.text();
    return new Response(respBody, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  },

  // ---------- Cron: Auto-Sync alle 2h ----------
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduledSync(env));
  }
};

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

// Firebase REST Helpers (Cron-Pfad, braucht FIREBASE_DB_SECRET)
async function fbGet(path, secret) {
  const r = await fetch(`${FIREBASE_DB_URL}/${path}.json?auth=${secret}`);
  if (!r.ok) throw new Error(`Firebase GET ${path}: HTTP ${r.status}`);
  return r.json();
}
async function fbWrite(path, method, data, secret) {
  const r = await fetch(`${FIREBASE_DB_URL}/${path}.json?auth=${secret}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(`Firebase ${method} ${path}: HTTP ${r.status}`);
  return r.json();
}

// ISO-8601-Duration (PT2H30M15S) → Stunden
function durationToHours(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) + parseInt(m[2] || 0) / 60 + parseInt(m[3] || 0) / 3600);
}

async function runScheduledSync(env) {
  if (!env.FIREBASE_DB_SECRET) {
    console.log('Cron-Sync übersprungen: FIREBASE_DB_SECRET nicht gesetzt.');
    return;
  }
  const secret = env.FIREBASE_DB_SECRET;
  let config;
  try {
    config = await fbGet(`${ROOT_NODE}/clockifyConfig`, secret);
  } catch (e) {
    console.log('Cron-Sync: clockifyConfig nicht lesbar — ' + e.message);
    return;
  }
  if (!config || !config.apiKey || !config.workspaceId || !config.personMapping) {
    console.log('Cron-Sync übersprungen: Clockify nicht (vollständig) konfiguriert.');
    return;
  }

  const start = new Date(Date.now() - CRON_LOOKBACK_DAYS * 86400000).toISOString();
  const end = new Date().toISOString();

  // Dedupe-Index: vorhandene clockifyEntryIds einsammeln.
  // Phase A: Volltabelle laden ist ok (wenige hundert Einträge). Bei Wachstum:
  // Firebase-Index auf clockifyEntryId + orderBy-Query.
  const existing = (await fbGet(`${LEGACY_TIME_NODE}/entries`, secret)) || {};
  const knownIds = new Set(Object.values(existing).map(e => e && e.clockifyEntryId).filter(Boolean));

  // Reverse-Mapping Clockify-Projekt-ID → EZ-Projekt-ID
  const projReverse = {};
  Object.entries(config.projectMapping || {}).forEach(([ezId, cfId]) => { if (cfId) projReverse[cfId] = ezId; });

  let added = 0, skipped = 0;
  const errors = [];

  for (const [personName, cfUserId] of Object.entries(config.personMapping)) {
    if (!cfUserId) continue;
    try {
      const entriesUrl = `${CLOCKIFY_BASE}/workspaces/${config.workspaceId}/user/${cfUserId}/time-entries`
        + `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&page-size=200`;
      const resp = await fetch(entriesUrl, { headers: { 'X-Api-Key': config.apiKey } });
      if (!resp.ok) { errors.push(`${personName}: Clockify HTTP ${resp.status}`); continue; }
      const entries = await resp.json();
      for (const ce of entries) {
        if (!ce || !ce.id || knownIds.has(ce.id)) { skipped++; continue; }
        const hours = durationToHours(ce.timeInterval && ce.timeInterval.duration);
        if (hours <= 0) { skipped++; continue; }   // laufende Timer (duration null) überspringen
        const entry = {
          date: (ce.timeInterval.start || '').slice(0, 10),
          persons: [personName],
          hours: Math.round(hours * 100) / 100,
          category: '',
          description: ce.description || '',
          source: 'clockify',
          clockifyEntryId: ce.id,
          createdAt: new Date().toISOString()
        };
        const ezProjectId = ce.projectId ? projReverse[ce.projectId] : null;
        if (ezProjectId) entry.projectId = ezProjectId;
        await fbWrite(`${LEGACY_TIME_NODE}/entries`, 'POST', entry, secret);
        knownIds.add(ce.id);
        added++;
      }
    } catch (e) {
      errors.push(`${personName}: ${e.message}`);
    }
  }

  await fbWrite(`${ROOT_NODE}/clockifyConfig/lastSync`, 'PUT', new Date().toISOString(), secret);
  await fbWrite(`${ROOT_NODE}/clockifyConfig/lastSyncResult`, 'PUT',
    { added, skipped, errors: errors.length ? errors : null, via: 'cron' }, secret);
  console.log(`Cron-Sync fertig: ${added} neu, ${skipped} übersprungen, ${errors.length} Fehler.`);
}
