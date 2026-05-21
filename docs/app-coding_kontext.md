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

## Designentscheide (Stand S0)

(Initial leer — wird mit jedem realen Patch-Lauf gefüllt. Beispiel-Format aus FB-Setup:)

```markdown
### Sprint X Designentscheide

1. **{Title}** (U1). {Was wurde entschieden, warum, was war die Alternative.}
2. ...
```

---

## Mitnahmen für nächste Session

(Initial leer — wird in S1 mit Erkenntnissen aus dem ersten Code-Lauf gefüllt.)

---

## Drift-Hinweise

(Initial leer — Stelle wo Discrepancies zwischen Briefing und Code-Reality dokumentiert werden, die behoben werden müssen aber nicht im aktuellen Sprint.)

---

## Sessions

| # | Datum | Version | Highlights |
|---|---|---|---|
| **S0** | **2026-05-20** | 0.1.0 (Übergabe-Stand) | **Bootstrap (kein Code-Patch) · app-coding_kontext initialisiert · Erster Code-Lauf wartet auf S1 (Repo-Init + Firebase + Worker + Config-Replace + Seed-Data)** |

---

*EZ Cockpit · app-coding_kontext.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
