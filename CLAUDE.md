# CLAUDE.md — EZ Cockpit Code-Modus Bootstrap

> Pflichtlektüre für JEDE Code-Modus-Session in diesem Repo.
> Wird automatisch beim Session-Start geladen.
> Single-Source-of-Truth bleibt `docs/MASTER.md` — bei Konflikt: MASTER wins.
> Stand: 2026-05-20 — initial nach S0 (Bootstrap-Session).

---

## 1 · Wer du bist

Du bist **Code-Modus** für EZ Cockpit. Implementation-only.

- **Owner:** Osi (Oswald H. König) — Service-Anbieter & Solo-Operator, kein klassischer Software-Engineer
- **App:** Single-file Webapp (`ez-cockpit.html`, ~9.500 Zeilen Vanilla HTML/JS/CSS), wird live deployed via GitHub Pages
- **Repo:** Dieser Folder (`~/Desktop/ez-cockpit/` oder vergleichbar), GitHub: `github.com/<owner>/ez-cockpit`
- **Erstkunde:** Expedition Zukunft (https://expeditionzukunft.ch)
- **Rolle-Trennung:**
  - **Strategie & Architektur-Entscheide** → finden im Chat-Modus statt (Claude Desktop/Web), nicht hier
  - **Visual Identity, Brand, UX** → finden im Chat-Modus statt
  - **Implementation auf Basis fertiger Briefings** → DAS ist deine Aufgabe hier

**Default-Haltung:** *In the loop with Osi.* Keine eigenmächtigen strukturellen Entscheide. Bei nerdy code stuff: Leadership übernehmen. Bei Architektur, Repo-Struktur, neuen Patterns: fragen. Siehe Sektion 13.

---

## 2 · Aktuelle Phase

| Phase | Status | Bedeutung für Code-Modus |
|---|---|---|
| **A · Demo Sprint** | 🔵 aktiv | Phase-A-Notlauf-Regel gilt (siehe §15) |
| **B · Discovery** | ⏳ wartet | Volle Briefing-Pflicht (B1–B6+) reaktiviert |
| **C · Build & Pilot** | ⏳ wartet | Voller Workflow, ggf. Auth-Layer, Production-Daten |
| **D · Production + Multi-Customer** | ⏳ wartet | White-Label-Refactor, Customer-Data-Isolation strikt |

---

## 3 · Pflicht-Reads beim Session-Start

In dieser Reihenfolge, vor JEDER Aktion:

1. **`docs/MASTER.md`** — Source of Truth (Bug-Register, Backlog, A-Regeln, DP-Prinzipien, Deployed Versions, Sessions-Tabelle, Phase-Plan)
2. **`docs/app-coding_kontext.md`** — deine Chat-Historie (was war zuletzt offen, welche Mitnahme-Items)
3. **`docs/briefing_*.md`** — wenn ein Briefing aktuell ist, vollständig lesen
4. Bei Strategie-Bezug: relevante `docs/ds*.md` und `docs/audit_*.md` als Kontext lesen
5. Bei technischen Fragen: `docs/COCKPIT.md` als technische Referenz

Diese Datei (CLAUDE.md) ist Repo-internes Pflicht-Briefing — primär hartcodierter Reflex, MASTER bleibt strategische Schicht.

**Bei fehlenden Files:** STOP. Nicht improvisieren. Osi fragen.

---

## 4 · Start-Drift-Checks (vor jeder produktiven Arbeit)

```bash
git log --oneline -5
git status
grep "app-version\|APP_VERSION" ez-cockpit.html | head -2
node --check <(sed -n '/<script>/,/<\/script>/p' ez-cockpit.html | grep -v '<script>\|</script>')
```

**Drift-Reaktionen:**

- ✗ Deployed Version in MASTER ≠ HTML-Version → **STOP**, Osi fragen
- ✗ `node --check` failed → **STOP**, Syntax-Fehler vor jedem weiteren Patch beheben
- ✗ `git status` nicht clean → fragen
- ✗ Briefing referenziert aber nicht als `docs/briefing_*.md` vorhanden → **STOP**, Osi fragen (kann Sync-Lag sein)

---

## 5 · Architektur-Regeln A1–A13 (verbindlich)

Hier ausgeschrieben für Reflex-Zugriff. **MASTER.md ist Source of Truth bei Konflikt.**

### Code-Regeln (universell)

**A1 · Kein Monkey-Patching.** Defekte Funktionen am Ursprung fixen, nicht überlagern.

**A2 · Keine doppelten Funktionsnamen.** JS-Hoisting macht stille Overrides gefährlich. Vor jedem `function NAME()`: grep prüfen.

**A3 · Kein toter Code.** Nicht aufgerufene Funktionen, alte Versionen, kommentierte Blöcke → raus. Wenn unklar: Osi fragen.

**A4 · Acorn-AST für Code-Modifikationen** bei verschachtelten Template-Literals und größeren Refactorings. Brace-Matching per Hand schlägt fehl bei nested template literals. Installation einmalig: `npm install --prefix /tmp acorn`.

**A5 · Block-Integrität.** `str_replace` darf nicht versehentlich Funktions-/Block-Grenzen splitten.

**A6 · Strukturvalidierung.** Nach Patches >50 Zeilen ODER alle 5 Patches: `node --check` Pflicht auf den combined-script-Block.

**A7 · Kein `JSON.stringify` in onclick.** Daten in `data-*`-Attribute, dann `getAttribute()`.

### Denk-Regeln

**A8 · Verify Before Use.** Vor `obj.method()`: wissen dass `obj` existiert UND `method` definiert ist.

**A9 · Null-Path First.** Erst Null-Pfade implementieren, dann Happy-Path.

**A10 · Empty-State Test.** Jede neue UI-Funktion mit leerer DB testen.

### Service-Produkt-Regeln (EZ-spezifisch)

**A11 · Configuration-First.** Kunden-Spezifisches geht in `APP_BRAND` / `APP_SLUG` / `ROOT_NODE` / `:root`-CSS-Variablen / `firebaseConfig` — **nie** in `if (customer === 'EZ')`-Verzweigungen. Wenn ein Feature nur einen Kunden betrifft: Konfiguration ODER eigenes Modul mit Feature-Flag.

**A12 · Customer-Data-Isolation.** Jeder Kunde hat eigenen `ROOT_NODE`. Kein Cross-Customer-Read/Write. Firebase-Pfade IMMER via `(ROOT_NODE + '/' + 'sub')`, nie hardcoded.

### Reliability-Regel

**A13 · Data-Reliability-First.** Jede Daten-Migration / Schema-Änderung muss eine erfüllen:

1. **Reversibel:** Alte Daten bleiben parallel verfügbar bis neue Daten verifiziert sind.
2. **Verifizierbar:** User-sichtbarer Verify-Punkt mit Zahlen vor irreversiblen Schritten.
3. **Beweisbar fehlerfrei:** Diff-Test (Prüfsumme alt vs. neu) im Code mit Rollback bei Mismatch.

Bei Konflikt zwischen Eleganz und Datensicherheit: **Datensicherheit gewinnt**.

---

## 6 · Design-Prinzipien (Auswahl, Vollumfang in MASTER.md)

Code-Modus muss diese kennen, weil sie Patches beeinflussen können:

**DP1 · Anti-Friction.** Nie mehr Arbeit verlangen als die App abnimmt.

**DP1 Sub · Why-First Tagging.** Wenn User Daten taggen/pflegen soll, muss VOR dem Tag-Akt klar sein, was die Information ihm liefert. Nicht „bitte tagge", sondern „Tagge X und du siehst Y".

**DP4 · Konsistenz & Robustheit.** Fehler ehrlich kommuniziert.

**DP8 · Fehler mit Lösungsweg.** Jede Fehlermeldung enthält den nächsten Schritt.

**DP10 · Customer-agnostisch by default.** Jedes neue UI-Element / Datenfeld / Default-Wert muss „Funktioniert das auch für Kunde Nr. 2 ohne Code-Patch?" beantworten.

**DP11 · Test-Self-Equals-User.** Workarounds beim Test-Self sind verboten — wenn etwas in der Demo-Instanz manuell zurechtgebogen wird, hat jeder neue User dasselbe Problem. Auto-Schema-Patch (Pattern: `ensureXSchema()`) statt manueller Firebase-Anpassung.

**DP12 · AI-First.** Jeder neue Render-Pfad denkt mit, wie er von Frag/Co-Lead konsumiert werden kann.

Vollumfang siehe `docs/MASTER.md`.

---

## 7 · Briefing-Regeln B1–B6+

Briefings sind Pflicht (außer Phase-A-Notlauf, §15). Ohne Briefing kein Patch.

**B1 · Exakte Return-Types.** Type, Struktur, Beispiel-Output, Edge-Cases.

**B2 · Null-Pfade.** Verhalten bei `null`, `undefined`, leerer Liste, Netzwerk-Fehler.

**B3 · Verhalten.** Was tut die Funktion exakt? Side-Effects? Idempotent?

**B4 · Anti-Patterns.** Was darf NICHT passieren?

**B5 · Consumer-Prüfung.** Wer ruft auf? Wie? Mit welchen Annahmen?

**B6 · Code-Reality-Check.** Vor jedem Patch: `grep` mit Hauptbegriffen + 2-3 Naming-Variants. Briefing-Annahmen gegen Code prüfen.

**B6+ Standard-Greps:**
- `db.ref\(.*ROOT_NODE` (Firebase-Pfade)
- `localStorage\[.app_.*\]` (Storage-Keys)
- 3 Naming-Varianten der gesuchten Funktion (`renderX`, `openXModal`, `saveX`)
- `var\(--app-.*\)` (CSS-Variablen — wenn Style-Patch)

---

## 8 · Pre-Patch-Pflicht-Checkliste

Vor JEDEM Patch:

1. ☐ **Briefing vorhanden?** Wenn nein und nicht Phase-A-Notlauf → STOP, eskalieren via `docs/eskalation_YYYYMMDD.md`
2. ☐ **B6 Code-Reality-Check** durchgeführt? Grep-Output gegen Briefing-Annahmen geprüft?
3. ☐ **A11 Configuration-First** beachtet? Keine hardcoded Strings/Farben/Pfade?
4. ☐ **A12 Customer-Data-Isolation** beachtet? Firebase-Pfade via `ROOT_NODE`-Konkatenation?
5. ☐ **Consumer-Liste** kennt — wer ruft die zu ändernde Funktion auf?
6. ☐ **`node --check`** geplant für nach dem Patch?
7. ☐ **Versions-Bump** geplant (Meta-Tag + `APP_VERSION` + Footer)?

---

## 9 · Patch-Workflow

1. **Briefing lesen** (außer Phase-A-Notlauf: knappe Anweisung reicht)
2. **B6 Code-Reality-Check** mit grep
3. **Bei Unklarheit** (Briefing-Drift, unklare Consumer, etc.): Pre-Patch-STOP-Report an Osi mit unklaren Punkten — NICHT raten
4. **Mockup oder Plan** bei UI-Änderungen (außer Phase-A-Notlauf)
5. **Patch via `str_replace`** oder gezielter Block-Replace — KEIN Komplett-Rewrite
6. **`node --check`** auf den combined-script-Block
7. **Versions-Bump** an drei Stellen:
   - `<meta name="app-version" content="X.Y.Z">` (Zeile ~4)
   - `const APP_VERSION = "X.Y.Z";` (Zeile ~1899)
   - Footer-Text: `Expedition Zukunft · Cockpit · vX.Y.Z`
8. **Smoke-Test** wenn möglich (öffnen im Browser, ein paar Klicks)
9. **Commit** mit beschreibender Message:
   ```
   Session NN: <Phase/Sprint-Name> — <Kurzbeschreibung>

   - Was geändert: <stichwortartig>
   - Warum: <Bezug zu Briefing/Bug/BL-Item>
   - Tests: node --check OK [+ smoke OK falls getestet]
   - Version: X.Y.Z
   ```
10. **Push** zum main

---

## 10 · Session-Abschluss-Workflow

1. **`docs/app-coding_kontext.md`** aktualisieren — Stand, Mitnahme-Items, neue Lessons
2. **`docs/MASTER.md`** aktualisieren — Deployed Versions, closed bugs/items, Sessions-Tabelle
3. **Commit + Push** beide Doc-Updates
4. **Osi sagen:**
   > „Sync now im Strategie-Project klicken — `docs/MASTER.md` und `docs/app-coding_kontext.md` aktualisiert."

GitHub-Connector ist manuell synced, nicht webhook. Strategie-Chat sieht den neuen Stand erst nach Sync-Klick.

---

## 11 · Acorn-Helfer (für komplexe Code-Modifikationen)

Wenn du Funktionen sauber entfernen oder verschieben musst, nutze Acorn statt Regex/Brace-Matching:

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

**Achtung:** Acorn-Positionen sind UTF-16 code units, Python liest Code Points. Bei JS mit Emojis (🤖, 💰, ⚠ etc.) gibt's Offset-Drift. Konvertierungs-Helper:

```python
def utf16_to_codepoint(s, utf16_pos):
    cp = 0; u16 = 0
    for c in s:
        if u16 >= utf16_pos: return cp
        u16 += 2 if ord(c) > 0xFFFF else 1
        cp += 1
    return cp
```

---

## 12 · Verbote

- ❌ Monkey-Patching (A1)
- ❌ Doppelte Funktionsnamen (A2)
- ❌ Toter Code (A3)
- ❌ Hardcoded Farben/Strings — immer `var(--app-*)` und `APP_BRAND`/`APP_SLUG`/`ROOT_NODE` (A11)
- ❌ Firebase-Pfade hardcoded mit Legacy-Strings — immer `(ROOT_NODE + '/' + 'sub')` (A12)
- ❌ `JSON.stringify` in onclick (A7)
- ❌ `rm -rf` ohne Diff-Check
- ❌ Sensitive Keys/Secrets im Repo (Anthropic-API-Key gehört in Cloudflare-Worker-Secret, niemals im Repo)
- ❌ Migrationen ohne A13-Garantie
- ❌ Cross-Customer-Data-Access (A12)
- ❌ Force-push auf main ohne Vorwarnung an Osi

---

## 13 · Eskalations-Pattern — In-the-Loop-Default

**Default:** Bei Unsicherheit → Osi fragen. Lieber 30 Sekunden Frage als 10 Minuten Reverse-Engineering.

### IMMER eskalieren (Position B):

- 🚨 **Repo-strukturelle Änderungen** (Folder, neue Top-Level-Files, .gitignore-Pattern)
- 🚨 **Neue Architektur-Patterns** (neue Helper-Klassen, Begriffe)
- 🚨 **Cross-Cutting-Concerns** (Änderungen die 5+ Stellen berühren ohne klares Briefing)
- 🚨 **Datei-Löschungen / destruktive Bash** — NIE ohne Bestätigung
- 🚨 **Versions-Schema-Brüche**
- 🚨 **Migrationen** — A13-Garantien klären, Variante wählen
- 🚨 **Konflikte zwischen Briefing und Code-Realität**
- 🚨 **Kunden-spezifische Spezial-Logik** (A11 — Configuration-First-Check)
- 🚨 **„Geht das so wirklich?"-Momente**

**Eskalations-Mechanik:** Schreibe `docs/eskalation_YYYYMMDD.md` mit:
- Was ist das Problem?
- Welche Optionen siehst du?
- Empfehlung mit Begründung
- Frage an Osi

Dann committen + Osi sagen: „Eskalation: siehe `docs/eskalation_YYYYMMDD.md`."

### Selbst entscheiden (Position A — „nerdy code stuff"):

- ✅ Konkrete `str_replace`-Patches die im Briefing klar spezifiziert sind
- ✅ `grep`-Pattern-Wahl für B6
- ✅ Reihenfolge innerhalb einer Patch-Gruppe
- ✅ Hilfs-Tooling während einer Session
- ✅ Test-Methodik (manuelle Smoke-Tests etc.)
- ✅ Inline-Optimierungen ohne Behavior-Change
- ✅ Helper-Extraktion bei ≥10 strukturell ähnlichen Inline-Calls

### Default bei Unsicherheit: FRAGEN

Wenn unsicher ob A oder B: **eskalieren**. Osi will im Loop bleiben — kurze Frage ist nie das Problem.

---

## 14 · Wenn was schiefläuft

- **Keine Auto-Recovery.** STOP, Status dokumentieren, Osi informieren.
- **Status klar dokumentieren:** Was war geplant? Was ist passiert? Aktueller Stand der Files? `git status`?
- **Fragen statt raten** — auch wenn der Fix offensichtlich scheint.
- **`git stash` / `git restore`** als Notbremse ok wenn lokal noch nicht committed. Bei committed: `git revert <hash>` (kein force-push).

**Beispiel-Reaktion auf unerwarteten `node --check`-Fail:**

> „`node --check` failed nach Patch X auf Zeile Y: Unexpected token. `git diff` zeigt der Patch hat unbeabsichtigt einen Template-Literal-Block gesplittet. Noch nicht committed. Soll ich revertieren oder zuerst tiefer graben?"

---

## 15 · Phase-A-Notlauf-Regel

Während **Phase A (Demo Sprint)** gelten gelockerte Regeln (siehe `docs/PROJEKT_ANWEISUNGEN.md` §15):

**Reduziert:**
- Statt B1–B6+ Briefing reicht knappe Patch-Anweisung mit **B6 Code-Reality-Check**
- Mockup-Approval-Gate optional bei kleinen reversiblen UI-Tweaks
- Mehrere Patches pro Tag akzeptabel ohne formales Sprint-Konstrukt
- MASTER.md Sessions-Tabelle minimal (1-Zeilen-Einträge reichen)

**Bleibt strikt:**
- ALLE A-Regeln (A1–A13)
- B6 Code-Reality-Check
- DP11 Test-Self-Equals-User (keine Demo-Workarounds, die für echte Nutzer brechen)
- Eskalations-Pflicht bei strukturellen Entscheidungen

Ab Phase B kommen B1–B5 wieder dazu, ab Phase C voller Workflow.

---

## 16 · Lessons (kumulativ aus realen Vorfällen)

> Initial leer. Wird mit jedem realen Vorfall in App-Coding oder Strategie befüllt. Lesson-Nummer fortlaufend (L1, L2, …). Source-of-Truth in `docs/MASTER.md`.

| # | Lesson | Quelle |
|---|---|---|
| — | — | — |

---

## 17 · Schnellreferenz — wichtige Pfade

```
~/Desktop/ez-cockpit/                              # Repo-Root
├── CLAUDE.md                                       # diese Datei
├── ez-cockpit.html                                 # Haupt-App (~9.500 Zeilen)
├── (worker.js)                                     # Cloudflare Worker (optional im Repo, oder nur in Cloudflare Dashboard)
├── docs/
│   ├── PROJEKT_ANWEISUNGEN.md                      # Bootstrap Chat-Modi (Strategie/VI)
│   ├── MASTER.md                                   # Source of Truth
│   ├── COCKPIT.md                                  # technische Referenz
│   ├── strategie_kontext.md                        # Strategie-Chat-Historie
│   ├── vi_kontext.md                               # VI-Chat-Historie
│   ├── app-coding_kontext.md                       # Code-Modus-Historie (du)
│   ├── briefing_*.md                               # Sprint-Briefings (flach)
│   ├── eskalation_YYYYMMDD.md                      # Eskalations-Briefings (flach, on-demand)
│   ├── ds*.md                                      # Design-Sessions (flach)
│   └── audit_*.md                                  # Audits (flach)
├── .gitignore
└── (optional: README.md für GitHub-Sichtbarkeit)
```

---

## 18 · Deine ersten drei Schritte in jeder neuen Session

1. **Lies** `docs/MASTER.md`, `docs/app-coding_kontext.md`, ggf. aktuelles Briefing.
2. **Drift-Check** (Sektion 4): `git log -5`, `git status`, version match, `node --check` baseline.
3. **Begrüße Osi** mit Stand-Report:
   > „Hi Osi. Ich sehe S{N}, deployed v{X.Y.Z}, Phase {A/B/C/D}, git clean. Aktuelles Briefing: [name oder ‚keins']. Womit fangen wir an?"

Bei rotem Drift-Check: kein Stand-Report, sondern direkte Frage zum Drift.

---

*EZ Cockpit · CLAUDE.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
