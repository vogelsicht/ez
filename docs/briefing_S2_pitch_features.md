# Briefing S2 — Pitch-Features (EZ Cockpit 0.2.x)

> **Quelle:** Strategie-Chat S2, 2026-06-05.
> **Ziel:** Demo-fähige EZ-Cockpit-Version, die Salimatas Workflow (Screenshot 1) live abbildet + Clockify-Auto-Sync + Login pro User.
> **Phase:** A · Demo Sprint, aber **B1–B6 voll**, weil strukturelle Erweiterungen (Auth, Datenmodell, Worker-Endpoint).
> **Liefer-Format:** 2 Etappen mit klarem Commit-Schnitt. Etappe 1 ist eigenständig vorzeigbar.

---

## 0 · Kontext (lies das zuerst)

EZ Cockpit ist ein Fork von ZFSG v3.19 (pre-Sandbox). Salimata (EZ) hat in zwei Nachrichten klar gemacht:

1. **Risiko "one more Plattform"** ist verhandelbar, wenn das Cockpit als Interface ihre bestehenden Tools (Notion-Tasks, Clockify-Stunden, Google-Sheets-Ressourcenplanung) **bündelt** statt ersetzt.
2. **Datenschutz** lösbar (keine US-Apps, Auth, Encryption).
3. **Kern-Bedarf** aus Screenshot 1: Ressourcen ↔ offerierte Tage ↔ Tasks pro Projekt — verbunden.
4. **Workflow** = Pivot-Tabelle Person × Kategorie × Zeit, mit Kapazitäts-Block oben (Arbeitstage − Ferien − Kompensation = Kapazität Offen).
5. **Granularität**: Salimata plant heute in Monaten (Sheet-Beschränkung), aber Realität ist wochengetaktet. Wir bauen **kanonisch Wochen** mit Monatsansicht-Toggle.

Wichtige Korrektur gegenüber älteren Briefing-Annahmen: Die ZFSG-Sandbox (sb8) hat **kein Personen-Kapazitäts-Modell** und **kein Person × Projekt × Woche**-Soll. Das, was hier gebaut wird, ist **nicht ein 1:1-Port aus ZFSG**, sondern eine substanzielle Erweiterung — basierend auf den portierbaren Bausteinen `weeklyBudgets` und der Linsen-Mechanik, aber mit eigenem Datenmodell für die Person-Achse.

---

## 1 · Architektur-Entscheide (verbindlich)

Diese Entscheide gelten für beide Etappen. Falls die CLI im Code-Reality-Check Widersprüche findet → eskalieren, nicht improvisieren.

### 1.1 Datenmodell — additive Erweiterung, kein Refactoring

**Neue Knoten** (parallel zu bestehenden, brechen nichts):

- `projects/` — EZ-Projekt-Hierarchie (Kategorie → Sub-Kategorie → Leaf/Auftrag)
- `personCapacity/` — Stammdaten pro Person × Monat (Arbeitstage, Ferien, Kompensation)
- `effortEstimates/` — Aufwandsschätzungen pro Person × Woche × Projekt
- `appConfig/tagessoll` — editierbar, Default `8.4`
- `userMapping/` — Auth-UID ↔ Person-Name

**Erweiterte Felder** an bestehenden Knoten:

- `tasks/{id}.projectId` (optional, zusätzlich zu bestehenden `streamIds[]`)
- `timeEntries/{id}.projectId` (optional, für Soll/Ist-Aggregation auf Projekt-Ebene)
- `personsData/{name}.email` (für Auth-Mapping)

**Nicht angefasst:** `streams/`, `tasks/` (außer projectId-Feld), `contacts/`, `organizations/`, `tagLibrary/`, `meetings/`, `decisions/`, `logs/` — bleiben funktional wie sie sind.

### 1.2 A-Regeln, die hier neu greifen

- **A-NEW-1: Kanonische Einheit ist Stunden, kanonische Zeitachse ist Wochen.** Tage/Monate sind View-Konvertierungen. `effortEstimates[person][weekKey][projectId].hours` ist die Wahrheit. Niemals zwei Schreib-Pfade.
- **A-NEW-2: WeekKey = Montag der Woche als `YYYY-MM-DD`.** Konsistent mit ZFSG-sb8-Konvention. ISO-Wochen wären präziser, aber inkonsistent zu vorhandenem Code.
- **A-NEW-3: Tagessoll lebt in `appConfig.tagessoll`, nicht in LocalStorage.** ZFSG hatte es in LS (`zfsg_daily_hours`), das ist ein Anti-Pattern für Multi-User: jede:r hätte einen eigenen Wert. → Geteilt im Firebase-Knoten.
- **A-NEW-4: `projects/` und `streams/` koexistieren, sind aber NICHT verlinkt.** Projects = EZs Hierarchie für Aufwandsplanung. Streams = optionaler Workstream-Container (für Tasks-Gruppierung, falls EZ es nutzen will). Doppel-Modellierung bewusst akzeptiert für Phase A — Konsolidierung in Phase B falls überhaupt nötig.
- **A-NEW-5: Auth ist Login-Gate, keine Authorization.** Phase A: `auth != null → read/write alle Daten`. Granularität ("nur eigene Spalte editierbar") = Phase B.

### 1.3 Phase-Mapping

| In diesem Briefing | NICHT in diesem Briefing (= Phase B oder später) |
|---|---|
| Pivot-Tabelle Person × Projekt × Woche/Monat | Notion-Tasks-Sync (BL-031) |
| Person-Kapazitäts-Modell mit Auto-Berechnung | Granulare Security Rules per User |
| Clockify Worker-Endpoint + Cron-Auto-Sync | Linsen-System (sb8) |
| Auth E-Mail/Passwort | Spesen, Geld-Monitoring |
| Auftrags-Rentabilitäts-Sicht (Soll vs. Ist) | Schätzfehler-Historie, Auto-Eskalation |
| EZ-Seed-Data | Workpackages-System (sb8) |

### 1.4 Versionierung

- Etappe 1 abgeschlossen → `v0.2.0.YYYY-MM-DD` (Phase-Major-Bump, deutliche Erweiterung)
- Etappe 2 abgeschlossen → `v0.2a.YYYY-MM-DD` (Patch in 0.2)
- Drei Stellen in `ez-cockpit.html` updaten (siehe PROJEKT_ANWEISUNGEN §13)

---

## 2 · Etappe 1 — Foundation + Resource-Planning-Pivot

**Ziel:** Auth läuft, Salimatas Sheet-Workflow als Live-Pivot-Tabelle, EZ-Seed-Data, Querschnitts-View, Auftrags-Rentabilitäts-Liste (manuell gepflegt, Auto-Sync kommt in Etappe 2).

**Commit-Punkt am Ende:** `v0.2.0` live, vorzeigbar für Salimata. Etappe 2 ist Bonus, nicht Voraussetzung für den Pitch.

### 2.1 — Schritt 1: Auth + Settings-Tab + Datenmodell-Erweiterung

#### Was zu tun ist (für Osi, vor Code-Patches)

**Firebase Console-Setup** (du machst das, NICHT die CLI):

1. Firebase Console → Authentication → Sign-in method → "E-Mail/Passwort" aktivieren
2. Authentication → Users → manuell anlegen:
   - `pascal@expeditionzukunft.ch` + initial password
   - `salimata@expeditionzukunft.ch` + initial password
   - usw. für alle 8 EZ-Personen (E-Mails ggf. anpassen, du kennst die echten)
   - `osi@festivitas.space` (für dich, als Admin)
3. Realtime Database → Rules → ersetzen durch:

```json
{
  "rules": {
    "ezcockpit": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

4. Initial-Passwörter notieren, an Salimata + Team per sicherem Kanal weitergeben

#### Code-Patches (CLI)

**1.1 Auth-Layer einbauen** (vor App-Init)

Neue Globals zwischen `firebase.initializeApp(...)` und dem ersten `db.ref(...)`-Listener:

- `const auth = firebase.auth();`
- `let currentAuthUser = null;`
- `let currentPersonName = null;`  (ersetzt LocalStorage-basierte Identität)

**B1 Return-Type:**

- `auth.currentUser` → `firebase.User | null`
- `currentPersonName` → `string | null` (Name aus `STATE.persons`, gematcht über `personsData[name].email === auth.currentUser.email`)

**B2 Null-Pfade:**

- Vor jedem Auth-abhängigen Render: `if (!currentAuthUser) return;`
- Wenn Email nicht zu einer Person matched: User sieht Warnung "Dein Login (X) ist keiner Person zugeordnet. Bitte Osi kontaktieren." — App lädt nicht.

**B3 Side-Effects:**

- `auth.onAuthStateChanged(handleAuthChange)` ist der einzige Pfad, der `currentAuthUser` und `currentPersonName` setzt. Niemand sonst.
- `handleAuthChange`: wenn `user`: setzt Globals, ruft `bootApp()` (was vorher direkt nach `initializeApp` lief). Wenn `null`: zeigt Login-Screen.

**B4 Anti-Patterns:**

- NICHT LocalStorage für Identität verwenden. Auth ist Source of Truth.
- NICHT `db.ref(...)` aufrufen bevor `currentAuthUser` gesetzt ist (sonst Permission-Denied vom Security Rule).
- NICHT die CLI darf Firebase-Users anlegen (das ist Osis Job in der Console).

**B5 Consumer-Prüfung:**

- Suche im Code nach: `localStorage.getItem('zfsg_current_user')`, `currentUser` (Variable, nicht `auth.currentUser`), `currentPerson` (Variable). Alle Lese-Pfade → `currentPersonName`.

**1.2 Login-Screen** (HTML + Logik)

Neuer `<div id="loginScreen">` als Overlay über der App. Inhalt:

- App-Logo / Header
- Input: E-Mail
- Input: Passwort
- Button: "Anmelden"
- Link: "Passwort zurücksetzen" (ruft `auth.sendPasswordResetEmail(email)`)
- Error-Display

Default sichtbar (`display:flex`), wird durch `handleAuthChange` ausgeblendet wenn User eingeloggt.

**Login-Submit:**

```
auth.signInWithEmailAndPassword(email, password)
  .catch(err => showLoginError(err.message))
```

Onsuccess: `onAuthStateChanged`-Listener feuert automatisch.

**Logout-Button:** in der Sidebar unten, ruft `auth.signOut()`.

**1.3 Settings-Tab** (neuer Tab im Nav)

Neuer Sidebar-Nav-Eintrag:

```html
<button class="nav-tab" data-tab="settings"><span class="sb-icon">⚙</span><span class="sb-label">Einstellungen</span></button>
```

Tab-Content (Tab `id="tabSettings"`):

- **Sektion "Allgemein":** Tagessoll (number input, Default `8.4`, Save → `appConfig.tagessoll`)
- **Sektion "Personen-Mapping":** Liste aller Personen aus `STATE.persons` mit Email-Feld pro Person (speichert in `personsData[name].email`). Osi pflegt das initial einmal.
- **Sektion "Mein Account":** zeigt eingeloggte E-Mail, Button "Abmelden"
- **(Etappe 2 ergänzt hier:** Sektion "Clockify")

Render-Funktion: `renderSettings()`.

**B1 Return-Type:** `void` (DOM-Mutation).
**B2 Null-Pfade:** Wenn `STATE.persons` leer → zeigt "Keine Personen angelegt" Hinweis.
**B3 Side-Effects:** Tagessoll-Speichern → `db.ref('ezcockpit/appConfig/tagessoll').set(value)`. E-Mail-Speichern → `db.ref('ezcockpit/personsData/' + name + '/email').set(value)`.

**1.4 Datenmodell-Listener ergänzen**

Neu im DB-Init-Block (nach den bestehenden Listenern):

```
db.ref(ROOT_NODE + '/projects').on("value", snap => {
  STATE.projects = snap.val() || {};
  if (typeof renderResourcePlanning === 'function') renderResourcePlanning();
});
db.ref(ROOT_NODE + '/personCapacity').on("value", snap => {
  STATE.personCapacity = snap.val() || {};
  if (typeof renderResourcePlanning === 'function') renderResourcePlanning();
});
db.ref(ROOT_NODE + '/effortEstimates').on("value", snap => {
  STATE.effortEstimates = snap.val() || {};
  if (typeof renderResourcePlanning === 'function') renderResourcePlanning();
});
db.ref(ROOT_NODE + '/appConfig').on("value", snap => {
  STATE.appConfig = snap.val() || { tagessoll: 8.4 };
  if (typeof renderResourcePlanning === 'function') renderResourcePlanning();
  if (typeof renderSettings === 'function') renderSettings();
});
```

Initial-STATE ergänzen:

```
STATE.projects = {};
STATE.personCapacity = {};
STATE.effortEstimates = {};
STATE.appConfig = { tagessoll: 8.4 };
```

#### Smoke-Test am Ende von Schritt 1

1. Login mit `osi@festivitas.space` → App lädt, Sidebar zeigt "⚙ Einstellungen"
2. Settings-Tab → Tagessoll auf `8.0` ändern → reload → Wert persistiert
3. Personen-Mapping: zwei E-Mails eintragen → Firebase-Console-Check: `personsData/Pascal/email` etc. gesetzt
4. Logout → Login-Screen
5. Login mit falscher Password → Error
6. Auth-loser DB-Zugriff (Inkognito): scheitert (Permission denied im Console)

### 2.2 — Schritt 2: Pivot-Tabelle + EZ-Seed

#### EZ-Seed-Data (einmalig, idempotent)

Eine Funktion `seedEzData()`, die idempotent läuft (prüft ob bereits geseedet ist via `appConfig.seeded === true`). Aufrufbar via Console oder Button im Settings-Tab ("EZ-Seed-Daten laden").

**Personen (8 aus Screenshot 1):**

```
STATE.persons = ["Pascal", "Salimata", "Sandro", "Josephine", "Anton", "Joël", "Mariam", "Saya"];
```

**Projekt-Hierarchie** (`projects/{id}` mit `parentId`, `type`, `title`, `order`):

```
p_internal       { type:"category",  title:"Internal",                 parentId:null, order:1 }
  p_int_admin    { type:"leaf",      title:"Admin",                    parentId:"p_internal", order:1 }
  p_int_team     { type:"leaf",      title:"Teammeeting, Weekly, Roundup", parentId:"p_internal", order:2 }
  p_int_anfrag   { type:"leaf",      title:"Kurzfristige Anfragen",    parentId:"p_internal", order:3 }
p_orga           { type:"category",  title:"Orga-Entwicklung",         parentId:null, order:2 }
  p_orga_fund    { type:"leaf",      title:"Funding (Fundraising + Aufträge)", parentId:"p_orga", order:1 }
  p_orga_event   { type:"leaf",      title:"Externe Events / Weiterbildung", parentId:"p_orga", order:2 }
  p_orga_komm    { type:"leaf",      title:"Kommunikation",            parentId:"p_orga", order:3 }
  p_orga_hr      { type:"leaf",      title:"HR, Teambuilding, Büro",   parentId:"p_orga", order:4 }
  p_orga_strat   { type:"leaf",      title:"Strategie / Retraiten, VS etc.", parentId:"p_orga", order:5 }
  p_orga_fin     { type:"leaf",      title:"Finanzen/Buchhaltung",     parentId:"p_orga", order:6 }
  p_orga_konz    { type:"leaf",      title:"Konzeption Formate",       parentId:"p_orga", order:7 }
  p_orga_intl    { type:"leaf",      title:"Internationalisierung",    parentId:"p_orga", order:8 }
  p_orga_inst    { type:"leaf",      title:"Institutionalisierung",    parentId:"p_orga", order:9 }
p_projekte       { type:"category",  title:"Projekte",                 parentId:null, order:3 }
  p_spaces       { type:"subcategory", title:"Spaces",                 parentId:"p_projekte", order:1 }
    p_sp_klima   { type:"space",     title:"Klima Scoping",            parentId:"p_spaces", order:1 }
    p_sp_demok   { type:"space",     title:"Demokratie Scoping & SGG", parentId:"p_spaces", order:2 }
  p_auftrage     { type:"subcategory", title:"Aufträge",               parentId:"p_projekte", order:2 }
    p_au_mint    { type:"auftrag",   title:"Sprint MINT",              parentId:"p_auftrage", offerierteTage:0, order:1 }
    p_au_policy  { type:"auftrag",   title:"Policy Brief",             parentId:"p_auftrage", offerierteTage:0, order:2 }
    p_au_fhch    { type:"auftrag",   title:"FH CH",                    parentId:"p_auftrage", offerierteTage:0, order:3 }
    p_au_innob   { type:"auftrag",   title:"Innobooster New Mobility", parentId:"p_auftrage", offerierteTage:0, order:4 }
    p_au_ttt     { type:"auftrag",   title:"Train-the-Trainer Studienstiftung", parentId:"p_auftrage", offerierteTage:0, order:5 }
    p_au_love    { type:"auftrag",   title:"Love Politics",            parentId:"p_auftrage", offerierteTage:0, order:6 }
    p_au_vis     { type:"auftrag",   title:"VIS Mission Salesx",       parentId:"p_auftrage", offerierteTage:0, order:7 }
```

**HINWEIS für die CLI:** `offerierteTage` bei Aufträgen ist initial 0 — Salimata pflegt das ein. NICHT raten, nicht aus dem Screenshot ableiten (Screenshot zeigt Personen-Tage, nicht Auftrags-Budget).

**Personen-Kapazität (Mai 2026 — plausibel aus Screenshot 1):**

`personCapacity/{name}/2026-05/`:

```
Pascal:    { arbeitstage:14.4, ferien:0,   kompensation:0   }
Salimata:  { arbeitstage:14.4, ferien:1,   kompensation:2   }
Sandro:    { arbeitstage:14.4, ferien:0,   kompensation:0   }
Josephine: { arbeitstage:14.4, ferien:0,   kompensation:1   }
Anton:     { arbeitstage:14.4, ferien:3.3, kompensation:1   }
Joël:      { arbeitstage:14.4, ferien:4,   kompensation:0   }
Mariam:    { arbeitstage:14.4, ferien:0,   kompensation:0   }
Saya:      { arbeitstage:14.4, ferien:1,   kompensation:1   }
```

**Effort-Estimates** initial leer — Salimata füllt das im Demo selbst oder Osi bereitet 2-3 Beispielzeilen vor.

**personsData-E-Mails** (Schritt 1.3 erledigt manuell durch Osi nach Firebase-Console-User-Anlage).

#### Pivot-Tabelle UI

**Neuer Tab "Aufwandsplanung"** im Sidebar (zwischen "Cockpit" und "Aufgaben"):

```html
<button class="nav-tab" data-tab="resourceplanning"><span class="sb-icon">📊</span><span class="sb-label">Aufwandsplanung</span></button>
```

**Render-Funktion `renderResourcePlanning()`:**

**Header-Zeile:**

- View-Toggle: `[Monat | Woche]`
- Einheit-Toggle: `[Stunden | Tage]`
- Navigation: `← Mai 2026 →` (Monat-View) oder `← KW 19-22 →` (Woche-View)
- Button: "Heute"

**Tabellen-Struktur** (sticky-left erste Spalte, scrollbar horizontal wenn nötig):

```
| Kategorie               | Pascal | Salimata | Sandro | ... | Σ |
|-------------------------|--------|----------|--------|-----|---|
| **KAPAZITÄT**           |        |          |        |     |   |
|   Arbeitstage           |  14.4  |   14.4   |  14.4  |     |   |  (editable)
|   Ferien & Abwesenheit  |   0    |    1.0   |   0    |     |   |  (editable)
|   Geplante Kompensation |   0    |    2.0   |   0    |     |   |  (editable)
|   Kapazität Total       |  14.4  |   11.4   |  14.4  |     |   |  (auto = arbeitstage - ferien - kompensation)
|   Kapazität Offen       | -0.6   |  -1.1    |  0.4   |     |   |  (auto = Total - Σ Aufwände, rot wenn <0)
|-------------------------|--------|----------|--------|-----|---|
| **Internal**            |        |          |        |     |   |  (collapsible category, expanded by default)
|   Admin                 |  1.0   |   1.0    |  1.0   |     |   |  (editable cell)
|   Teammeeting...        |  2.0   |   2.0    |  2.0   |     |   |
|   Kurzfristige Anfragen |  1.0   |   1.0    |  1.0   |     |   |
|-------------------------|--------|----------|--------|-----|---|
| **Orga-Entwicklung**    |        |          |        |     |   |
|   Funding...            |  3.0   |   3.0    |  3.0   |     |   |
|   ...                   |        |          |        |     |   |
|-------------------------|--------|----------|--------|-----|---|
| **Projekte**            |        |          |        |     |   |
|   ▼ Spaces              |        |          |        |     |   |  (sub-category)
|     Klima Scoping       |        |          |        |     |   |
|     ...                 |        |          |        |     |   |
|   ▼ Aufträge            |        |          |        |     |   |
|     Sprint MINT         |        |          |        |     |   |
|     ...                 |        |          |        |     |   |
```

**Zell-Verhalten:**

- Editable Zellen: `<input type="number" inputmode="decimal" min="0" step="0.1">` bei Klick, save onChange
- Kanonisch wird `hours` gespeichert; Tage-View konvertiert mit `tagessoll` aus `appConfig`
- Bei Monat-View: Eingabe in Zelle → gleichmäßig auf alle Wochen im Monat verteilen (analog `migrateExcelToWeekBudget` aus sb8)
- Bei Wochen-View: Eingabe direkt in `effortEstimates[person][weekKey][projectId].hours`

**Notiz-Feld pro Zelle:**

- Kleines Dreieck-Indicator (▴ oder ●) wenn Notiz existiert
- Klick auf Indicator öffnet kleinen Popover mit Textarea
- Speichert in `effortEstimates[person][weekKey][projectId].note`
- **HINWEIS:** Im Monat-View zeigt Notiz die Notiz der ERSTEN Woche des Monats (Vereinfachung; in Phase B verfeinerbar).

**Kollabierbare Kategorien:**

- Header-Zeile mit Pfeil ▼/▶ klickbar
- State persistiert in LocalStorage (`ez_collapsedCategories: [...]`) — pro User OK, weil Anzeige-Präferenz

**B1 Return-Type Helfer-Funktionen:**

- `getEffortHours(person, weekKey, projectId) → number` (0 wenn nicht gesetzt)
- `setEffortHours(person, weekKey, projectId, hours) → Promise<void>` (löscht den Knoten wenn `hours === 0`)
- `getWeeksInMonth(yearMonth: "YYYY-MM") → string[]` (Liste der Montag-Keys; eine Woche zählt zum Monat wenn ihr Montag im Monat liegt)
- `sumPersonProject(person, yearMonthOrWeek, projectId) → number` (Hours aus allen Wochen des Zeitraums)
- `personCapacityTotal(person, yearMonth) → number` (= arbeitstage - ferien - kompensation, in Tagen)
- `personCapacityOffen(person, yearMonth) → number` (= Total - Σ aller Aufwände aller Projekte, in Tagen via tagessoll-Konvertierung)

**B2 Null-Pfade:**

- Wenn `STATE.appConfig` undefined → fallback `{tagessoll: 8.4}`
- Wenn `personCapacity[person][month]` fehlt → Kapazitäts-Zeile zeigt "—" und Berechnung "Kapazität Offen" deaktiviert (Hinweis-Tooltip "Kapazität noch nicht gesetzt")
- Wenn `effortEstimates[person][weekKey]` fehlt → Zelle leer, 0 für Aggregat

**B3 Side-Effects:**

- Zell-Edit → schreibt zu `db.ref(ROOT_NODE+'/effortEstimates/'+person+'/'+weekKey+'/'+projectId+'/hours')`
- Kapazitäts-Edit → schreibt zu `db.ref(ROOT_NODE+'/personCapacity/'+person+'/'+yearMonth+'/'+field)`
- Notiz-Edit → schreibt zu `effortEstimates/.../note`

**B4 Anti-Patterns:**

- NICHT Tage als kanonische Einheit speichern (Tagessoll kann sich ändern, alte Daten würden brechen)
- NICHT Monat-View intern als eigenes Schema modellieren — IMMER Aggregat aus Wochen
- NICHT bei Monat-View "den ganzen Monat überschreiben" — wenn User Wert ändert, gleichmäßig verteilen aber bestehende Notizen erhalten
- NICHT inline-Eventhandler ohne `event.stopPropagation()` in kollabierbaren Headern (sonst kollabiert während Edit)

**B5 Consumer-Prüfung:**

- Nichts Bestehendes konsumiert `projects/`, `personCapacity/`, `effortEstimates/` heute → keine Side-Effects zu fürchten
- Personen-Liste-Änderungen (STATE.persons): UI re-rendern bei Listener-Update

#### Smoke-Test am Ende von Schritt 2

1. `seedEzData()` ausführen → 8 Personen, ~25 Projekte, Mai-Kapazität für alle 8
2. Pivot-Tabelle öffnen → Mai 2026, alle Personen-Spalten, alle Kategorien-Zeilen sichtbar
3. Salimatas Zelle "Admin": `1.0` eingeben → speichern → Reload → persistiert
4. View-Toggle "Woche" → Mai zeigt KW 18 / KW 19 / KW 20 / KW 21 — der `1.0` aus Schritt 3 ist auf die Wochen verteilt (je `0.25` oder ähnlich)
5. View-Toggle "Tage" → Werte werden über Tagessoll umgerechnet
6. Settings → Tagessoll auf `8.0` → zurück zu Aufwandsplanung → Werte in Tage-View geändert
7. Pascal Mai Arbeitstage `14.4` → Kapazität Total `14.4`, Kapazität Offen rechnet automatisch
8. Notiz an einer Zelle setzen → Indicator erscheint → Reload → persistiert
9. Kategorie "Internal" einklappen → Reload → State persistiert

### 2.3 — Schritt 3: Querschnitt + Rentabilitäts-Liste + Polish

#### Querschnitts-View "Diese Woche / Nächste Woche"

Im Cockpit-Tab (Dashboard) neue Sektion: **"Auslastung dieser Woche"**

Render-Funktion: `renderWeekloadCockpit()`. Zeigt eine kompakte Tabelle:

```
| Person    | Soll diese Woche | Soll nächste Woche | Status |
|-----------|------------------|--------------------|----|
| Pascal    | 3.6 d            | 2.8 d              | ✓  |
| Salimata  | 4.1 d            | 5.2 d              | ⚠  |  (>Wochen-Kapazität)
| ...       |                  |                    |    |
```

**Wochen-Kapazität pro Person** = `personCapacityTotal(person, currentMonth) / weeksInMonth.length` (Vereinfachung Phase A).

Ampel:

- ✓ grün: < 90% der Wochen-Kapazität
- ⚠ gelb: 90-110%
- 🔴 rot: > 110%

Klick auf Person-Zeile → springt zu Aufwandsplanung-Tab, gefiltert auf diese Person (optionales `?focus=Pascal`-URL-Param, OR Tab-State).

#### Auftrags-Rentabilitäts-Liste

Im Cockpit-Tab neue Sektion: **"Aufträge — Rentabilität"**

Render-Funktion: `renderAuftragsRentabilitaet()`. Zeigt nur Projekte mit `type === "auftrag"`:

```
| Auftrag                  | Offeriert | Geplant Σ | Geleistet Σ | Status |
|--------------------------|-----------|-----------|-------------|--------|
| Sprint MINT              |  10 d     |  4.5 d    |  0.0 d      | 🟢 45% |
| Policy Brief             |   5 d     |  2.0 d    |  0.0 d      | 🟢 40% |
| FH CH                    |  20 d     | 12.5 d    |  3.2 d      | 🟡 78% |
| Innobooster New Mobility |  10 d     | 11.0 d    |  0.0 d      | 🔴 110%|
| ...                      |           |           |             |        |
```

Berechnung:

- **Offeriert** = `projects[id].offerierteTage` (manuell von Salimata gepflegt)
- **Geplant Σ** = Summe `effortEstimates[*][*][projectId].hours` über ALLE Wochen / `tagessoll`
- **Geleistet Σ** = Summe `timeEntries[].hours` wo `projectId === id` ODER `streamId` linkt zu Projekt / `tagessoll`
- **Status** = (Geplant + Geleistet) / Offeriert
  - 🟢 ≤ 80%
  - 🟡 80-100%
  - 🔴 > 100%

**HINWEIS Etappe 2:** Geleistet wird in Etappe 1 manuell — Salimata pflegt entweder im Arbeitszeit-Tab Stunden mit `projectId`, oder die Zahl ist erstmal 0. In Etappe 2 kommt Clockify-Auto-Sync und füllt das automatisch.

**Klick auf Auftrag** → öffnet Modal mit Aufschlüsselung pro Person (welche Person bringt wie viele geplante/geleistete Tage in den Auftrag ein).

#### Polish

- **Aufwandsplanung-Tab als Sidebar-Default für Salimata:** wenn `currentPersonName === "Salimata"` → Default-Tab = "resourceplanning" statt "cockpit". (Soft-Feature, niedrige Priorität.)
- **Sidebar zeigt aktuell eingeloggte Person:** unter dem Logout-Button steht der Name.
- **Footer-Version-Update:** `vX.Y.Z` an drei Stellen (siehe PROJEKT_ANWEISUNGEN §13).

#### Smoke-Test am Ende von Schritt 3

1. Login als Salimata → öffnet auf Aufwandsplanung-Tab
2. Cockpit-Tab → "Auslastung dieser Woche" zeigt alle 8 Personen
3. Auftrags-Rentabilitäts-Liste zeigt alle 7 Aufträge, alle 0% (weil noch keine offerierteTage gepflegt)
4. In Aufwandsplanung: Salimata 5h in "Sprint MINT" Mai eintragen → Rentabilität "Sprint MINT" zeigt 5h/Tagessoll Tage in "Geplant Σ"
5. Im Projects-Modal (TBD: minimal — kann auch via Firebase-Console für Phase A) `offerierteTage` für "Sprint MINT" auf 10 → Rentabilität rechnet auf 10 d × 0.5 = 50%
6. Auslastung Salimata diese Woche zeigt 5h / Tagessoll → Wochen-Anteil

#### Version-Bump

`v0.2.0.YYYY-MM-DD` an drei Stellen:

- `<meta name="app-version" content="0.2.0">`
- `const APP_VERSION = "0.2.0";`
- Footer: `Expedition Zukunft · Cockpit · v0.2.0`

---

## 🚦 COMMIT-POINT — VERSION 0.2.0 LIVE

**Hier ist Etappe 1 fertig.** App ist deployed, Salimata kann sich einloggen und ihren Workflow live ausprobieren. Pitch-Demo eigenständig.

Vor Etappe 2:

- ✅ Smoke-Test alle 9 Punkte aus den 3 Schritten durchgehen
- ✅ Salimata-Preview-Call: URL teilen, Login-Daten teilen, 15min beobachten lassen
- ✅ Feedback aufnehmen (kann Etappe 2 schärfen)
- ✅ `MASTER.md` Sessions-Tabelle: S3 (CLI) eintragen
- ✅ Backlog-Updates: BL-005 (Seed) erledigt, neue BLs für offene Punkte aus Salimata-Feedback

Erst danach → Etappe 2.

---

## 3 · Etappe 2 — Clockify Auto-Sync + Notion-Bridge-Stub

**Ziel:** Clockify-API echt mit Auto-Sync. Auftrags-Rentabilität wird "echt" — Salimata sieht ihre realen Clockify-Stunden im Cockpit.

**Voraussetzung:** Etappe 1 abgeschlossen, `v0.2.0` deployed.

### 3.1 — Schritt 1: Worker-Endpoint /clockify/* + Cron-Trigger

#### Cloudflare-Worker erweitern

Bestehender Worker (`zfsg-proxy.workers.dev` analog) erweitern. **Annahme:** EZ hat eigenen Worker (`ez-proxy.workers.dev` oder ähnlich). Wenn nicht, neu deployen (Free Tier).

**Worker-Code** (TypeScript/JavaScript) ergänzt um:

```
// Endpoint: /clockify/workspaces
//          /clockify/workspaces/{wsId}/projects
//          /clockify/workspaces/{wsId}/user/{userId}/time-entries?start=...&end=...
// Auth: API-Key als Worker-Secret CLOCKIFY_API_KEY
// Returns: 1:1 Clockify-Response, CORS-Headers gesetzt
```

**B1 Worker-Return-Types:**

- 200 OK + JSON-Body (Clockify-Response) bei Success
- 401 wenn Worker-Secret fehlt oder Clockify auth fails
- 4xx/5xx Pass-Through bei Clockify-Fehler

**B2 Null-Pfade:**

- Worker-Secret fehlt → 500 mit Hinweis "CLOCKIFY_API_KEY not set"
- Clockify rate-limit (429) → Pass-Through, Frontend zeigt "rate-limited, retry später"

**B3 Side-Effects:**

- KEINE Persistierung im Worker. Stateless Proxy.
- Logging optional (Cloudflare-Console)

**B4 Anti-Pattern:**

- NICHT Clockify-API-Key im Frontend-Code. Immer Worker-Secret.
- NICHT Wildcard-CORS in Production. Restrict auf `https://[ez-cockpit-domain]`.

#### Cron-Trigger einrichten

Cloudflare-Worker `wrangler.toml` (oder Web-UI):

```toml
[triggers]
crons = ["0 */2 * * *"]   # alle 2 Stunden
```

**Cron-Handler** (im Worker):

```
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduledSync(event))
})
```

`handleScheduledSync`:

1. Liest alle aktiven EZ-Mappings aus Firebase REST (`https://[firebase-url]/ezcockpit/clockifyConfig.json?auth=[adminToken]`)
2. Pro Mapping: pullt TimeEntries der letzten 7 Tage von Clockify
3. Schreibt nach Firebase REST in `timeEntries/`, mit Dedupe via `clockifyEntryId`

**Wichtig:** Worker braucht eigenen Firebase-Admin-Token (Worker-Secret `FIREBASE_ADMIN_TOKEN`). Setup-Anweisungen für Osi:

- Firebase Console → Service Accounts → Generate new private key (JSON)
- Daraus Custom Token generieren (oder ServiceAccount-Auth verwenden)
- Als Worker-Secret hinterlegen

**B4 Anti-Pattern (kritisch!):**

- Cron-Sync darf nur die LETZTEN N Tage pullen (default 7), nicht die gesamte Clockify-Historie jede 2h.
- Dedupe ist Pflicht. Sonst dupliziert sich `timeEntries/` mit jedem Sync-Lauf.

### 3.2 — Schritt 2: Settings-Modal + Mapping + Manual-Sync

#### Settings-Tab erweitert um "Clockify"-Sektion

In `renderSettings()` neue Sektion:

```
**Clockify-Integration**
- Status: [verbunden] | [nicht verbunden]
- API-Key: [____] (write-only Input, zeigt "***" wenn gesetzt)
  → Speichert verschlüsselt? Nein, einfach in clockifyConfig.apiKey
    (Phase B: Worker-only, Frontend sieht Key nie)
  ALTERNATIVE Phase-A-sicher: Key NUR in Worker-Secret hinterlegen, Frontend hat keinen direkten Zugriff
- Workspace: [Dropdown, lädt aus Clockify via Worker]
- Person-Mapping:
    Pascal → [Clockify-User-Dropdown]
    Salimata → ...
- Projekt-Mapping:
    Sprint MINT (EZ) → [Clockify-Projekt-Dropdown]
    ...
- Button: "Jetzt synchronisieren" (Manual-Sync, gleiche Logik wie Cron)
- Letzter Sync: [Timestamp]
```

**Datenmodell** `clockifyConfig/`:

```jsonc
{
  "workspaceId": "abc123",
  "personMapping": {
    "Pascal": "clockify-user-id-1",
    "Salimata": "clockify-user-id-2"
  },
  "projectMapping": {
    "p_au_mint": "clockify-project-id-1",
    "p_au_policy": "clockify-project-id-2"
  },
  "lastSync": "2026-06-05T14:00:00Z"
}
```

**B5 Consumer-Prüfung:**

- Wer schreibt `timeEntries/`? Heute: Arbeitszeit-Tab manuell. Neu: Cron + Manual-Sync.
- Konflikt: User trägt Eintrag manuell ein → Cron pullt Clockify → Doppel-Eintrag?
- LÖSUNG: TimeEntry bekommt `source` ("manual" | "clockify"), und Clockify-Einträge haben `clockifyEntryId` als Dedupe-Key. Manual und Clockify-Einträge koexistieren — User-Verantwortung, das nicht doppelt zu erfassen.

#### Manual-Sync-Button

Frontend-Logik:

```
async function manualClockifySync() {
  // 1. Read clockifyConfig
  // 2. For each person mapping: GET /clockify/.../time-entries last 14 days
  // 3. For each entry: check if clockifyEntryId already in STATE.timeEntries
  //    if not: write to db.ref('timeEntries/<newId>') with source:"clockify", clockifyEntryId, projectId (via mapping)
  // 4. Update clockifyConfig.lastSync
  // 5. Show toast "X new entries imported"
}
```

**B1 Return-Type:** `Promise<{ added: number, skipped: number, errors: string[] }>`
**B2 Null-Pfade:** Wenn Mapping fehlt für eine Clockify-Person/Projekt → Eintrag wird "skipped" mit Log.
**B3 Side-Effects:** Schreibt zu `timeEntries/`, updated `clockifyConfig.lastSync`.

### 3.3 — Schritt 3: Auftrags-Rentabilitäts-Auto + Polish

#### TimeEntry → projectId verdrahten

Bestehende `timeEntries` haben heute `taskId` (optional) und `streamId` (optional). Wir ergänzen:

- `timeEntries[].projectId` (optional, neu)

In `renderAuftragsRentabilitaet()`:

- "Geleistet Σ" = Summe `timeEntries[].hours` wo `projectId === auftragId` / `tagessoll`
- Clockify-importierte Einträge bekommen `projectId` direkt aus Mapping
- Manuelle Einträge: Salimata kann optional `projectId` setzen im TimeEntry-Modal (neues Dropdown)

#### TimeEntry-Modal erweitern

Bestehendes `timeEntryModal` (Zeile 9441 im EZ-Cockpit) bekommt ein Dropdown:

- "Projekt": Liste aller Projects mit `type` in `["leaf", "space", "auftrag"]`, gruppiert nach Kategorie

#### Polish

- **Sync-Status in Header:** kleines 🔄-Icon das letzte Sync-Zeit anzeigt
- **Toast/Banner bei Cron-Sync-Fehler:** wenn `clockifyConfig.lastSyncError` gesetzt → Banner oben

#### Version-Bump

`v0.2a.YYYY-MM-DD`.

#### Smoke-Test am Ende von Etappe 2

1. Settings → Clockify-Workspace verbinden → Person/Projekt-Mapping pflegen
2. Manual-Sync → einige TimeEntries werden importiert, sichtbar in Arbeitszeit-Tab mit Source "clockify"
3. Cockpit-Tab → Auftrags-Rentabilität zeigt jetzt echte "Geleistet" Werte
4. Cron-Test: 2h warten oder Cron manuell triggern via Cloudflare-Console → neue Entries kommen
5. Doppelt-Sync: Manual-Sync zweimal hintereinander → 0 neue (alle dedupliziert)
6. Mapping-Lücke: Clockify-Projekt ohne Mapping → in Toast als "skipped" sichtbar

---

## 4 · B6 Code-Reality-Check (verbindlich vor jedem Schritt)

**Vor jedem Sub-Schritt (1.1, 1.2, ...) macht die CLI:**

1. `git pull` — neuesten Stand holen
2. `wc -l ez-cockpit.html` — File-Größe checken
3. Anker aus dem Schritt im Code grep'en (`grep -n "renderResourcePlanning\|projects\|effortEstimates" ez-cockpit.html`)
4. Wenn Funktion bereits existiert → STOP, eskalieren (möglicherweise hat ein paralleler Lauf was angelegt)
5. Wenn ein erwarteter Anchor fehlt (z.B. `ANTHROPIC_PROXY_URL` ist noch Placeholder `REPLACE-...`) → STOP, eskalieren
6. Wenn `STATE.appConfig` nicht im Listener gefunden → das Datenmodell aus Schritt 1.4 ist noch nicht da → in richtiger Reihenfolge arbeiten

**Vor dem ersten Patch der Session:**

- Verifizieren dass `v0.1b` oder höher deployed ist (Footer-Check)
- Verifizieren dass die Firebase-Console-Schritte aus 2.1 von Osi gemacht wurden (Authentication-Tab in Firebase Console nicht leer)

**Nach jedem Schritt:**

- Smoke-Test laut Briefing
- Commit mit Message-Schema: `S3.X.Y: <kurz>` (z.B. `S3.1.1: auth layer + login screen`)
- Push

**Bei Unklarheit:**

- Lieber rückfragen via PROJEKT_ANWEISUNGEN §11 Eskalation als raten
- Strategie-Chat hat dieses Briefing geschrieben, wird Rückfragen klären

---

## 5 · Open Points (bewusst nicht in diesem Briefing)

Diese Punkte sind erkannt, aber NICHT Teil von Etappe 1/2 — werden als Phase-B-BLs aufgenommen:

| Punkt | Wann | Wie |
|---|---|---|
| Notion-Tasks read-only Sync | Phase B nach Salimata-Discovery | Notion API + Token + Project-Mapping. Alternative: Tasks in Cockpit pflegen. Salimata-Entscheid offen. |
| Granulare Security Rules | Phase B | Pro Knoten: nur eigene Daten editierbar, alles lesbar. Erst nach Auth-Stabilisierung. |
| Linsen-System (sb8) | Phase B+ | sb8-Port wenn Salimata es anfragt. Customer-agnostisch nutzbar. |
| Spesen, Geld-Monitoring | Phase C | Wenn Pilot läuft. Aktuell nicht im EZ-Need-Set. |
| Workpackages (sb8) | Phase B+ | Alternative Hierarchie quer zu projects/. EZ braucht heute keine. |
| Schätzfehler-Historie | Phase C | Track of "geschätzt vs. ist" pro Person × Projekt über Zeit. |
| Auto-Eskalation bei Überbuchung | Phase C | Slack/E-Mail wenn Kapazität Offen > 0 für Woche X. |

---

## 6 · Lieferungs-Definition (für die CLI)

Etappe 1 ist abgeschlossen wenn:

- ✅ Login mit E-Mail/Passwort funktioniert für Salimata + Osi
- ✅ Settings-Tab editierbar, Tagessoll persistiert
- ✅ Aufwandsplanung-Tab zeigt Pivot-Tabelle mit allen 8 Personen × Kategorien-Hierarchie
- ✅ Eingabe in Zelle → Speichern → Reload → persistiert
- ✅ View-Toggle Monat/Woche und Stunden/Tage funktionieren
- ✅ Kapazität-Offen-Zeile rechnet automatisch
- ✅ Notiz-Feld pro Zelle
- ✅ Cockpit-Tab zeigt "Auslastung dieser Woche" + "Auftrags-Rentabilität"
- ✅ `v0.2.0` an 3 Stellen
- ✅ Smoke-Test bestanden
- ✅ Push zu GitHub

Etappe 2 ist abgeschlossen wenn:

- ✅ Manual Clockify-Sync funktioniert (User-Aktion)
- ✅ Cron-Auto-Sync läuft alle 2h ohne Fehler
- ✅ Dedupe via clockifyEntryId verifiziert
- ✅ Auftrags-Rentabilität zeigt echte Geleistet-Werte aus Clockify
- ✅ `v0.2a` an 3 Stellen
- ✅ Smoke-Test bestanden
- ✅ Push zu GitHub

---

*EZ Cockpit · Briefing S2 · 2026-06-05 · Osi + Claude Strategie-Chat*
