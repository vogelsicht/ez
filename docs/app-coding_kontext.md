# EZ Cockpit · app-coding_kontext.md

> Chat "EZ · App-Coding"
> Stand: 2026-05-20 (S0 Bootstrap)
> Bug-Register + Backlog + Regeln + Lessons → MASTER.md (Quelle der Wahrheit)
> Code-Modus-Reflexe → CLAUDE.md (Repo-Root)

---

## Zweck dieses Chats

Konkrete Implementation: Bugs fixen, Features bauen, HTML/JS patchen, Cloudflare Worker updaten, Firebase-Setup nachzieht. Tool: Claude Code CLI im Repo-Root.

**Nicht hier:**
- Architektur-/Business-Entscheide → Strategie-Chat
- Visuelle/UX-Entscheide → VI-Chat
- Discovery-Sessions mit Kunden-Tech-Lead → Strategie-Chat

---

## ⚡ ÜBERGABE AN NEUEN APP-CODING-CHAT (S0 Bootstrap)

**Status:** Bootstrap-Session abgeschlossen. **App-Coding hat noch nicht gepatcht.** Erster Code-Lauf erfolgt in S1 (Demo-Sprint-Kickoff).

### Was S0 produziert hat (für App-Coding relevant)

- `MASTER.md` mit A-Regeln A1–A13, DP-Prinzipien DP1–DP12, leerem Bug-Register, Backlog Phase A/B/C/D
- `COCKPIT.md` mit Datenmodell, Architektur, Code-Konventionen
- `CLAUDE.md` (Repo-Root) als Code-Modus-Reflex
- `ez-cockpit.html` v0.1.0 mit Placeholder-Config (Firebase + Worker), syntaktisch sauber (`node --check`-grün laut Übergabe)

### Was App-Coding in S1 als erstes tun muss

1. **Repo lokal initialisieren:**
   - GitHub-Repo erstellen (z.B. `ez-cockpit`)
   - Lokal clonen
   - `ez-cockpit.html` ins Repo legen (aus dem Projekt-File)
   - `docs/*.md` aus Bootstrap reinpasten
   - `CLAUDE.md` ins Repo-Root
   - Commit + Push
2. **GitHub Pages aktivieren** (`main` branch / root)
3. **Firebase-Projekt anlegen** (`ez-cockpit-demo`, europe-west1, Realtime Database Test-Mode)
4. **Cloudflare Worker deployen** (Worker-Code in `EZ_COCKPIT_UEBERGABE.md` §4.2)
5. **Konfigurations-Block in `ez-cockpit.html`** ersetzen (Zeile ~1894+):
   - `firebaseConfig` mit echten Werten
   - `ANTHROPIC_PROXY_URL` mit Worker-URL
6. **Smoke-Test:** App im Browser öffnen, Identity-Modal nutzen, ein paar Tasks anlegen, Co-Lead-Chat öffnen mit „Hallo, was ist mein Status?"
7. **Version-Bump:** auf `0.1a.2026-05-XX` nach erstem deployten Patch

### Phase-A-Notlauf-Regel beachten

Während Phase A (Demo Sprint) gilt eine gelockerte Briefing-Pflicht (siehe `PROJEKT_ANWEISUNGEN.md` §15):

- **Pflicht:** B6 Code-Reality-Check vor jedem Patch
- **Pflicht:** A-Regeln (A1–A13)
- **Pflicht:** DP11 Test-Self-Equals-User
- **Pflicht:** Eskalation bei strukturellen Entscheidungen (`docs/eskalation_YYYYMMDD.md`)
- **Reduziert:** B1–B5 müssen nicht im Briefing dokumentiert sein — knappe Patch-Anweisung reicht
- **Reduziert:** Versions-Bumps können schneller laufen, mehrere Patches pro Tag akzeptabel

Ab Phase B kommen B1–B5 wieder dazu.

---

## Wichtige Code-Stellen in `ez-cockpit.html` (Stand 0.1.0)

Aus der Übergabe identifiziert (relativ zu ~9.500 Zeilen Total):

| Bereich | Zeile (ca.) | Was |
|---|---|---|
| CSS-Variablen `:root` | 8+ | Farben/Fonts (DP10: alle UI-Elemente referenzieren `var(--app-*)`) |
| Meta `app-version` | 4 | Eines von drei Stellen für Versions-Bump |
| Konfigurations-Block | 1894+ | `APP_BRAND` / `APP_SLUG` / `ROOT_NODE` / `firebaseConfig` / `ANTHROPIC_PROXY_URL` / `APP_VERSION` |
| `STATE` global | ~ | Zentraler Daten-Container, Firebase-Listener pushen rein |
| `seedDefaults()` | ~2257 | Schreibt Defaults nur wenn `!snap.val()` — idempotent |
| Frag-Chat System-Prompt | ~8876 | LLM-Prompt mit `${APP_BRAND}` — für Tonalitäts-Anpassung in Phase B |
| Footer-Version | (Footer-Suche) | Drittes Stelle für Versions-Bump |

**Code-Reality-Check ist Pflicht** — diese Zeilennummern sind Schätzwerte aus dem Übergabe-Doc, vor jedem Patch via grep verifizieren.

---

## Verbote (CLAUDE.md §12 zusammengefasst)

- ❌ Monkey-Patching (A1)
- ❌ Doppelte Funktionsnamen (A2)
- ❌ Toter Code (A3)
- ❌ Hardcoded Farben/Strings (A11 Configuration-First)
- ❌ Firebase-Pfade hardcoded mit `"projektcockpit/..."` (Legacy) — immer `(ROOT_NODE + '/' + 'sub')`
- ❌ `JSON.stringify` in onclick (A7)
- ❌ `rm -rf` ohne Diff-Check
- ❌ Sensitive Keys/Secrets im Repo (API-Key gehört als Cloudflare-Worker-Secret, nicht ins Repo)
- ❌ Cross-Customer-Data-Access (A12)

---

## Designentscheide

### S1 Designentscheide

1. **Identity-Modal Empty-State: Inline-Add statt Settings-Tab** (Phase-A-Quickfix für BUG-001). Entschieden: `+ Person anlegen`-Eingabe direkt im Identity-Modal-Body, neuer Helper `identityAddPersonAndSelect(name)` der `addPerson()` + `setCurrentUser()` + `closeModal()` kombiniert. Alternative wäre voller Settings-Tab gewesen — abgelehnt weil das Architektur-Eskalation gebraucht hätte (mehrere Settings-Bereiche, Tab-Position, A11-Config-vs-Daten-Schnitt). Quickfix ist reversibel und blockiert keine spätere Settings-Architektur in Phase B.

---

## Mitnahmen für nächste Session

### Offen am Ende S1

- **Smoke-Test 3 von 5 Punkten + 1 Bonus grün, 2 bewusst offen** (siehe MASTER.md BL-009): 1/2/5 + FB-Read OK. Punkt 3 (Task-Anlage = FB-Write) und Punkt 4 (Co-Lead = Anthropic-Tokens) wurden bewusst nicht ausgeführt — Demo-DB-Verschmutzung bzw. Token-Kosten sind User-Entscheidungen, sollte Osi vor dem Pitch einmal manuell durchspielen. Worker-Erreichbarkeit indirekt verifiziert (OPTIONS-Preflight HTTP 200 auf `/v1/messages`).
- **4 Strategie-Themen eskaliert** (siehe MASTER.md → "Eskalations-Bedarf für Strategie-Chat"): Einstellungen-Mapping, Multi-Projekt-Views, Ressourcenplanung-Monitoring, Logbook-Erweiterung. Alle Phase-B-Discovery-Material, nicht Code-Modus.
- **Smoke-Test-Infrastruktur:** `~/.claude/launch.json` (user-level) enthält jetzt einen Eintrag `ez-cockpit-static` (Python-HTTP-Server auf Port 8765 mit `--directory /Users/ohkt/Desktop/ez_cockpit`). Bewusst global statt im Repo, weil das Preview-Tool nur user-level `~/.claude/launch.json` liest. Für künftige Smoke-Test-Wiederholungen wiederverwendbar. Bei späterer Repo-Bereinigung beachten.

### Lessons aus S1

- **B6 funktioniert wie spezifiziert.** Alle 5 erwarteten Zeilen aus dem Briefing waren exakt da wo angekündigt (6, 1899, 1904, 1917, 9465). Kein Drift.
- **`addPerson()` existierte schon** und persistiert sauber via `(ROOT_NODE + '/' + 'persons')` — A12-konform. Wiederverwendung statt Neubau: Phase-A-Quickfix nutzt nur 1 neue Helper-Funktion (`identityAddPersonAndSelect`), kein neues Datenmodell.
- **Identity-Modal-Body ist ein Template-Literal mit nested `${cur ? ... : ''}`-Ausdrücken.** `str_replace` funktionierte hier sauber ohne Acorn (A4 nicht nötig), weil der Block exakt eindeutig war. Bei grösseren Refactorings in dieser Funktion ggf. Acorn nehmen.

---

## Drift-Hinweise

(Initial leer — Stelle wo Discrepancies zwischen Briefing und Code-Reality dokumentiert werden, die behoben werden müssen aber nicht im aktuellen Sprint.)

---

## Sessions

| # | Datum | Version | Highlights |
|---|---|---|---|
| **S0** | **2026-05-20** | 0.1.0 (Übergabe-Stand) | **Bootstrap (kein Code-Patch) · app-coding_kontext initialisiert · Erster Code-Lauf wartet auf S1 (Repo-Init + Firebase + Worker + Config-Replace + Seed-Data)** |
| **S1** | **2026-05-21** | 0.1.0 → 0.1a → 0.1b.2026-05-21 | **Setup-Patch (firebaseConfig + ANTHROPIC_PROXY_URL + Versions-Bump) → live deployed. BUG-001 Quickfix (Identity-Modal Empty-State Onboarding via Inline-Add). 4 Strategie-Themen für Phase-B-Discovery eskaliert.** |

---

*EZ Cockpit · app-coding_kontext.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
