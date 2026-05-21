# EZ Cockpit — Übergabe-Dokument

> **Projekt:** Expedition Zukunft · Projektcockpit
> **Service-Produkt von:** Oswald H. König (Osi) / festivitas.space
> **Basis:** Fork des ZFSG-Projektcockpits v3.19, Finance-Module entfernt, Visual Identity auf Expedition Zukunft umgestellt
> **Version:** 0.1.0
> **Status:** Startpunkt für ein neues Claude-Projekt

---

## 1 · Was du hier in der Hand hältst

Zwei Artefakte:

1. **`ez-cockpit.html`** — Single-File-Webapp (~9.500 Zeilen, 464 KB). Lauffähig, syntaktisch sauber, Firebase- und Worker-Config als Placeholder. Visual Identity auf Expedition Zukunft umgestellt (Darker Grotesque, EZ-Farbpalette, animierter Gradient als Akzent).
2. **Dieses Dokument** — alles was du brauchst, um das Service-Produkt als neues Claude-Projekt aufzusetzen und produktiv zu starten.

Das EZ Cockpit hat **vier Kernmodule** plus **KI-Co-Lead**:

| Tab | Funktion |
|---|---|
| **Cockpit** | Dashboard: Timeline, Metriken, Logs-Sidebar, Entscheidungslog |
| **Aufgaben** | Tasks mit Kanban + Tabelle, Multi-Owner, Phasen, Bereiche, Prioritäten |
| **CRM** | Personen + Organisationen + Listen (Smart/Manual/Folders, Multi-Select-Kategorien, Touchpoint-Historie) |
| **Logbook** | Unified Sicht auf Team-Meetings, CRM-Notizen, Brainstorms |
| **Arbeitszeit** | Zeit-Erfassung, CSV-Import (Toggl/Clockify), Filter-Subtab |
| **🤖 Co-Lead** | KI-Chat über Cockpit-Daten via Anthropic-Proxy |
| **Projekt** | Linksammlung + Daten-Export (CSV pro Modul + Gesamt-JSON) |

Plus: **Inbox-Workflow** für Transkript-Import (Meeting/Gespräch → LLM → strukturierte Karten → atomarer Import).

---

## 2 · Was rausgenommen wurde

Aus dem ZFSG-Original entfernt — sauber, mit Acorn-AST und Brace-Matching:

- **Tab "Projekt-Finanzen"** mit Sub-Tabs (Übersicht, Budget-Linien, Geldgeber-Pipeline, Personalkosten)
- **Arbeitszeit-Subtabs** "Rechnungen", "Profile & Personen", "Archiv"
- **6 Finanz-Modale** (budgetModal, funderModal, personProfileModal, recipientModal, closureModal, vereinInvModal)
- **45 Finanz-JavaScript-Funktionen** (~50 KB Code) — Budget, Funders, Invoices, Closures, Stundensätze, Personalkosten
- **6 Firebase-Listener** (budget, funders, personsData, invoiceProfiles, invoiceRecipients, invoiceClosures)
- **`billedManually`-Spalte** und Filter in der Einträge-Tabelle, Closure-Warn-Banner
- **`billedManually`-Checkbox** im TimeEntry-Edit-Modal
- **Finanz-Konstanten** (BUDGET_CATEGORIES, FUNDER_TYP_*, FUNDER_STATUS_*, CHF)
- **CSV-Export-Buttons** für Budget/Geldgeber
- **Finanz-Metrik** im Cockpit-Dashboard (ersetzt durch "Aktive Personen")
- **Print-Stylesheet** für Rechnungs-PDF
- **Ein kritischer Runtime-Bug**: ein Monkey-Patch (`const _origSavePersonProfile = savePersonProfile;`) der nach dem Entfernen der Original-Funktion einen ReferenceError geworfen hätte — proaktiv entfernt

Resultat: Von 11.329 Zeilen auf 9.468 Zeilen, von 569 KB auf 464 KB. Das ist nicht nur weniger Code, sondern weniger **Surface Area** für Bugs und Updates.

---

## 3 · Was umgestellt wurde (Service-Produkt-Logik)

Damit das Cockpit für **beliebige Kunden** funktioniert (nicht nur EZ), wurden die hardcoded ZFSG-Bezüge in eine zentrale Konfiguration extrahiert.

### 3.1 · Konfigurations-Block (Zeile 1894 ff.)

```javascript
// >>>  K U N D E N - K O N F I G U R A T I O N   <<<
const APP_BRAND       = "Expedition Zukunft";
const APP_SLUG        = "ez";              // Filename-Prefix für Exporte
const APP_VERSION     = "0.1.0";
const ROOT_NODE       = "ezcockpit";       // Firebase-Pfad-Root
const LEGACY_TIME_NODE = "ezarbeitsjournal";

const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain:        "REPLACE.firebaseapp.com",
  databaseURL:       "https://REPLACE-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "REPLACE",
  storageBucket:     "REPLACE.firebasestorage.app",
  messagingSenderId: "REPLACE",
  appId:             "REPLACE"
};

const ANTHROPIC_PROXY_URL = "https://REPLACE-proxy.workers.dev";
const ANTHROPIC_MODEL     = "claude-sonnet-4-20250514";
```

**Für jeden neuen Kunden** werden nur diese ~15 Zeilen angepasst, und der Rest funktioniert.

### 3.2 · CSS-Variablen semantisch (Zeile 8 ff.)

```css
:root {
  --app-primary:   #3D46FB;   /* EZ Bright Blue */
  --app-secondary: #b200a5;   /* EZ Magenta */
  --app-tertiary:  #2bbdd4;   /* EZ Cyan-Teal */
  --app-text-strong: #161336;  /* EZ Indigo */
  --app-bg:        #f6f8fb;
  --app-font-h:    'Darker Grotesque', system-ui, ...;
  ...
}
```

Alle **708 Stellen** im Code referenzieren diese Variablen. Re-Skinning für den nächsten Kunden = nur `:root` ändern, fertig.

### 3.3 · Persistierte Daten generisch

- **Hardcoded `projektcockpit/...`** und **`arbeitsjournal/...`** Firebase-Pfade (~105 Stellen) → `(ROOT_NODE + '/' + 'subpath')` Konkatenation
- **LocalStorage-Keys**: `zfsg_*` → `app_*` (8 keys)
- **Default-Personenliste** `["Osi","Severin","Tobias","Lena"]` → leeres Array (Team konfiguriert sich selbst)
- **17 ZFSG-Seed-Tasks** + **19 ZFSG-Seed-Kontakte** + **6 ZFSG-Phasen** + **3 ZFSG-Milestones** + **7 Lena-Streams** → leere Objekte. Beim ersten Start gibt's nur **eine** Default-Phase ("Aufbau", 6 Monate ab heute), damit das Cockpit nicht ganz leer wirkt.
- **LLM-System-Prompts** (Transkript-Extractor + Frag-Chat) auf `${APP_BRAND}` umgestellt
- **CSV-Filenames**: `zfsg_*` → `${APP_SLUG}_*`

---

## 4 · Setup-Checkliste: vom Repo zu Live-App

Schätzwert für jemand mit Grundkenntnissen: **~90 Minuten**.

### 4.1 · Firebase einrichten (~20 min)

- [ ] Bei [console.firebase.google.com](https://console.firebase.google.com/) einloggen
- [ ] **Neues Projekt** anlegen, z.B. `ez-cockpit`
- [ ] **Realtime Database** aktivieren (Region: `europe-west1` für EU-Compliance)
- [ ] Datenbank-Regeln auf Test Mode (oder besser: ein Mini-Auth-Schema, siehe unten)
- [ ] **Web-App** im Projekt registrieren (Symbol `</>`), Config-Objekt kopieren
- [ ] In `ez-cockpit.html`, Zeilen 1903–1911, `firebaseConfig` ersetzen

**Database-Rules (für Pilot — alle dürfen lesen+schreiben):**

```json
{
  "rules": {
    "ezcockpit": { ".read": true, ".write": true },
    "ezarbeitsjournal": { ".read": true, ".write": true }
  }
}
```

> **Achtung:** Test Mode läuft nach 30 Tagen ab. Vor Produktiv-Einsatz mit einem Auth-Layer absichern (Firebase Auth + Rules die `auth != null` verlangen). Das ist ein bewusst offener Punkt für v0.2.

### 4.2 · Cloudflare Worker als Anthropic-Proxy (~20 min)

Damit der "Frag"-Chat und der Transkript-Import funktionieren, brauchst du einen Proxy — das Anthropic-API-Key darf nie im Frontend stehen.

- [ ] Bei [dash.cloudflare.com](https://dash.cloudflare.com/) registrieren (Free Tier reicht: 100k Requests/Tag)
- [ ] Workers & Pages → "Create Application" → "Hello World" → deploy
- [ ] Im Editor: folgenden Code reinpasten:

```javascript
// worker.js — Anthropic API Proxy für Claude-Aufrufe aus dem Browser
export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, anthropic-version',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Pass-through zu Anthropic
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
```

- [ ] Worker speichern + deployen
- [ ] Worker → Settings → Variables → **Secret** anlegen: `ANTHROPIC_API_KEY` mit deinem Anthropic-API-Key
- [ ] Worker-URL kopieren (Format: `https://<name>.<account>.workers.dev`)
- [ ] In `ez-cockpit.html`, Zeile 1916, `ANTHROPIC_PROXY_URL` ersetzen

**Test:** im Browser-DevTools-Console:
```javascript
fetch('https://DEIN-WORKER-URL.workers.dev', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{role: 'user', content: 'Sag Hallo'}]
  })
}).then(r => r.json()).then(console.log);
```

### 4.3 · GitHub-Repo + Pages (~15 min)

- [ ] Neues GitHub-Repo anlegen, z.B. `ez-cockpit` (öffentlich für einfaches Pages-Hosting; oder privat + GitHub Pro für privates Pages)
- [ ] Lokal clonen, `ez-cockpit.html` einfügen (kann auch als `index.html` umbenannt werden — dann ist die URL kürzer)
- [ ] Committen + pushen
- [ ] Repo → Settings → Pages → Source: `main` branch, `/ (root)`
- [ ] Nach 1–2 Minuten ist die App live unter `https://<user>.github.io/<repo>/` (bzw. `https://<user>.github.io/<repo>/ez-cockpit.html`)

> **Hinweis:** GitHub Pages braucht keine HTTPS-Konfiguration — kommt automatisch. Cloudflare Worker akzeptiert nur HTTPS-Requests, also passt das.

### 4.4 · Erste Daten anlegen (~15 min)

- [ ] App im Browser öffnen — sollte "Expedition Zukunft · Cockpit" zeigen
- [ ] Sidebar → "Identität wählen" → Team-Mitglieder hinzufügen (das initialisiert `STATE.persons` und damit alle Owner-Dropdowns)
- [ ] Aufgaben-Tab → erste paar Test-Tasks anlegen
- [ ] CRM-Tab → erste Kontakte
- [ ] Falls man möchte: Phasen im Cockpit-Tab über "+ Phase" anpassen
- [ ] Smoke-Test: KI-Chat öffnen, "Was ist mein Status?" fragen → Antwort sollte kommen

### 4.5 · Übergabe an Expedition Zukunft (~20 min)

- [ ] URL teilen
- [ ] Kurze Einführung: "Cockpit, Aufgaben, CRM, Arbeitszeit. Klick herum, kein Login, kein Auto-Save — alles live synchronisiert."
- [ ] Hinweise was **nicht** drin ist (Finanz/Budget/Rechnungen), und **was kommt** (siehe Roadmap unten)

---

## 5 · Claude-Projekt aufsetzen

Du arbeitest mit dem Setup, das du bei FinanceBird gelernt hast: **drei Claude-Chats** plus **Claude Code CLI**.

### 5.1 · Drei Chats für EZ Cockpit

| Chat-Typ | Plattform | Aufgabe |
|---|---|---|
| **Strategie & Architektur** | Claude Desktop / Web | Konzept, Datenmodell, Feature-Planung, Briefings für Code-Chat |
| **VI & UX** | Claude Desktop / Web | Visuelles Design, Layout, Tonalität — wenn EZ Wünsche hat |
| **App-Coding** | Claude Code CLI im Repo | Tatsächliche Code-Patches an `ez-cockpit.html` |

### 5.2 · Projekt-Struktur im neuen Claude-Projekt

Lege ein **neues Claude-Projekt** an, z.B. "EZ Cockpit". Lade folgende Dateien hoch (siehe Kapitel 6–9 unten — diese Dokumente kopierst du in Markdown-Files):

```
EZ Cockpit Projekt
├── PROJEKT_ANWEISUNGEN.md       ← Master-Bootstrap (Kapitel 6)
├── COCKPIT.md                    ← Tool-Doku (Kapitel 7)
├── MASTER.md                     ← Source of Truth: Backlog, Bugs, Sessions (Kapitel 8)
├── CLAUDE.md                     ← Reflex für Claude Code CLI (Kapitel 9)
├── ez-cockpit.html               ← Aktuelle Version (sobald Setup fertig)
└── (später) briefing_S*.md, ds*.md, audit_*.md
```

Das ist die FinanceBird-Logik 1:1, übertragen.

### 5.3 · Claude Code CLI einrichten

- [ ] `npm install -g @anthropic-ai/claude-code` (oder per Installer-Skript)
- [ ] Repo lokal clonen: `git clone <github-url> ~/Desktop/ez-cockpit`
- [ ] `cd ~/Desktop/ez-cockpit && claude-code .` startet den CLI-Chat im Repo
- [ ] Der Code-Chat liest beim ersten Start automatisch `CLAUDE.md` (siehe Kapitel 9)

### 5.4 · GitHub-Connector für Sync (optional, empfohlen)

Wie bei FinanceBird: lege im Claude-Projekt einen GitHub-Connector an, der das Repo synct. Dann sind alle Doku-Files (`.md`) im Project Knowledge verfügbar, ohne dass du sie manuell hochlädst.

---

## 6 · PROJEKT_ANWEISUNGEN.md — Master-Bootstrap

> Lege diese Datei im Repo unter `docs/PROJEKT_ANWEISUNGEN.md` an. Lade sie in das Claude-Projekt hoch. Sie ist der erste Read in jeder Session.

```markdown
# PROJEKT_ANWEISUNGEN.md — EZ Cockpit Bootstrap

> Pflicht-Bootstrap für JEDEN EZ-Cockpit-Chat.
> Single Source of Truth: `MASTER.md`
> Tool-Doku: `COCKPIT.md`
> Letzte Aktualisierung: <DATUM>

## 1 · Welcher Chat bist du?

EZ Cockpit hat drei Chat-Typen:

| Chat | Plattform | Bootstrap | Schreibt direkt ins Repo? |
|---|---|---|---|
| Strategie & Architektur | Claude Desktop/Web | diese Datei | Nein |
| VI & UX | Claude Desktop/Web | diese Datei | Nein |
| App-Coding | Claude Code CLI | `CLAUDE.md` im Repo-Root | Ja |

## 2 · Was ist das Projekt?

EZ Cockpit ist ein Service-Produkt: ein integriertes Projektcockpit
(Tasks / CRM / Arbeitszeit / KI-Co-Lead) auf Basis einer einzigen
HTML-Datei mit Firebase Realtime Database und Cloudflare-Worker-
Anthropic-Proxy. Ursprünglich für ZFSG entwickelt, jetzt als
verkaufbares Produkt für andere Teams adaptiert.

**Erster Kunde:** Expedition Zukunft (https://expeditionzukunft.ch)

## 3 · Pflicht-Reads beim Session-Start

In dieser Reihenfolge:

1. **MASTER.md** — aktuelle Bugs, Backlog, Sessions-Log, Deployed Version
2. **COCKPIT.md** — Technische Referenz: Datenmodell, Architektur, Konventionen
3. **Aktuelle Briefings** (`briefing_*.md`) wenn vorhanden

## 4 · Rollen-Trennung

| Thema | Gehört in |
|---|---|
| Datenmodell, Feature-Architektur, Roadmap | Strategie |
| Farben, Schriften, Layout, UX-Patterns | VI & UX |
| Konkrete Code-Patches, Bug-Fixes | App-Coding (CLI) |

Wenn ein Thema im falschen Chat landet: aktiv hinweisen.

## 5 · Spielregeln

- **Konfiguration vor Code**: Das Cockpit ist ein Template. Kunden-spezifisches
  geht in `APP_BRAND`, `ROOT_NODE`, `:root` CSS-Variablen — nicht in
  if-else-Verzweigungen im Code.
- **Acorn statt String-Matching** für Code-Modifikationen: brace-balancing in
  Hand schlägt fehl bei verschachtelten Template-Literals. Nutze Acorn-AST.
- **Recherche vor Build**: bei UX-Mustern und Datenmodell-Fragen zuerst schauen
  was Folk/Attio/Notion machen.
- **Mockup-Approval-Gate**: bei nicht-trivialen UI-Änderungen erst Mockup zeigen,
  dann Code schreiben.
- **Atomic deployable releases**: bei größeren Features in Phasen splitten,
  jede Phase muss syntaktisch valide und deploybar sein.

## 6 · "Overview"-Trigger

Wenn der User "Overview" schreibt:
1. Kurzzusammenfassung aus MASTER.md (deployed Version, offene Bugs/BLs)
2. Offene Punkte je Bereich
3. Prio-Vorschlag mit Begründung
4. Auf User-Entscheid warten

## 7 · Briefing-Übergabe an App-Coding

1. Strategie-Chat produziert Briefing als Markdown mit:
   - B1: exakte Return-Types
   - B2: Null-Pfade
   - B3: Verhalten/Side-Effects
   - B4: Anti-Patterns
   - B5: Consumer-Prüfung (wer ruft das auf?)
   - B6: Code-Reality-Check-Anweisungen für App-Coding
2. User pastet in Claude Code CLI: "Speicher als `docs/briefing_S{N}_{name}.md`"
3. CLI schreibt, committet, pusht
4. User öffnet App-Coding-Chat: "Briefing in `docs/briefing_S{N}_{name}.md` — lies und führ aus"
5. App-Coding macht Code-Reality-Check, klärt Rückfragen, patcht

## 8 · Session-Abschluss

1. Was muss in MASTER.md aktualisiert werden?
2. Was in COCKPIT.md?
3. Vorschlag zeigen, OK abwarten
4. User speichert via CLI, Connector synct

## 9 · Versionierung

Schema: `{major}.{session}{patch}` — z.B. `0.1.0`

Bei Code-Änderung Version-Tag bumpen — zwei Stellen in `ez-cockpit.html`:
- `<meta name="app-version" content="X.Y.Z">`
- `const APP_VERSION = "X.Y.Z";`

Plus Footer-Text: `Expedition Zukunft · Cockpit · vX.Y.Z`

App-Coding macht das im Patch-Schritt.
```

---

## 7 · COCKPIT.md — Tool-Doku

> Lege diese Datei im Repo unter `docs/COCKPIT.md` an. Sie ist die technische Bibel.

```markdown
# COCKPIT.md — EZ Cockpit technische Referenz

> Zuletzt aktualisiert: <DATUM> · Version v0.1.0

## Zweck der App

Single-File-Webapp mit fünf Modulen:

1. **Cockpit** — Dashboard: SVG-Timeline mit Phasen, Milestones, Streams + Metriken + Logs-Sidebar
2. **Aufgaben** — Tasks: Kanban (Default) + Tabelle, Multi-Owner, Phasen, Bereiche, Prioritäten, Deadlines
3. **CRM** — Personen + Organisationen + Listen (Smart/Manual, Multi-Select-Kategorien, Tag-Library, Touchpoint-Historie)
4. **Logbook** — Unified Sicht auf Team-Meetings, CRM-Notizen, Brainstorms
5. **Arbeitszeit** — Manuelle Erfassung + CSV-Import + Filter-Subtab
6. **🤖 Co-Lead** — KI-Chat über Cockpit-Daten via Anthropic Proxy
7. **Projekt** — Linksammlung + Daten-Export

Plus: **Inbox-Workflow** für Transkript-Import (Meeting → LLM → strukturierte Karten → atomarer Import).

## Architektur

### Stack
- **Frontend:** Standalone HTML-Datei, Vanilla JS, kein Build-Schritt
- **Datenbank:** Firebase Realtime Database (Region nach Wahl, empfohlen europe-west1)
- **Hosting:** GitHub Pages
- **Anthropic Proxy:** Cloudflare Worker
- **Abhängigkeiten:** Firebase JS SDK 10.12.0 (CDN, compat), Google Fonts (Darker Grotesque)
- **LLM:** Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`)

### Datei-Größe
- ~9.500 Zeilen in `ez-cockpit.html` (UTF-8)
- Validiert via `node --check` auf den combined-script-Blocks

### Konfiguration (Zeile 1894+)

```javascript
const APP_BRAND       = "Expedition Zukunft";
const APP_SLUG        = "ez";
const APP_VERSION     = "0.1.0";
const ROOT_NODE       = "ezcockpit";
const LEGACY_TIME_NODE = "ezarbeitsjournal";
const firebaseConfig  = { ... };
const ANTHROPIC_PROXY_URL = "...";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
```

**Für Re-Skinning eines anderen Kunden:** nur diese ~15 Zeilen ändern. CSS-Variablen im `:root` für Farben/Fonts.

## Firebase-Datenmodell

```
ezcockpit/                        ← ROOT_NODE
├── persons: ["Name1", ...]
├── phases/{id}: { title, start, end, current, order, budgetDays? }
├── milestones/{id}: { title, date, desc? }
├── streams/{id}: { title, start, end, color, order, budgetDays? }
├── tasks/{id}: { title, persons[], status, prio, area, phase?, deadline?, notes?,
│                 estimatedDays?, originMeetingId?, originLogId?, transcriptId?,
│                 originLabel?, updated }
├── contacts/{id}: { name, firstName, lastName, org, orgIds[], desc,
│                    emails[], email, phone, web, land, stadt, sprachen[],
│                    relationshipOwners[], owner (legacy),
│                    dontContact, categories[], status, prio, tags,
│                    tagsSektoren[], tagsKompetenzen[], tagsThemen[],
│                    touchpoints[], notes[], actions[],
│                    pinned, _origin?, created?, updated? }
├── organizations/{id}: { name, desc, sektor, web, location, notes, created, _origin? }
├── lists/{id}: { name, desc?, type ('manual'|'smart'),
│                 kind ('event'|'newsletter'|'wunschliste'|'general'),
│                 statusOptions[], entries{personId:{...}}, members[],
│                 filter?, folderId?, created, updated }
├── listFolders/{id}: { name, order, created, updated }
├── categoryLibrary/{slug}: { label, slug, seeded?, created, updated? }
├── decisions/{id}: { text, context?, date, domain?, author?, originMeetingId?,
│                     originLogId?, transcriptId?, originLabel?, created? }
├── meetings/{id}: { title, date, persons[], notes, decisions,
│                    kind?, linkedContactIds?, linkedOrgIds?,
│                    transcriptId?, _origin?, created?, updated? }
├── logs/{id}: { kind ('meeting'|'crm_note'|'brainstorm'), date, title,
│                persons[], linkedContactIds[], linkedOrgIds[], summary,
│                transcriptId?, _origin, created, updated? }
├── transcripts/{id}: { text, date, detectedType, confidence, created, _origin }
├── timeCategories/{id}: { name, color? }
├── links/{id}: { title, url, category, notes }
└── tagLibrary/
    ├── sektoren: [string]
    ├── kompetenzen: [string]
    └── themen: [string]

ezarbeitsjournal/                 ← LEGACY_TIME_NODE
├── persons: ["Name1", ...]       (parallel zu ezcockpit/persons)
├── categories/{id}: { name, color }
└── entries/{id}: { date, persons[], category, hours, description, source,
                     updated?, originMeetingId?, originLabel? }
```

**Datumsformat:** alle Datumsfelder als `YYYY-MM-DD`. Kürzere Formate brechen `parseDate()`.

**Seed-Mechanismus:** `seedDefaults()` (Zeile ~2257) schreibt Defaults nur wenn `!snap.val()`. Aktuell: leere Objekte für phases/milestones/streams/tasks/contacts, EINE Default-Phase ("Aufbau" 6 Monate). Tag-Library wird mit Vorschlägen geseedet.

## Cloudflare Worker

Alle Aufrufe an die Anthropic-API laufen über `ANTHROPIC_PROXY_URL`. Der Worker:
- setzt CORS-Header für GitHub Pages
- hält den API-Key als Worker-Secret (nicht im Frontend exposed)
- ist Pass-through für `/v1/messages`-Calls

Verwendet von:
1. **Transkript-Import** (`extractTranscript()`) — extrahiert strukturierte Daten aus eingefügtem Transkript
2. **Frag/Co-Lead** (`sendFragMessage()`) — KI-Chat über Cockpit-Daten

Modell: `claude-sonnet-4-20250514`

## Module im Detail

### Cockpit-Tab
- SVG-Timeline (Phasen, Milestones, Streams) — interaktiv via Drag/Resize, eigene Planungsansicht-Overlay
- Metriken-Reihe: Offene Aufgaben, CRM Kontakte, Aktive Personen, Stunden im aktuellen Monat
- "Auf einen Blick"-Module: Nächste Aufgaben, CRM aktuell, Arbeitszeit
- **Logbook-Grid:** Entscheidungslog (links) + Logs-Sidebar (rechts: Meetings/CRM-Notizen/Brainstorms)

### Aufgaben-Tab
- **Default-View: Kanban** (Status-Spalten). Toggle persistiert in `app_taskViewMode`.
- **Alternative: Notion-Stil-Tabelle**
- Spalten: ☐ · Titel · Owner · Bereich · Phase · Prio · Deadline · Status
- Klickbare Spalten-Header öffnen Filter-Popup (Multi-Select + Sort)
- Aktive Filter-Pills oben mit × zum Entfernen
- Suche mit Debounce + Cursor-Restore
- Kanban-Sort: Prio asc → Deadline asc (am längsten fällige zuoberst)

### CRM-Tab
- **Drei Sub-Tabs:** Personen / Organisationen / Listen
- **Multi-Org-Beziehungen** (Person × Organisationen, M:N)
- **Tag-Library** mit drei Achsen (sektoren, kompetenzen, themen)
- **Listen-Folders** (Sidebar mit eigenen Listen, manuelle und smarte)
- **Multi-Select-Kategorien** über Library (10 Standard-Slugs + eigene)
- **Smart-Listen** (Filter-basiert): "★ Gepinnt", "Touchpoint < 30 Tage", "Lange kein Kontakt"
- **Pinned/Star-System** für hot-contacts
- **Touchpoint-Historie** mit Channel/Status/Owner
- **Don't-Contact-Flag** mit Newsletter-Listen-Schutz
- **Logs-Sektion** in Detail-Sicht zeigt verknüpfte Meetings/Brainstorms

### Logs-Tab
- Vereinheitlichte Sicht auf alle Logs (Team-Meetings + CRM-Notizen + Brainstorms)
- Notion-Stil-Tabelle, Filter (Typ, Team, Externe, Transkript-Vorhandensein), Sortierung
- Klick öffnet editierbares Modal

### Arbeitszeit-Tab
- **Sub-Tab "Erfassen":** Personen-Pills, Stunden-Eingabe, Kategorie, Beschreibung
- **Sub-Tab "Einträge":** Filter (Zeitraum, Person, Kategorie, Volltext), Sort, Pagination
- **CSV-Import:** Toggl Track, Clockify, generisch
- **CSV-Export**

### Frag-Tab + Floating-Bubble
- KI-Chat mit Kontext aus dem Cockpit
- System-Prompt referenziert `${APP_BRAND}`
- Persönlicher Verlauf via LocalStorage (`app_chat_history`)
- Kontext-Vorschläge ("Was steht diese Woche an?", ...)
- Tab + Floating-Bubble UI

### Projekt-Subgroup
- **Links** — Linksammlung mit Kategorien
- **Export** — CSV pro Modul + Gesamt-JSON, Dateinamen mit `${APP_SLUG}_`

## Inbox-Workflow (Transkript-Import)

1. Header → "📥 Importieren" → Switch-Dialog (aktuell: Transkript; Excel/Doc kommen)
2. Transkript einfügen → LLM-Call via Worker → strukturierte JSON-Antwort
3. Inbox-Overlay zeigt Karten: Meeting/CRM-Notiz, Decisions, Tasks, Touchpoints, neue Kontakte/Orgs
4. Pro Karte: Checkbox + Inline-Edit
5. Klick "Übernehmen" → atomarer Firebase-Write mit `originMeetingId`/`originLabel`-Tracking

## Visual Identity (Expedition Zukunft)

CSS-Variablen in `:root` (Zeile 8 ff.):

| Variable | Wert | Bedeutung |
|---|---|---|
| `--app-primary` | `#3D46FB` | EZ Bright Blue (Hauptakzent) |
| `--app-secondary` | `#b200a5` | EZ Magenta |
| `--app-tertiary` | `#2bbdd4` | EZ Cyan-Teal |
| `--app-text-strong` | `#161336` | EZ Indigo (Headings) |
| `--app-text` | `#2a2545` | Lauftext |
| `--app-bg` | `#f6f8fb` | App-Hintergrund |
| `--app-bg-alt` | `#eaeef5` | Zonen-Hintergrund |
| `--app-font-h` / `--app-font-b` | `'Darker Grotesque', sans-serif` | Marken-Schrift |

Plus: animierter 6-color-Gradient im Header-Logo (`#00ca9e, #9252fa, #2bbdd4, #19bd99, #b200a5, #4278ff`, 60s loop).

## Code-Konventionen

- **Naming:** camelCase für Variablen, snake_case für Firebase-Keys/Constant-IDs
- **State:** `STATE = { ... }` als globaler Container, Firebase-Listener pushen rein
- **Render-Funktionen:** `renderX()` — idempotent, kein Side-Effect außer DOM-Update
- **Modal-Pattern:** `openXModal(id?)` / `saveX()` / `deleteX(id)` / HTML `<div class="modal-overlay" id="xModal">`
- **CSS:** alle Farben/Fonts/Radii via `var(--app-*)` — nie hardcoded
- **Refs:** `db.ref((ROOT_NODE + '/' + 'pfad'))` — nicht hardcoded
- **LLM-Prompts:** referenzieren `${APP_BRAND}` für Marken-Adaption

## Bekannte offene Punkte (zum Start)

- **Auth fehlt.** Test Mode läuft 30 Tage. Vor Produktion: Firebase Auth.
- **Frag-Chat referenziert "Co-Lead von Team"** — der Prompt-Stil ist gut, aber falls EZ einen anderen Ton will, im Prompt-Block (Zeile ~8876) anpassen.
- **Persons-Verwaltung über Identity-Modal** — funktioniert, aber UX könnte direkter sein (z.B. dediziertes Settings-Panel im Projekt-Tab).
- **Keine bestehende Migration-Logik vom ZFSG-Cockpit.** Wenn jemand seine ZFSG-Daten übertragen will: JSON-Export aus altem Cockpit → Manuel-Anpassung der Firebase-Pfade → Import.
- **Time-Tracking-CSV-Import** — Code ist da, aber für EZ nicht getestet.

## Versions-Historie

| Version | Datum | Änderung |
|---|---|---|
| 0.1.0 | <heute> | Initial Fork aus ZFSG v3.19. Finanz-Module entfernt, Visual Identity auf Expedition Zukunft umgestellt, Service-Produkt-Konfiguration extrahiert. |
```

---

## 8 · MASTER.md — Source of Truth

> Lege diese Datei im Repo unter `docs/MASTER.md` an. Sie ist der zentrale Trackingort.

```markdown
# MASTER.md — EZ Cockpit Source of Truth

> Single Source of Truth. Backlog, Bugs, Sessions, Deployed Version.
> Letzte Aktualisierung: <DATUM>

## Deployed

- **Version:** 0.1.0
- **URL:** https://<user>.github.io/<repo>/
- **Firebase:** projectId `ez-cockpit` (europe-west1)
- **Cloudflare Worker:** https://<name>.<account>.workers.dev

## Sessions

| # | Datum | Chat-Typ | Fokus | Outcome |
|---|---|---|---|---|
| S0 | <heute> | Strategie | Setup nach Übergabe | Repo + Firebase + Worker live, v0.1.0 deployed |

## Aktuelle Phase

**P0 — Setup & First-Use** (<heute> → ...)

Ziel: EZ-Team nutzt das Cockpit aktiv. Erste Aufgaben/Kontakte/Zeiten erfasst. Feedback gesammelt.

## Backlog

### P0 (Setup)
- [ ] BL-001: Firebase Auth-Layer (sobald Test-Mode-Rules ablaufen)
- [ ] BL-002: Eigene EZ-Tag-Library statt Default (sektoren/kompetenzen/themen)
- [ ] BL-003: Frag-Co-Lead-Prompt auf EZ-Sprache anpassen (falls gewünscht)

### P1 (Nice-to-have)
- [ ] BL-004: Settings-Panel für Team-Verwaltung direkt im UI (statt nur Identity-Modal)
- [ ] BL-005: Migration-Tool vom ZFSG-Cockpit (JSON → ez-Format) — falls je relevant
- [ ] BL-006: Custom Dashboard-Widgets pro Kunde konfigurierbar

### P2 (Future)
- [ ] BL-007: Mobile-optimiertes Layout
- [ ] BL-008: Notion-Sync (bidirektional)
- [ ] BL-009: Slack-Integration für Notifications

## Bugs

(keine bekannten Bugs in v0.1.0)

## Architektur-Regeln

A1 — **Konfiguration vor Code**: Kunden-Spezifisches in `APP_BRAND`/`ROOT_NODE`/`:root`, nicht in `if`-Verzweigungen.
A2 — **Acorn-AST für Code-Modifikationen**: bei JS-Operationen das Native Parser-Tool nutzen, nicht Regex.
A3 — **Atomic deployable releases**: jede Phase einer Feature-Implementierung muss `node --check`-grün sein.
A4 — **Backwards-Compat im Datenmodell**: alte Felder dürfen nie hart brechen. Migrationen sind opt-in via `seedDefaults()`-Pattern.
A5 — **Keine Refresh-erforderlich-Updates**: alle State-Änderungen gehen über Firebase-Listener.

## Design-Prinzipien

DP1 — **Service-Produkt-Logik überall**: das Cockpit muss für JEDEN Kunden funktionieren, ohne Code zu ändern.
DP2 — **Visual Identity konsistent**: jedes neue UI-Element nutzt `var(--app-*)`, keine hardcoded Farben.
DP3 — **Minimale Reibung**: kein Login (im Pilot), kein Save-Button (Live-Sync), kein Build-Schritt.
DP4 — **AI-First**: jeder neue Render-Pfad denkt mit, wie er von Frag/Co-Lead konsumiert werden kann.

## Versions-Tabelle

| Version | Datum | Major Changes |
|---|---|---|
| 0.1.0 | <heute> | Initial: Fork aus ZFSG v3.19, Finanzen raus, EZ-Branding |
```

---

## 9 · CLAUDE.md — Reflex für Claude Code CLI

> Lege diese Datei im **Repo-Root** an (nicht in `docs/`!). Claude Code CLI liest sie beim Start automatisch.

```markdown
# CLAUDE.md — Reflex für EZ Cockpit App-Coding

> Du bist Claude Code CLI im EZ-Cockpit-Repo. Lies das hier zuerst.

## 1 · Was ist das?

Du arbeitest am **EZ Cockpit** — einer Single-File-HTML-App
(`ez-cockpit.html`, ~9.500 Zeilen). Das Projekt hat strikte Trennung:

- **Strategie/VI-Chats** (Claude Desktop) produzieren Briefings als Markdown
- **DU (App-Coding)** liest Briefings und macht die tatsächlichen Code-Patches

## 2 · Pflicht-Reads beim Start

1. **`docs/MASTER.md`** — aktuelle Bugs, Backlog, Sessions, Deployed Version
2. **`docs/COCKPIT.md`** — technische Referenz
3. **Aktuelles Briefing** wenn der User auf eines verweist

Wenn der User sagt "Briefing in `docs/briefing_S{N}_{name}.md` — lies und führ aus":
genau das tun. Briefing lesen, Code-Reality-Check, Rückfragen wenn unklar.

## 3 · Code-Reality-Check (B6)

Bevor du einen Patch schreibst:
1. Schaue dir die ECHTE Code-Stelle im File an, nicht aus dem Gedächtnis
2. Prüfe alle Consumer der zu ändernden Funktion (`grep`)
3. Wenn Briefing eine Annahme macht die nicht stimmt: nachfragen, nicht schweigend korrigieren

## 4 · Workflow für Patches

1. **Briefing lesen** — verstehe Anforderung, Edge-Cases, Konsumer
2. **Code-Reality-Check** — schau dir die echte Datei an
3. **Mockup oder Plan** — bei UI-Änderungen erst Mockup zeigen, OK abwarten
4. **Patch** — `str_replace` oder gezielter Block-Replace, KEIN Komplett-Rewrite
5. **Syntax-Check** — `node --check` auf das Script
6. **Version bumpen**:
   - `<meta name="app-version" content="X.Y.Z">` (Zeile ~4)
   - `const APP_VERSION = "X.Y.Z";` (Zeile ~1899)
   - Footer-Text in `<div style="text-align:center;...">Expedition Zukunft · Cockpit · vX.Y.Z</div>`
7. **Smoke-Test** — wenn möglich: openen im Browser
8. **Commit** mit beschreibender Message, **push** zum main
9. **MASTER.md updaten** — Session-Tabelle, Backlog (Item als done markieren oder bewegen)

## 5 · Anti-Patterns (NIE)

- ❌ Hardcoded Farben/Strings — immer `var(--app-*)` und `APP_BRAND`/`APP_SLUG`/`ROOT_NODE`
- ❌ Brace-Matching per Hand bei verschachtelten Template-Literals — nutze Acorn
- ❌ Mehrere Patches in einem Commit ohne Syntax-Check dazwischen
- ❌ Funktionen entfernen ohne Consumer-Check (`grep` nach allen Aufrufern)
- ❌ Firebase-Pfade hardcoded mit `"projektcockpit/..."` — immer `(ROOT_NODE + '/' + 'sub')`
- ❌ Force-push auf main ohne Vorwarnung an User

## 6 · Acorn-Helfer (für komplexe Code-Modifikationen)

Wenn du Funktionen sauber entfernen oder verschieben musst, nutze Acorn statt
Regex/Brace-Matching:

```bash
# Acorn installieren (einmalig)
npm install --prefix /tmp acorn

# Function-Ranges finden
node -e "
const acorn = require('/tmp/node_modules/acorn');
const fs = require('fs');
const code = fs.readFileSync('script.js','utf8');
const ast = acorn.parse(code, {ecmaVersion:2022, locations:true, ranges:true});
const targets = new Set(['funcA','funcB']);
for (const node of ast.body) {
  if (node.type==='FunctionDeclaration' && targets.has(node.id.name))
    console.log(node.id.name, node.start, node.end);
}
"
```

**Achtung:** Acorn-Positions sind UTF-16 code units, Python liest Code Points.
Bei JS mit Emojis (🤖, 💰, ⚠ etc.) gibt's Offset-Drift. Konvertierungs-Helper:

```python
def utf16_to_codepoint(s, utf16_pos):
    cp = 0; u16 = 0
    for c in s:
        if u16 >= utf16_pos: return cp
        u16 += 2 if ord(c) > 0xFFFF else 1
        cp += 1
    return cp
```

## 7 · Versionierung

Schema: `{major}.{minor}.{patch}` — z.B. `0.1.0` → `0.1.1` (Bugfix) → `0.2.0` (Feature) → `1.0.0` (Stable).

Bumpe bei jedem deployed Code-Patch. Bei rein internen Refactorings die nichts ändern: patch reicht.

## 8 · Session-Abschluss

Vor "fertig":
1. `node --check` grün?
2. `app-version` an drei Stellen synchron?
3. `MASTER.md` Session-Tabelle ergänzt?
4. Backlog-Items als done markiert (oder bewegt)?
5. Push erfolgreich?

Dann gerne. Wenn nein: erst fertigmachen.
```

---

## 10 · Erster Sprint nach Setup — was zu tun ist

Nach erfolgreichem Setup (Kapitel 4) gibt's eine erste Konsolidierungs-Session in dem neuen Claude-Projekt. Mögliche Themen:

### 10.1 · Quick Wins für EZ

- **Tag-Library kuratieren**: aktuell Default-Vorschläge — EZ wird eigene Sektoren (Politik, Verwaltung, Wirtschaft, Wissenschaft, Zivilgesellschaft) und Kompetenzen (Moderation, Methoden, Sektor-Expertise) wollen
- **Bereiche/Areas für Tasks** anpassen: aktuell `kommunikation, partner, finanzen, strategie, programm, tools` — bei EZ vielleicht `policy-sprint, akquise, playbook, kommunikation, operativ`
- **Frag-Prompt für EZ verfeinern**: Begriffe wie "Policy Sprint", "Kollaborativer Prozess", "Stakeholder-Konstellation" einbauen
- **Phasen für ein aktuelles Projekt anlegen**: z.B. "Policy Sprint Verkehr Q3 2026" mit Sub-Phasen

### 10.2 · Architektur-Themen

- **Auth-Layer entscheiden**: Firebase Email-Auth? Google-Login? Magic-Link? Hängt davon ab wie EZ arbeitet
- **Multi-Workspace-Fähigkeit überlegen**: was wenn EZ mehrere parallele Policy Sprints hat? Aktueller `ROOT_NODE` ist eine flache Ebene
- **Notion-Sync vorausdenken**: EZ nutzt vielleicht Notion — wäre eine Sync-Brücke wertvoll?

### 10.3 · Erstes Feedback-Loop

Plan: nach **2 Wochen aktiver Nutzung** ein Review mit EZ:
- Was funktioniert?
- Was fehlt?
- Was würde sie weglassen?

Daraus entsteht v0.2.0.

---

## 11 · Was du mir (Osi) dafür bezahlst (Service-Produkt-Logik)

Das ist kein technisches Detail, aber für die Verkaufslogik relevant. Mögliche Modelle:

### 11.1 · Einmalig
- Setup-Paket: 2.500–4.500 CHF (Repo + Firebase + Worker + Übergabe-Session)
- Anpassungen pro Sprint: Tagessatz × 1–3 Tage

### 11.2 · Wiederkehrend
- Monatliche Wartung & kleine Features: 500–1.500 CHF/Monat
- Firebase-Kosten gehen 1:1 weiter (Spark-Tier ist gratis bis 1 GB DB, dann ~10 USD/Monat für Blaze)
- Cloudflare Worker: Free Tier reicht bis 100k Requests/Tag (= ca. 3.000 Chat-Nachrichten/Tag)
- Anthropic API: pay-per-use, typisch ~5–20 USD/Monat für ein Team von 4–6 Personen

### 11.3 · White-Label-Option
- Für mehrere Kunden gleichzeitig: ein Template, pro Kunde nur `APP_BRAND` + `ROOT_NODE` + `:root` anpassen
- Eigenes Branding bleibt im Footer (oder versteckbar gegen Aufpreis)

---

## 12 · Was offen ist / Ehrlichkeit

Ein paar Dinge, die ich im Code nicht testen konnte (kein laufender Browser):

1. **Visuell**: Darker Grotesque sollte über Google Fonts laden. Falls EZ-Squarespace die Lizenz hat, theoretisch ohne Probleme. Optisch sollte das Cockpit konsistent wirken — aber **erst nach erstem Öffnen im Browser bestätigen**.
2. **Anthropic-Proxy**: ohne deployed Worker kann der Frag-Chat nicht getestet werden. Lade die App, klicke auf "🤖 Co-Lead" — falls Network-Error: Worker-URL prüfen.
3. **Firebase-Migration**: das alte ZFSG-Cockpit nutzt `projektcockpit/...` und `arbeitsjournal/...`. Das neue EZ-Cockpit nutzt `ezcockpit/...` und `ezarbeitsjournal/...`. Diese Datenbanken sind **getrennt**. Kein automatischer Import von ZFSG-Daten — und das ist gut so, EZ braucht ja eigene Daten.
4. **Touchpoints-Event-Default** auf leeren String gesetzt (war früher "ZFSG 2026" hardcoded). Falls EZ ein wiederkehrendes Event hat, sollte das später konfigurierbar sein.
5. **STATE.persons leer** beim Start. Heißt: bis das erste Team-Mitglied angelegt wird (über Identity-Modal), sehen alle Owner-Dropdowns leer aus. Das ist OK, sollte aber im Onboarding-Briefing für EZ erwähnt sein.

---

## 13 · Du hast jetzt

✅ `ez-cockpit.html` — die App selbst, ~9.500 Zeilen, syntaktisch sauber
✅ Diesen Übergabe-Brief mit Setup-Checkliste
✅ Vorlagen für vier MD-Files (PROJEKT_ANWEISUNGEN, COCKPIT, MASTER, CLAUDE)
✅ Klare Roadmap für die ersten Wochen
✅ Bewusste Markierung dessen was offen bleibt

Was dir fehlt:
- Live-Test im Browser (machst du beim Setup)
- Erste EZ-Feedback-Runde (kommt nach Übergabe)
- v0.2.0-Briefing (entsteht nach Feedback)

Viel Erfolg.

— Claude, mit Osi
