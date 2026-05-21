# Briefing S1 · Setup-Patch (Firebase + Worker + Versions-Bump)

Phase A · Demo Sprint · Notlauf-konform (siehe PROJEKT_ANWEISUNGEN.md §15)
Erstellt im Strategie-Chat S1 · 2026-05-21 · vor App-Coding-Lauf
Eingangs-Version: v0.1.0 (Übergabe-Stand)
Ziel-Version: v0.1a.2026-05-21 (erster Patch + Migration auf finales Versions-Schema)

## Patch-Auftrag

Drei Bereiche in `ez-cockpit.html` ersetzen:

1. Firebase Config (Zeile ~1904–1912) — Placeholder → echte Werte (vogelsicht-ez-Projekt)
2. Anthropic Proxy URL (Zeile ~1917) — Placeholder → echte Worker-URL
3. Versions-Bump (drei Stellen) — `0.1.0` → `0.1a.2026-05-21`

## B6 · Code-Reality-Check (Pflicht vor Patch)

Im Strategie-Chat wurde bereits gegen `ez-cockpit.html` Stand 2026-05-20 verifiziert. App-Coding muss eigenständig verifizieren, dass sich nichts verschoben hat:

```bash
grep -n "app-version\|APP_VERSION\|firebaseConfig\|ANTHROPIC_PROXY_URL\|Expedition Zukunft · Cockpit ·" ez-cockpit.html
```

Erwartetes Ergebnis (aus Strategie-Verifikation):

```
6:<meta name="app-version" content="0.1.0">
1899:const APP_VERSION = "0.1.0";                // Wird im Footer angezeigt
1904:const firebaseConfig = {
1917:const ANTHROPIC_PROXY_URL = "https://REPLACE-proxy.workers.dev";
9465:  Expedition Zukunft · Cockpit · v0.1.0
```

Bei Drift (andere Zeilen, andere Inhalte): STOP, kurz im Briefing-Chat melden.

## Patch 1 · Firebase Config (Zeilen ~1904–1912)

Alt:

```javascript
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain:        "REPLACE.firebaseapp.com",
  databaseURL:       "https://REPLACE-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "REPLACE",
  storageBucket:     "REPLACE.firebasestorage.app",
  messagingSenderId: "REPLACE",
  appId:             "REPLACE"
};
```

Neu:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyCpK9UnAxORnSYi1f1Ka_zs7tmZreMM7k8",
  authDomain:        "vogelsicht-ez.firebaseapp.com",
  databaseURL:       "https://vogelsicht-ez-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "vogelsicht-ez",
  storageBucket:     "vogelsicht-ez.firebasestorage.app",
  messagingSenderId: "255800511020",
  appId:             "1:255800511020:web:a5ef158abd3d1a14d91f89"
};
```

## Patch 2 · Anthropic Proxy URL (Zeile ~1917)

Alt:

```javascript
const ANTHROPIC_PROXY_URL = "https://REPLACE-proxy.workers.dev";
```

Neu:

```javascript
const ANTHROPIC_PROXY_URL = "https://vogelsicht-ez.holy-forest-0174.workers.dev";
```

## Patch 3 · Versions-Bump (drei Stellen)

### 3a · Zeile ~6 (Meta-Tag):

Alt: `<meta name="app-version" content="0.1.0">`
Neu: `<meta name="app-version" content="0.1a.2026-05-21">`

### 3b · Zeile ~1899 (JS-Konstante):

Alt: `const APP_VERSION = "0.1.0"; // Wird im Footer angezeigt`
Neu: `const APP_VERSION = "0.1a.2026-05-21"; // Wird im Footer angezeigt`

### 3c · Zeile ~9465 (Footer-Text):

Alt: `Expedition Zukunft · Cockpit · v0.1.0`
Neu: `Expedition Zukunft · Cockpit · v0.1a.2026-05-21`

## Post-Patch-Verifikation

```bash
# 1. Syntax-Check
node --check <(awk '/<script>/{flag=1;next} /<\/script>/{flag=0} flag' ez-cockpit.html)
# Erwartung: keine Ausgabe = OK

# 2. Versions-Konsistenz
grep -E "0\.1a\.2026-05-21|0\.1\.0" ez-cockpit.html
# Erwartung: nur die drei neuen Stellen mit 0.1a.2026-05-21; keine 0.1.0 mehr

# 3. Placeholder-Reste suchen
grep "REPLACE" ez-cockpit.html
# Erwartung: keine Ausgabe = alle Platzhalter ersetzt
```

## Smoke-Test im Browser (nach Patch + Push + Pages-Sync ~30 sec)

URL: `https://vogelsicht.github.io/ez/ez-cockpit.html`

1. Lädt ohne Console-Errors? F12 → Console offen halten, Seite reloaden. Erwartung: keine Firebase/CORS-Errors.
2. Identity-Modal funktioniert? Sidebar → "Identität wählen" → neuer Name → Speichern. Erwartung: speichert ohne Fehler, Name erscheint in Person-Listen.
3. Test-Task anlegen? Aufgaben-Tab → "+ Aufgabe" → speichern. Erwartung: erscheint in der Liste, persistiert nach Reload.
4. Co-Lead-Chat antwortet? "🤖 Co-Lead"-Bubble oder Tab öffnen → "Hallo, was ist mein Status?" → erwarten: Antwort innerhalb ~5 sec.
5. Footer zeigt neue Version? Ganz unten: "Expedition Zukunft · Cockpit · v0.1a.2026-05-21".

Bei Fehler in Schritt 4: vermutlich `ANTHROPIC_PROXY_URL` falsch oder Worker-Secret nicht aktiv. Im Network-Tab nachsehen.

## Post-Patch-Aktionen

1. MASTER.md updaten:
   * "Deployed Versions"-Tabelle: neuer Eintrag `v0.1a.2026-05-21`, "live deployed via GitHub Pages, Firebase + Worker verbunden"
   * "Versions-Tabelle": Eintrag ergänzen
   * "Sessions"-Tabelle: S1-Zeile mit Highlights
2. app-coding_kontext.md updaten: S1-Eintrag mit Mitnahmen
3. Commit + Push:

```
S1: Setup-Patch — Firebase + Worker live, v0.1a.2026-05-21

- firebaseConfig: vogelsicht-ez (europe-west1)
- ANTHROPIC_PROXY_URL: vogelsicht-ez.holy-forest-0174.workers.dev
- Version-Bump 0.1.0 → 0.1a.2026-05-21 (3 Stellen)
- Tests: node --check OK, smoke OK (Identity/Task/Co-Lead getestet)
```

---

EZ Cockpit · briefing_S1_setup.md · 2026-05-21 · Phase A Demo Sprint
