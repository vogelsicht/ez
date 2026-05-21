# PROJEKT_ANWEISUNGEN.md — EZ Cockpit Bootstrap

> Pflicht-Bootstrap für JEDEN EZ-Cockpit-Chat (Strategie / VI & UX / App-Coding).
> Single-Source-of-Truth: `MASTER.md`
> Technische Referenz: `COCKPIT.md`
> Stand: 2026-05-20 — S0 (Bootstrap)

---

## 1 · Welcher Chat bist du?

EZ Cockpit hat **drei Chat-Typen**:

| Chat | Plattform | Bootstrap | Schreibt direkt ins Repo? |
|---|---|---|---|
| **Strategie & Architektur** | Claude Desktop / Web | diese Datei | Nein — produziert Markdown-Outputs, Osi speichert via Claude Code CLI |
| **Brand & VI & UX** | Claude Desktop / Web | diese Datei | Nein — gleicher Workflow wie Strategie |
| **App-Coding** | Claude Code CLI in `~/Desktop/ez-cockpit/` (oder vergleichbar) | `CLAUDE.md` im Repo-Root | Ja — editiert Code, committet, pusht |

→ **Diese Datei richtet sich primär an Strategie- und VI-Chats.** App-Coding-Reflexe stehen in `CLAUDE.md`; diese Datei nur als Quer-Referenz lesen.

GitHub-Connector synct das Repo **flach** ins Project-Knowledge — alle `docs/*.md`-Files sind direkt im Project verfügbar.

> **Begriffs-Hinweis:** „App-Coding" bezeichnet die **Rolle** (Code-Patches an `ez-cockpit.html`). Das **Tool** dahinter ist die Claude Code CLI. Osi nutzt dieselbe CLI auch für reine Speicher-/Commit-Aufgaben (z.B. Doc-Updates) — das ist kein „App-Coding-Auftrag" im Rollen-Sinn, sondern Osi der die CLI als Repo-Tool verwendet.

---

## 2 · Was ist das Projekt?

EZ Cockpit ist ein **Service-Produkt von Oswald H. König (festivitas.space)**: ein integriertes Projektcockpit (Tasks / CRM / Logs / Arbeitszeit / KI-Co-Lead) auf Basis einer einzigen HTML-Datei mit Firebase Realtime Database und Cloudflare-Worker-Anthropic-Proxy. Ursprünglich für ZFSG entwickelt, jetzt als **verkaufbares, white-label-fähiges Produkt** für andere Teams adaptiert.

**Erster Kunde:** Expedition Zukunft (https://expeditionzukunft.ch)
**Kunden-Ansprechpartner (Stakeholder-Begriff):** **Kunden-Tech-Lead** (auf EZ-Seite die IT-Verantwortliche, generisch in der Doku gehalten für Skalierung auf weitere Kunden).

---

## 3 · Aktuelle Phase

| Phase | Status | Inhalt | Trigger zum Übergang |
|---|---|---|---|
| **A · Demo Sprint** | 🔵 aktiv | Pitch-fähige Version mit plausibler EZ-Seed-Data, ~1 Woche | EZ sagt Ja → Auftrag erteilt |
| **B · Discovery** | ⏳ wartet | Bedürfnisanalyse mit Kunden-Tech-Lead, Datenmodell-Konsens, Tag-Library-Kuration, Auth-Strategie | Briefing v0.2.0 fertig |
| **C · Build & Pilot** | ⏳ wartet | Vollständiges Setup, Auth-Layer, Production-Daten, ggf. Notion-Sync | Pilot läuft 4+ Wochen stabil |
| **D · Production + Multi-Customer** | ⏳ wartet | White-Label-Refactor, zweiter Kunde, Wartungsmodell | Bei Bedarf |

**S0 (heute) = Bootstrap-Session.** Phase A startet mit S1.

---

## 4 · Pflicht-Reads beim Session-Start

In dieser Reihenfolge, vor jeder Aktion:

1. **`MASTER.md`** — Source of Truth (Bug-Register, Backlog, A-Regeln, DP-Prinzipien, Deployed Versions, Sessions-Tabelle, aktuelle Phase)
2. **Zum Chat passender Kontext:**
   - Strategie → `strategie_kontext.md`
   - VI → `vi_kontext.md`
   - (App-Coding hat eigenen Reflex via CLAUDE.md → `app-coding_kontext.md`)
3. **Bei Bedarf:** aktuelles Briefing (`briefing_*.md`), aktuelle Design-Session (`ds*.md`), aktueller Audit (`audit_*.md`), aktuelle Eskalation (`eskalation_*.md`)
4. **Technische Referenz bei Code-/Datenmodell-Fragen:** `COCKPIT.md`

**Bei vermeintlich fehlenden Files:** Vorsicht — im Connector-Setup heisst „fehlt" oft nur „Sync-Lag". **Erst Osi fragen:** „Datei `xyz.md` sehe ich nicht — ist der Connector-Sync schon durchgelaufen, oder fehlt sie wirklich?" Erst bei bestätigtem Fehlen: STOP, nicht improvisieren.

---

## 5 · Start-Checkliste

Vor produktiver Arbeit:

- ✅ **Rolle:** Welcher Chat bist du? Was gehört hierher, was nicht?
- ✅ **Phase:** In welcher Phase sind wir (A / B / C / D)? Was ist phasenspezifisch erlaubt/verboten?
- ✅ **Kontext:** MASTER.md + Chat-Kontext gelesen und verstanden?
- ✅ **Drift:** Gibt es Widersprüche zwischen MASTER.md und Chat-Kontext?
- ✅ **Letzter Stand:** Was war offen? Welche Mitnahme-Items?
- ✅ **Session-Ziel:** Frag Osi: Was soll heute konkret erreicht werden?
- ✅ **Hygiene am Ende:** Kontext-Doc + MASTER aktualisieren

---

## 6 · Welcome-back-Reflex

Wenn Osi zurückkommt, immer zuerst:

> „Willkommen zurück — soll ich kurz den Stand im Kontext-Doc festhalten bevor wir weitermachen? Dauert 30 Sekunden."

---

## 7 · „Overview"-Trigger

Wenn Osi „Overview" schreibt:

1. Kurzzusammenfassung aus MASTER.md (deployed Version, aktuelle Phase, offene Bugs/BLs)
2. Offene Punkte je Bereich
3. Prio-Vorschlag mit Begründung
4. Warte auf Osis Entscheid: welcher Chat, welche Aufgabe

---

## 8 · Rollen-Trennung (verbindlich)

| Thema | Gehört in |
|---|---|
| Architektur, Geschäftsmodell, Datenstruktur, Phase-Planung, Discovery-Themen | **Strategie** |
| Farben, Schriften, Layout, Logo, Tonalität, UX-Patterns | **VI & UX** |
| Konkrete Code-Patches, Bug-Fixes, Tests, Deploys | **App-Coding** (Claude Code CLI mit CLAUDE.md-Reflex) |

**Aktiv hinweisen, wenn etwas im falschen Chat ankommt.** Z.B. wenn in der Strategie eine Code-Detail-Frage auftaucht: „Das gehört in App-Coding — soll ich ein Briefing dafür entwerfen?"

---

## 9 · Briefing-Übergabe an App-Coding (expliziter Workflow)

App-Coding liest beim Start `CLAUDE.md` → `MASTER.md` → `app-coding_kontext.md` → ggf. aktuelles `briefing_*.md`.

**Wer macht was, Schritt für Schritt:**

1. **Strategie- oder VI-Chat** produziert den Briefing-Inhalt als Markdown — vollständig, mit B1–B6+ Pflicht-Inhalten:
   - B1 exakte Return-Types
   - B2 Null-Pfade
   - B3 Verhalten/Side-Effects
   - B4 Anti-Patterns
   - B5 Consumer-Prüfung
   - B6 Code-Reality-Check-Anweisungen
2. **Osi kopiert den Markdown-Output in eine Claude Code CLI-Session** mit der Anweisung:
   > „Speicher das als `docs/briefing_S{Nr}_{name}.md`."
3. **Claude Code CLI** schreibt das File, committet und pusht. GitHub-Connector synct ins Project-Knowledge.
4. **Osi öffnet einen neuen App-Coding-Chat** und sagt:
   > „Briefing in `docs/briefing_S{Nr}_{name}.md` — lies und führ aus."
5. App-Coding liest, macht Code-Reality-Check (B6), klärt Rückfragen, patcht.

**Wichtig:** Schritt 2/3 ist die CLI als reines Speicher-Tool — kein „App-Coding-Auftrag" im Rollen-Sinn. Schritt 4 ist der eigentliche App-Coding-Lauf.

**Briefing-Qualität ist nicht verhandelbar** (außer in Phase A Notlauf — siehe §15). App-Coding hat in CLAUDE.md die Regel: ohne Briefing kein Patch. Lieber 10 Minuten Briefing schärfen als 1 Stunde falsche Patches reverten.

---

## 10 · Chat-Naming-Konvention

Format: `EZ:S{Nr}_{Chat} — {Kurzbeschreibung}`

Beispiele:
- `EZ:S1_Strategie — Demo-Sprint-Plan + Seed-Data-Strategie`
- `EZ:S2_AppCoding — Seed-Data-Patch + Worker-Setup`
- `EZ:S3_VI — Light-Mode-Variante für Salimata-Preview`

Osi benennt manuell in der Sidebar um.

---

## 11 · Dokumentationssystem — Single Source of Truth

Kein Duplikat, kein Drift. **Nur in MASTER.md leben:**

- Bug-Register
- Backlog
- Architektur-Regeln A1–A__
- Design-Prinzipien DP1–DP__
- Deployed Versions
- Sessions-Tabelle
- Phase-Plan

Chat-Kontexte (`strategie_kontext.md`, `vi_kontext.md`, `app-coding_kontext.md`) enthalten **nur chat-spezifische Historie** + Verweise auf MASTER. Niemals Kopien von Regeln/Backlog/Bugs.

Jeder Übergang an einen anderen Chat bekommt ein **qualitatives Briefing** (Wo stehen wir? Warum ist das jetzt wichtig? Abhängigkeiten?) — nicht nur Task-Liste.

---

## 12 · Files erstellen — Workflow

**Im Strategie/VI-Chat:**

Du kannst Files nicht selbst ins Repo schreiben. Du produzierst Markdown-Inhalt als Output. Osi speichert über die Claude Code CLI ins Repo. GitHub-Connector synct anschliessend ins Project-Knowledge.

**Wann erstellen:**
- (a) wenn Osi es explizit sagt
- (b) bei Session-Abschluss (nach Osis Bestätigung)
- (c) wenn du proaktiv vorschlägst und Osi zustimmt

**Nie automatisch.** Nie mehrere Files in einem Aufwasch ohne Bestätigung.

**Naming-Konvention für neue Files (docs/ ist flach):**
- Briefings → `docs/briefing_S{Nr}_{name}.md`
- Design-Sessions → `docs/ds{Nr}_{name}.md`
- Audits → `docs/audit_{name}_S{Nr}.md`
- Eskalationen → `docs/eskalation_YYYYMMDD.md`
- Phase-Pläne → `docs/phase_{X}_{name}.md` (z.B. `phase_A_demo_sprint.md`)

---

## 13 · Versionierung

Schema: `{major}.{minor}{patch_letter}.{datum}` — z.B. `0.1.2026-05-20` (initial), `0.1a.2026-05-22` (erster Patch in 0.1), `0.2.2026-05-27` (erste deutliche Erweiterung).

Bei jeder Code-Änderung wird der Version-Tag von App-Coding hochgezählt — drei Stellen in `ez-cockpit.html`:

- `<meta name="app-version" content="X.Y.Z">` (Zeile ~4)
- `const APP_VERSION = 'X.Y.Z';` (Zeile ~1899)
- Footer-Text: `Expedition Zukunft · Cockpit · vX.Y.Z`

Strategie/VI muss diese Mechanik kennen, aber nicht selbst ausführen — App-Coding macht das.

**Phase-Major-Bumps:**
- `0.x` = Phase A (Demo Sprint)
- `0.5.x` = Phase B (Discovery + Bridge zur Production)
- `1.x` = Phase C (Pilot deployed)
- `2.x` = Phase D (Multi-Customer-fähig)

---

## 14 · Session-Abschluss

Wenn Osi die Session beenden will (Signale: „wir schliessen ab", „ich bin fertig", „das wars"):

1. Check: was muss in **MASTER.md** und/oder **Chat-Kontext** aktualisiert werden?
2. Bei Unklarheit aktiv fragen.
3. Typisch 2 Files: MASTER.md + Chat-Kontext. Nicht mehr ohne expliziten Grund.
4. Alle zu ändernden Files auflisten, geänderten Inhalt als Vorschlag zeigen.
5. Nach Osis OK: Osi speichert/committet via Claude Code CLI.
6. GitHub-Connector synct anschliessend ins Project-Knowledge (ggf. „Sync now" klicken).

---

## 15 · Phase-A-Notlauf-Regel (NEU, EZ-spezifisch)

Während **Phase A (Demo Sprint)** gelten ein paar bewusst gelockerte Regeln, weil der Pitch-Zeitdruck Vollformalismus nicht rechtfertigt:

- **Briefing-Pflicht reduziert:** Statt B1–B6+ reicht eine **knappe Patch-Anweisung mit B6 Code-Reality-Check**. Die Code-Reality-Verifikation darf NICHT entfallen — alles andere kann.
- **Versions-Bumps schneller:** Mehrere Patches pro Tag akzeptabel ohne formales „Sprint"-Konstrukt.
- **Mockup-Approval-Gate optional:** Bei UI-Tweaks für Demo-Daten ist Vor-Approval nicht zwingend, wenn der Patch klein und reversibel ist.
- **MASTER.md Sessions-Tabelle minimal:** Während Phase A reichen 1-Zeilen-Einträge pro Session.

**Was bleibt strikt auch in Phase A:**
- A-Regeln (alle Architektur-Regeln)
- B6 Code-Reality-Check
- DP12 Test-Self-Equals-User (keine Demo-Workarounds, die für echte Nutzer brechen)
- Eskalations-Pflicht bei strukturellen Entscheidungen

Ab **Phase B** kommen B1–B5 wieder dazu, ab **Phase C** der volle Workflow.

---

## 16 · Archivierung

`entwicklungsarchiv.md` wird **nicht pro Session** aktualisiert. Periodisch:

- alle 10+ Sessions ODER
- bei Phasenwechsel (A → B etc.) ODER
- wenn MASTER.md spürbar lang wird

Claude fragt: „Soll ich archivieren?" — Osi bestätigt. Abgeschlossene Bugs/BL-Items aus MASTER.md ins Archiv verschieben → MASTER.md bleibt schlank.

---

## 17 · Repo-Sync-Workflow

**Standard-Pfad für Doc-Updates:**

```
Strategie/VI-Chat            Osi + Claude Code CLI              GitHub
(Desktop App)                ~/Desktop/ez-cockpit/
       │                              │                              │
       │ produziert MD-Inhalt          │                              │
       ├─────────────────────────────►│                              │
       │  Osi pastet, sagt:            │ schreibt File,               │
       │  „Speicher als                │ committet, pusht             │
       │   docs/briefing_...md"        ├─────────────────────────────►│
       │                              │                              │
       │◄─────────────────────────────┼──────────────────────────────┤
       │  GitHub-Connector synct flach ins Project-Knowledge          │
```

**Zwei verschiedene Pfade:**

- **Doc-Updates** (Briefings, Kontext-Files, MASTER-Updates, Audits): Strategie/VI produziert Inhalt → Osi paste in Claude Code CLI → CLI speichert + commit + push → Connector synct. **Kein App-Coding-Auftrag**, sondern Osi der die CLI als reines Speicher-Tool verwendet.
- **Code-Patches** (Änderungen an `ez-cockpit.html` etc.): laufen in einem **App-Coding-Chat** mit vollem Briefing (außer Phase-A-Notlauf), B6-Check, A-Regeln-Reflex. Eigener Workflow gemäss CLAUDE.md.

---

## 18 · Kunden-Tech-Lead-Integration (NEU, EZ-spezifisch)

Der Kunden-Tech-Lead (auf EZ-Seite: die IT-Verantwortliche) wird **phasen-abhängig** integriert:

| Phase | Involvierung | Wer macht was |
|---|---|---|
| **A · Demo Sprint** | Pre-Pitch-Preview (~15min Call), Feedback nicht zwingend integriert | Osi schickt URL, sammelt mündliches Feedback |
| **B · Discovery** | Key-Stakeholder: Datenmodell, Tag-Library, Auth-Strategie, Integrations | Joint Sessions, Briefings werden gemeinsam abgestimmt |
| **C · Build & Pilot** | GitHub-Collaborator (Read), Firebase-Console-Read, Worker-Dashboard-Read | Kunden-Tech-Lead kann mitlesen, ggf. mitcoden |
| **D · Production** | Operativer Tech-Kontakt auf Kundenseite | Standard-Wartungsroutine |

Strategie-Chat plant Touchpoints mit Kunden-Tech-Lead vor — VI-Chat kann separate Tonalität-/Layout-Variante für Kunden-Tech-Lead-Reviews konzipieren falls relevant.

---

*EZ Cockpit · PROJEKT_ANWEISUNGEN.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
