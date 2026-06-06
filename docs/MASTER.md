# EZ Cockpit · MASTER.md

> Pflichtlektüre für JEDEN Chat im Projekt EZ Cockpit.
> Quelle der Wahrheit für: Bug-Register, Backlog, Architektur-Regeln, Design-Prinzipien, Deployed Versions, Phase-Plan, Sessions-Tabelle.
> Stand: 2026-05-20 — S0 (Bootstrap-Session)

---

## Was ist EZ Cockpit?

Single-File-Webapp (Vanilla HTML/JS, kein Framework, kein Build-System) als **Service-Produkt von Oswald H. König (festivitas.space)**. Erstkunde: Expedition Zukunft (https://expeditionzukunft.ch).

**Module:**
1. **Cockpit** — Dashboard mit SVG-Timeline, Metriken, Logs-Sidebar, Entscheidungslog
2. **Aufgaben** — Kanban + Tabelle, Multi-Owner, Phasen, Bereiche, Prioritäten
3. **CRM** — Personen + Organisationen + Listen (Smart/Manual, Multi-Select, Touchpoint-Historie)
4. **Logbook** — Unified Sicht auf Team-Meetings, CRM-Notizen, Brainstorms
5. **Arbeitszeit** — Erfassung + CSV-Import (Toggl/Clockify) + Filter
6. **🤖 Co-Lead** — KI-Chat über Cockpit-Daten via Anthropic-Proxy
7. **Projekt** — Linksammlung + Export

Plus **Inbox-Workflow** für Transkript-Import (Meeting → LLM → strukturierte Karten → atomarer Import).

**Vision:** Service-Produkt, das mit Konfiguration (statt Code-Forks) für beliebige Beratungs-/Projekt-Teams adaptiert werden kann. EZ ist Kunde Nr. 1, weitere folgen wenn Pilot läuft.

**Basis:** Fork des ZFSG-Projektcockpits v3.19, Finance-Module entfernt, Visual Identity auf Expedition Zukunft umgestellt, hardcoded Strings in Konfigurations-Block extrahiert.

---

## Deployed Versions

| File | Version | Zuletzt geändert | Status |
|---|---|---|---|
| `ez-cockpit.html` | `0.1b.2026-05-21` | 2026-05-21 (S1) | live deployed via GitHub Pages, Firebase + Worker verbunden, Identity-Onboarding Quickfix |
| (Cloudflare Worker) | live | 2026-05-21 (vor S1) | `vogelsicht-ez.holy-forest-0174.workers.dev`, Anthropic-Secret gesetzt |

---

## Aktuelle Phase

**Phase A · Demo Sprint** (gestartet 2026-05-20)

Ziel: Pitch-fähige Version mit plausibler EZ-Seed-Data. ~1 Woche. Trigger zum Phase-B-Übergang: **EZ sagt Ja und erteilt Auftrag**.

### Phase-Plan (4 Phasen Total)

| Phase | Inhalt | Trigger zum Übergang |
|---|---|---|
| **A · Demo Sprint** 🔵 | Live-URL mit EZ-Seed-Data, Salimata-Preview, Pitch | Auftrag erteilt |
| **B · Discovery** ⏳ | Bedürfnisanalyse mit Kunden-Tech-Lead, Datenmodell-Konsens, Tag-Library-Kuration, Auth-Strategie, v0.2.0-Briefing | Briefing v0.2.0 fertig + freigegeben |
| **C · Build & Pilot** ⏳ | Vollständiges Setup, Auth-Layer, Production-Daten, 4+ Wochen Pilot-Nutzung | Pilot stabil & EZ zufrieden |
| **D · Production + Multi-Customer** ⏳ | White-Label-Refactor, zweiter Kunde, Wartungsmodell | Bei Bedarf |

---

## Kernarchitektur

```
Browser (ez-cockpit.html, Vanilla JS, ~9.500 Zeilen)
  │
  ├──► Firebase Realtime Database (europe-west1)
  │       ├─ ezcockpit/  ← ROOT_NODE (Tasks, CRM, Phases, Logs, Decisions, etc.)
  │       └─ ezarbeitsjournal/  ← LEGACY_TIME_NODE (Arbeitszeit-Einträge)
  │
  └──► Cloudflare Worker (Anthropic-API-Proxy)
          └─ Anthropic Claude (claude-sonnet-4-20250514)
                ├─ Transkript-Extractor (strukturierte JSON aus Meeting-Texten)
                └─ Frag/Co-Lead Chat (KI über Cockpit-Daten)
```

**Hosting:** GitHub Pages (statisch, HTTPS automatisch)
**Abhängigkeiten:** Firebase JS SDK 10.12.0 (CDN compat), Google Fonts (Darker Grotesque)

### Konfiguration (Zeile 1894+ in `ez-cockpit.html`)

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

**Für Re-Skinning eines anderen Kunden:** nur diese ~15 Zeilen + CSS-Variablen im `:root` ändern.

Volldetails: `COCKPIT.md`.

---

## Chats & Rollen

| Chat | Rolle | Liest beim Start |
|---|---|---|
| Strategie & Architektur | Business, Vision, Architektur, Discovery, Phase-Planung | MASTER.md + strategie_kontext.md |
| App-Coding | Code, Bugs, Features, Deploys | MASTER.md + app-coding_kontext.md + CLAUDE.md (Repo-Root) |
| Brand & VI & UX | Farben, Fonts, Layout, Tonalität, Layouts für Kunden-Tech-Lead-Reviews | MASTER.md + vi_kontext.md |

**Chat-Naming-Konvention:** `EZ:S{Nr}_{Chat} — {Kurzbeschreibung}`

---

## Stakeholder-Begriffe (generisch für Service-Produkt-Skalierung)

| Begriff | Bedeutung | EZ-Konkretisierung |
|---|---|---|
| **Osi** | Service-Anbieter, Solo-Operator | Oswald H. König |
| **Kunden-Tech-Lead** | IT-/Technik-Verantwortliche auf Kundenseite | (interne EZ-Person) |
| **Kunden-Team** | Endnutzer der App auf Kundenseite | EZ-Team |
| **Kunden-Lead** | Auftraggeber/Entscheider auf Kundenseite | (interne EZ-Person) |

Volldetail-Integration siehe `PROJEKT_ANWEISUNGEN.md` §18.

---

## Backlog & Bug-Register

### 🐛 Bug-Register

**Offen:** keine bekannt.

**Abgeschlossen:**

| # | Titel | Gefunden | Behoben | Notiz |
|---|---|---|---|---|
| BUG-001 | Identity-Modal Empty-State: leere Personen-Liste, kein Onboarding aus Empty-State heraus | S1 Smoke-Test (2026-05-21) | S1 Quickfix v0.1b.2026-05-21 | `+ Person anlegen`-Inline-Eingabe im Modal. Volle Settings-Architektur folgt in Phase B. A10/DP11-Verstoss aus Übergabe-Code. |

> Nächste Bug-Nummer: **BUG-002**

### 📋 Backlog (zentral)

#### Phase A · Demo Sprint
- [x] **BL-001** Firebase-Projekt anlegen (`vogelsicht-ez`, europe-west1) + Test-Mode-Rules ✅ vor S1
- [x] **BL-002** Cloudflare Worker als Anthropic-Proxy deployen + API-Key als Secret setzen ✅ vor S1
- [x] **BL-003** GitHub-Repo anlegen + GitHub Pages aktivieren ✅ vor S1 (`vogelsicht/ez`)
- [x] **BL-004** `firebaseConfig` + `ANTHROPIC_PROXY_URL` in `ez-cockpit.html` ersetzen ✅ S1
- [ ] **BL-005** Pitch-Features v0.2.0 + EZ-Seed gemäss `docs/briefing_S2_pitch_features.md` Etappe 1: Auth (E-Mail/Passwort), Settings-Tab, Resource-Planning-Pivot (Person × Kategorie × Woche), 8 EZ-Personen, Projekt-Hierarchie aus Salimata Screenshot, Auftrags-Rentabilitäts-Sicht (manuell). Eigenständig vorzeigbar nach Abschluss.
- [ ] **BL-005b** Pitch-Features v0.2a gemäss `docs/briefing_S2_pitch_features.md` Etappe 2: Clockify-API-Integration via Worker, Cron-Auto-Sync alle 2h, Manual-Sync-Button, TimeEntry-projectId-Verdrahtung, Auftrags-Rentabilität-Auto. Voraussetzung: BL-005 abgeschlossen.
- [ ] **BL-006** Pre-Pitch-Preview mit Kunden-Tech-Lead (15min Call, Feedback einarbeiten)
- [ ] **BL-007** Backup-Plan: lokales Demo-Video falls Worker während Pitch streikt
- [ ] **BL-008** Pitch-Notizen + Talking Points (technisch + Service-Modell + Preise)
- [x] **BL-009** Smoke-Test nach S1-Quickfix ✅ teilweise abgeschlossen (S1):
  - ✅ Punkt 1 Console-Errors: 0 errors
  - ✅ Punkt 2 Identity-Modal: Inline-Input + Button gerendert, Helper-Flow (`identityAddPersonAndSelect`) verifiziert (idempotent + setCurrentUser + Modal-close)
  - ⏸ Punkt 3 Task anlegen: nicht ausgeführt (Firebase-Write → Demo-DB-Verschmutzung → User-Entscheidung)
  - ⏸ Punkt 4 Co-Lead-Chat: nicht ausgeführt (Anthropic-Tokens-Kosten → User-Entscheidung); Worker erreichbar (HTTP 405 für GET, 200 für OPTIONS-Preflight = sauber)
  - ✅ Punkt 5 Footer: v0.1b.2026-05-21 live verifiziert (WebFetch auf vogelsicht.github.io/ez/ez-cockpit.html)
  - Bonus ✅ Firebase Read-Probe (`db.ref(ROOT_NODE).once('value')`): topLevel-Keys `lists, persons, phases, tagLibrary`

#### Phase B · Discovery (wartet auf Auftrag)
- [ ] **BL-010** Firebase Auth-Layer entscheiden (Email/Password vs. Google-SSO vs. Magic-Link)
- [ ] **BL-011** EZ-spezifische Tag-Library (sektoren / kompetenzen / themen) mit Kunden-Tech-Lead durchgehen
- [ ] **BL-012** Bereiche/Areas für Tasks anpassen (Default `kommunikation/partner/finanzen/strategie/programm/tools` → EZ-Vokabular)
- [ ] **BL-013** Frag-Co-Lead-System-Prompt auf EZ-Sprache verfeinern (Policy Sprint, Stakeholder-Konstellation, etc.)
- [ ] **BL-014** Phasen-Templates für typische EZ-Sprints definieren
- [ ] **BL-015** Datenmigrations-Plan mit Kunden-Tech-Lead: was wird aus bestehenden Tools (Notion? Trello?) übernommen?

#### Phase C · Build & Pilot (wartet auf Discovery)
- [ ] **BL-020** Production-Firebase-Projekt (vs. Demo) — getrennte DB, Auth aktiviert
- [ ] **BL-021** Settings-Panel für Team-Verwaltung direkt im UI (statt Identity-Modal)
- [ ] **BL-022** Multi-Workspace-Fähigkeit (mehrere parallele Policy Sprints?) — abhängig von Discovery-Resultat

#### Phase D · Production + Multi-Customer (Future)
- [ ] **BL-030** Mobile-optimiertes Layout
- [ ] **BL-031** Notion-Sync (bidirektional) — falls bei mehreren Kunden gewünscht
- [ ] **BL-032** Slack-Integration für Notifications
- [ ] **BL-033** White-Label-Refactor: zweiter Kunde mit eigenem `APP_BRAND`/`ROOT_NODE`/`:root`

> Nächste BL-Nummer: **BL-010** (Phase A) / **BL-016** (Phase B) / **BL-023** (Phase C) / **BL-034** (Phase D)

#### Eskalations-Bedarf für Strategie-Chat (aus S1 Smoke-Test-Feedback Osi, 2026-05-21)

Folgende vier Themen sind Architektur-/Strategie-Entscheide, die in Strategie-Sessions adressiert werden:

1. ✅ **Einstellungen-Tab + Mapping** — in S2 entschieden: Settings-Tab kommt in Etappe 1 (Briefing S2 §2.1), enthält Tagessoll + Personen-Email-Mapping. Erweitert in Etappe 2 um Clockify-Sektion. Multi-Tenant-Schnitt: `appConfig/` (geteilt) vs. LocalStorage (Phase-A: User-Präferenzen wie Tab-State).
2. ⏳ **Multi-Projekt-Views (EZ global / Projekt A / B)** — bleibt offen. Frage: ist ein „Projekt" ein eigener `ROOT_NODE`-Subbaum oder eine Property an Tasks/CRM/Logs? Phase-B-Discovery-Thema. Berührt BL-022.
3. ✅ **Ressourcenplanung als Monitoring** — in S2 adressiert: neues Datenmodell (`projects/`, `personCapacity/`, `effortEstimates/`), Pivot-Tabelle Person × Kategorie × Woche, Soll/Ist-Aggregat via TimeEntry-projectId. Volldetail: `briefing_S2_pitch_features.md`.
4. ⏳ **Logbook-Erweiterung** — bleibt offen. Logbook + Agenda-Setting + Entscheidungs-Logbook zusammenführen. Phase-B-Thema.

---

## Architektur-Regeln (verbindlich für alle Chats)

### Code-Regeln (universell)

**A1 · Kein Monkey-Patching.** Defekte Funktionen am Ursprung fixen, nicht überlagern.

**A2 · Keine doppelten Funktionsnamen.** JS-Hoisting macht stille Overrides gefährlich. Vor jedem `function NAME()`: grep prüfen.

**A3 · Kein toter Code.** Nicht aufgerufene Funktionen, alte Versionen, kommentierte Blöcke → raus. Wenn unklar: Osi fragen.

**A4 · Acorn-AST für Code-Modifikationen** bei verschachtelten Template-Literals und größeren Refactorings. Brace-Matching per Hand ist fehleranfällig.

**A5 · Block-Integrität.** `str_replace` darf nicht versehentlich Funktions-/Block-Grenzen splitten.

**A6 · Strukturvalidierung.** Nach Patches >50 Zeilen ODER alle 5 Patches: `node --check` Pflicht auf den combined-script-Block.

**A7 · Kein `JSON.stringify` in onclick.** Daten in `data-*`-Attribute, dann `getAttribute()`.

### Denk-Regeln

**A8 · Verify Before Use.** Vor `obj.method()`: wissen dass `obj` existiert UND `method` definiert ist.

**A9 · Null-Path First.** Erst Null-Pfade implementieren, dann Happy-Path.

**A10 · Empty-State Test.** Jede neue UI-Funktion mit leerer DB testen.

### Service-Produkt-Regeln (EZ-spezifisch, NEU)

**A11 · Configuration-First.** Kunden-Spezifisches geht in `APP_BRAND` / `APP_SLUG` / `ROOT_NODE` / `:root`-CSS-Variablen / `firebaseConfig` — **nie** in `if (customer === 'EZ')`-Verzweigungen. Wenn ein Feature nur einen Kunden betrifft, ist es entweder Konfiguration (= Daten-Default-Wert oder Theme-Variable) ODER ein eigenes Modul mit Feature-Flag. Code-Verzweigung pro Kunde ist verboten.

**A12 · Customer-Data-Isolation.** Jeder Kunde hat eigenen `ROOT_NODE` in Firebase. Kein Cross-Customer-Read, kein Cross-Customer-Schreiben. Bei Multi-Customer-Phase (D) wird das per Firebase-Rules erzwungen, nicht per App-Logik.

### Reliability-Regel

**A13 · Data-Reliability-First.** Jede Schema-Änderung muss eine der folgenden Garantien erfüllen:
1. **Reversibel:** Alte Daten bleiben parallel verfügbar bis neue Daten verifiziert sind.
2. **Verifizierbar:** User-sichtbarer Verify-Punkt mit Zahlen vor irreversiblen Schritten.
3. **Beweisbar fehlerfrei:** Diff-Test (Prüfsumme alt vs. neu) im Code mit Rollback bei Mismatch.

Bei Konflikt zwischen Eleganz und Datensicherheit: **Datensicherheit gewinnt**.

**A14 · Geteilte Konfiguration lebt in `appConfig/`, nicht in LocalStorage.** LocalStorage ist OK für Geräte-/User-spezifische Präferenzen (Tab-State, kollabierte Kategorien, aktive Linse). Sobald ein Wert team-weit gelten soll (Tagessoll, Brand-Config, Festival-Start, Feature-Flags) → Firebase-Knoten `appConfig/`. Sonst hat jede:r eine eigene Wahrheit und Drift ist garantiert.

### Briefing-Regeln

**B1 · Exakte Return-Types.** Type, Struktur, Beispiel-Output, Edge-Cases.

**B2 · Null-Pfade.** Verhalten bei `null`, `undefined`, leerer Liste, Netzwerk-Fehler.

**B3 · Verhalten.** Was tut die Funktion exakt? Side-Effects? Idempotent?

**B4 · Anti-Patterns.** Was darf NICHT passieren?

**B5 · Consumer-Prüfung.** Wer ruft auf? Wie? Mit welchen Annahmen?

**B6 · Code-Reality-Check.** Vor jedem Patch: `grep` mit Hauptbegriffen + 2-3 Naming-Variants. Briefing-Annahmen gegen Code prüfen.

> **Phase-A-Notlauf:** während Phase A ist nur **B6** Pflicht. B1–B5 werden in Phase B reaktiviert. (Siehe `PROJEKT_ANWEISUNGEN.md` §15.)

---

## Design-Prinzipien (verbindlich für alle Chats)

**DP1 · Anti-Friction.** Nie mehr Arbeit verlangen als die App abnimmt. Max. 3 Taps / 10 Sek.
  - **Sub: Why-First Tagging.** Wenn User Daten taggen / pflegen soll, muss VOR dem Tag-Akt klar sein, was die Information ihm liefert. Nicht „bitte tagge", sondern „Tagge X und du siehst Y".

**DP2 · Schönheit mit Zweck.** Lust machen die App zu benutzen.

**DP3 · Signal, nicht Rauschen.** Nur Relevantes zeigen.

**DP4 · Konsistenz & Robustheit.** Kohärentes Nutzererlebnis. Fehler ehrlich kommuniziert.

**DP5 · Kontext nie voraussetzen.** App weiss nicht woher Nutzer kommt.

**DP6 · Die App wächst mit.** Modular durch Konfiguration.

**DP7 · Daten zuerst.** Erst Datenpunkte, dann Visualisierung.

**DP8 · Fehler mit Lösungsweg.** Jede Fehlermeldung enthält den nächsten Schritt.

**DP9 · Sinnvolle Defaults + Edit im Detail.** Berechnete Defaults, User kann im Detail-Overlay anpassen.

**DP10 · Customer-agnostisch by default (NEU).** Jedes neue UI-Element / Datenfeld / Default-Wert muss die Frage beantworten: „Funktioniert das auch für Kunde Nr. 2 ohne Code-Patch?" Kunde-spezifische Inhalte sind Konfiguration (siehe A11), keine eingebauten Annahmen.

**DP11 · Test-Self-Equals-User.** *„Wir lösen alles sauber über die App. Workarounds beim Test-Self sind verboten — wenn ich etwas in meiner Demo-Instanz manuell zurechtbiege, hat jeder neue User dasselbe Problem. Self ist die erste Test-Welle; Workaround zerstört diese Validierungsfunktion."* Konkret: bei Schema-Drift, fehlenden Properties, Defaults-Lücken → Auto-Schema-Patch (Pattern: `ensureXSchema()`) statt manueller Firebase-Console-Anpassung.

**DP12 · AI-First.** Jeder neue Render-Pfad denkt mit, wie er von Frag/Co-Lead konsumiert werden kann. State muss strukturiert und LLM-lesbar bleiben.

---

## Workflow-Regeln

### Eskalation bei Architektur-Drift

Bei Konflikten zwischen Briefing und Code-Reality, bei strukturellen Entscheiden, bei „Geht das so wirklich?"-Momenten: **Eskalations-Doc** schreiben (`docs/eskalation_YYYYMMDD.md`), nicht improvisieren.

Aufbau:
- Was ist das Problem?
- Welche Optionen siehst du?
- Empfehlung mit Begründung
- Frage an Osi

### Phase-A-Notlauf-Regel

Siehe `PROJEKT_ANWEISUNGEN.md` §15. Kurzfassung: in Phase A reicht B6-Check als Briefing-Minimum; A-Regeln, DP11 (Test-Self-Equals-User), Eskalations-Pflicht bei strukturellen Entscheiden bleiben strikt.

---

## Lessons (kumulativ aus realen Vorfällen)

> Initial leer. Wird mit jedem realen Vorfall in App-Coding oder Strategie befüllt. Lesson-Nummer fortlaufend (L1, L2, …).

| # | Lesson | Quelle |
|---|---|---|
| **L1** | Bei Vorlagen-Übernahme aus anderem Projekt nicht auf Annahmen über fremden Code verlassen. Auch ein gut geschriebener Handover-Report ist sekundäre Quelle — die echte HTML ist die Wahrheit. In S2 entdeckt: ZFSG-Sandbox hat **kein** integriertes Person×Projekt×Woche-Soll, **kein** Personen-Kapazitäts-Modell — was Briefing-Annahmen vorher unterstellt hatten. Aufgedeckt durch Handover-Report §0 + direkten HTML-Code-Greps. Konsequenz: substanzielle Architektur-Korrektur. **Pattern:** Bei jedem Briefing, das auf einer Vorlage aufbaut, BEIDES sicherstellen — Erklärung + Quellcode-Zugriff. Niemals nur Beschreibung. | S2 (2026-06-05) |

---

## Sessions

| # | Datum | Chat-Typ | Fokus | Outcome |
|---|---|---|---|---|
| **S0** | 2026-05-20 | Strategie (Bootstrap) | Übergabe-Doc analysiert, FB-Setup-Patterns übernommen, 7 Doku-Files generiert, Phase-Plan ratifiziert | EZ-Cockpit-Projekt initialisiert; Phase A startbereit; nächstes: S1 Demo-Sprint-Kickoff |
| **S1** | 2026-05-21 | App-Coding | Setup-Patch (Firebase + Worker live, Version-Bump 0.1.0 → 0.1a → 0.1b), BUG-001 (Identity-Modal Empty-State) Quickfix | App live auf GitHub Pages; Firebase `vogelsicht-ez` + Worker `holy-forest-0174` verbunden; Identity-Onboarding aus Empty-State funktioniert; 4 Strategie-Themen für Phase-B-Discovery eskaliert |
| **S2** | 2026-06-05 | Strategie | Salimata-Feedback verarbeitet (zwei Inputs), ZFSG-Vorlagen-Analyse (Report + HTML), strategischer Pivot von „sb8-Port" zu „Pivot-Tabelle nach Salimatas Sheet", Briefing S2 produziert (`briefing_S2_pitch_features.md`, 2 Etappen) | Briefing übergabe-fertig an Claude Code CLI; nächstes: S3 App-Coding (Etappe 1 v0.2.0); S4 Strategie nach Salimata-Preview |

---

## Versions-Tabelle

| Version | Datum | Major Changes |
|---|---|---|
| 0.1.0 | 2026-05-20 | Initial: Fork aus ZFSG v3.19, Finanzen raus, EZ-Branding, Service-Produkt-Konfiguration extrahiert. Placeholders für Firebase/Worker. |
| 0.1a.2026-05-21 | 2026-05-21 | S1 Setup-Patch: Firebase-Config (`vogelsicht-ez`, europe-west1) + Worker-URL eingesetzt, Versions-Schema-Migration. Erste Live-Version auf GitHub Pages. |
| 0.1b.2026-05-21 | 2026-05-21 | S1 BUG-001-Quickfix: Identity-Modal Empty-State Onboarding (`+ Person anlegen` inline im Modal). Phase-A-Notlauf-konform, keine Settings-Architektur vorweggenommen. |

---

*EZ Cockpit · MASTER.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
