# EZ Cockpit · COCKPIT.md — Technische Referenz

> Die technische Bibel: Datenmodell, Architektur, Code-Konventionen, Versions-Historie.
> Single Source of Truth bleibt `MASTER.md` — bei Konflikt: MASTER wins.
> Zuletzt aktualisiert: 2026-05-20 (S0) · Version v0.1.0

---

## Zweck der App

Single-File-Webapp mit sieben Modulen:

1. **Cockpit** — Dashboard: SVG-Timeline mit Phasen, Milestones, Streams + Metriken + Logs-Sidebar
2. **Aufgaben** — Tasks: Kanban (Default) + Tabelle, Multi-Owner, Phasen, Bereiche, Prioritäten, Deadlines
3. **CRM** — Personen + Organisationen + Listen (Smart/Manual, Multi-Select-Kategorien, Tag-Library, Touchpoint-Historie)
4. **Logbook** — Unified Sicht auf Team-Meetings, CRM-Notizen, Brainstorms
5. **Arbeitszeit** — Manuelle Erfassung + CSV-Import + Filter-Subtab
6. **🤖 Co-Lead** — KI-Chat über Cockpit-Daten via Anthropic Proxy
7. **Projekt** — Linksammlung + Daten-Export

Plus: **Inbox-Workflow** für Transkript-Import (Meeting → LLM → strukturierte Karten → atomarer Import).

---

## Architektur

### Stack

- **Frontend:** Standalone HTML-Datei, Vanilla JS, kein Build-Schritt
- **Datenbank:** Firebase Realtime Database (Region: `europe-west1` für EU-Compliance)
- **Hosting:** GitHub Pages (statisch, HTTPS automatisch)
- **Anthropic Proxy:** Cloudflare Worker (Free Tier: 100k Requests/Tag)
- **Abhängigkeiten:** Firebase JS SDK 10.12.0 (CDN, compat), Google Fonts (Darker Grotesque)
- **LLM:** Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`)

### Datei-Größe (Stand 0.1.0)

- ~9.500 Zeilen in `ez-cockpit.html` (UTF-8, ~464 KB)
- Validiert via `node --check` auf den combined-script-Blocks

### Konfigurations-Block (Zeile ~1894)

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

**Für Re-Skinning eines anderen Kunden** (Phase D): nur diese ~15 Zeilen + CSS-Variablen im `:root` ändern.

---

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

---

## Cloudflare Worker

Alle Aufrufe an die Anthropic-API laufen über `ANTHROPIC_PROXY_URL`. Der Worker:
- setzt CORS-Header für GitHub Pages
- hält den API-Key als Worker-Secret (`ANTHROPIC_API_KEY`, nicht im Frontend exposed)
- ist Pass-through für `/v1/messages`-Calls

Verwendet von:
1. **Transkript-Import** (`extractTranscript()`) — extrahiert strukturierte Daten aus eingefügtem Transkript
2. **Frag/Co-Lead** (`sendFragMessage()`) — KI-Chat über Cockpit-Daten

Modell: `claude-sonnet-4-20250514`

Worker-Code: siehe `EZ_COCKPIT_UEBERGABE.md` §4.2 (canonical) oder `worker.js` im Repo wenn separat eingecheckt.

---

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

### Frag-Tab + Floating-Bubble (🤖 Co-Lead)
- KI-Chat mit Kontext aus dem Cockpit
- System-Prompt referenziert `${APP_BRAND}`
- Persönlicher Verlauf via LocalStorage (`app_chat_history`)
- Kontext-Vorschläge ("Was steht diese Woche an?", ...)
- Tab + Floating-Bubble UI

### Projekt-Subgroup
- **Links** — Linksammlung mit Kategorien
- **Export** — CSV pro Modul + Gesamt-JSON, Dateinamen mit `${APP_SLUG}_`

---

## Inbox-Workflow (Transkript-Import)

1. Header → "📥 Importieren" → Switch-Dialog (aktuell: Transkript; Excel/Doc geplant)
2. Transkript einfügen → LLM-Call via Worker → strukturierte JSON-Antwort
3. Inbox-Overlay zeigt Karten: Meeting/CRM-Notiz, Decisions, Tasks, Touchpoints, neue Kontakte/Orgs
4. Pro Karte: Checkbox + Inline-Edit
5. Klick "Übernehmen" → atomarer Firebase-Write mit `originMeetingId`/`originLabel`-Tracking

---

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

Alle **708 Stellen** im Code referenzieren `var(--app-*)`. Re-Skinning für nächsten Kunden = nur `:root` ändern, fertig.

---

## Code-Konventionen

- **Naming:** camelCase für Variablen, snake_case für Firebase-Keys/Constant-IDs
- **State:** `STATE = { ... }` als globaler Container, Firebase-Listener pushen rein
- **Render-Funktionen:** `renderX()` — idempotent, kein Side-Effect außer DOM-Update
- **Modal-Pattern:** `openXModal(id?)` / `saveX()` / `deleteX(id)` / HTML `<div class="modal-overlay" id="xModal">`
- **CSS:** alle Farben/Fonts/Radii via `var(--app-*)` — nie hardcoded (A11 Configuration-First)
- **Refs:** `db.ref((ROOT_NODE + '/' + 'pfad'))` — nicht hardcoded (A11 Configuration-First)
- **LLM-Prompts:** referenzieren `${APP_BRAND}` für Marken-Adaption
- **CSV-Filenames:** Prefix `${APP_SLUG}_` für alle Exporte

---

## Bekannte offene Punkte (Stand 0.1.0)

Aus der Übergabe identifiziert, noch nicht im Code adressiert:

- **Auth fehlt.** Test Mode läuft 30 Tage nach Firebase-Setup. Vor Production-Use: Firebase Auth (Phase B-Entscheid).
- **Frag-Chat referenziert "Co-Lead von Team"** — Prompt-Stil ist gut, kann in Phase B auf EZ-Sprache angepasst werden (Prompt-Block ~Zeile 8876).
- **Persons-Verwaltung über Identity-Modal** — funktioniert, UX könnte direkter sein (BL-021: dediziertes Settings-Panel im Projekt-Tab, Phase C).
- **Keine bestehende Migration-Logik vom ZFSG-Cockpit.** Wenn Übernahme einer ZFSG-DB nötig wäre: JSON-Export aus altem Cockpit → manuelle Pfad-Anpassung → Import. Nicht für EZ relevant (eigene Daten).
- **Time-Tracking-CSV-Import** — Code ist da, aber für EZ-Workflow nicht getestet (Phase B / C).
- **Touchpoints-Event-Default** auf leeren String gesetzt (war früher "ZFSG 2026" hardcoded). Falls EZ ein wiederkehrendes Event hat, konfigurierbar machen (Phase B).
- **STATE.persons leer beim Start.** Bis erstes Team-Mitglied über Identity-Modal angelegt wird, sehen alle Owner-Dropdowns leer aus. Im Onboarding-Briefing erwähnen.

---

## Versions-Historie

| Version | Datum | Änderung |
|---|---|---|
| 0.1.0 | 2026-05-20 | Initial Fork aus ZFSG v3.19. Finanz-Module entfernt, Visual Identity auf Expedition Zukunft umgestellt, Service-Produkt-Konfiguration extrahiert (`APP_BRAND` / `APP_SLUG` / `ROOT_NODE` / etc.). Placeholders für Firebase und Worker. Noch nicht deployed. |

---

*EZ Cockpit · COCKPIT.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
