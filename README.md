# EZ Cockpit Bootstrap — Setup-Anleitung

Diese 7 Files initialisieren das Claude-Projekt-Setup für EZ Cockpit, adaptiert vom FinanceBird-Workflow. Stand: 2026-05-20 (S0).

## Was wohin gehört

```
~/Desktop/ez-cockpit/                       # GitHub-Repo (lokal)
├── CLAUDE.md                              ← aus diesem Bundle, Repo-Root
├── ez-cockpit.html                        ← bereits im Claude-Projekt vorhanden
├── (worker.js)                            ← Cloudflare-Worker, in S1 anzulegen
└── docs/
    ├── PROJEKT_ANWEISUNGEN.md             ← aus diesem Bundle
    ├── MASTER.md                          ← aus diesem Bundle
    ├── COCKPIT.md                         ← aus diesem Bundle
    ├── strategie_kontext.md               ← aus diesem Bundle
    ├── vi_kontext.md                      ← aus diesem Bundle
    └── app-coding_kontext.md              ← aus diesem Bundle
```

## Datei-Übersicht

| Datei | Zweck | Wer liest? |
|---|---|---|
| **PROJEKT_ANWEISUNGEN.md** | Bootstrap für Strategie- und VI-Chats. 3-Chat-Struktur, Rollen-Trennung, Workflow, Phase-Plan, Kunden-Tech-Lead-Pattern, Phase-A-Notlauf-Regel. | Strategie + VI |
| **MASTER.md** | Source of Truth. A-Regeln (A1–A13), DP-Prinzipien (DP1–DP12), Bug-Register, Backlog Phase A/B/C/D, Sessions-Tabelle, Deployed Versions. | Alle Chats |
| **COCKPIT.md** | Technische Bibel. Datenmodell, Architektur, Code-Konventionen, bekannte offene Punkte. | App-Coding + Strategie |
| **strategie_kontext.md** | Historie + offene Fragen für den Strategie-Chat. Briefing für nächste Session (S1). | Strategie |
| **vi_kontext.md** | Historie + offene Fragen für den VI-Chat. Frageliste für Phase-B-Discovery. | VI |
| **app-coding_kontext.md** | Historie + Mitnahmen für den App-Coding-Chat. Erste Schritte in S1. | App-Coding (CLI) |
| **CLAUDE.md** | Repo-Root-Reflex für Claude Code CLI. A-Regeln, B-Regeln, Workflow, Verbote, Eskalations-Pattern, Phase-A-Notlauf. | App-Coding (CLI) |

## Setup-Schritte

### A · GitHub-Repo initialisieren

1. Lokales Verzeichnis anlegen (z.B. `~/Desktop/ez-cockpit/`)
2. `CLAUDE.md` und `docs/*.md` aus diesem Bundle reinkopieren
3. `ez-cockpit.html` aus dem Claude-Projekt reinkopieren
4. GitHub-Repo anlegen (z.B. `ez-cockpit`)
5. `git init`, `git add .`, `git commit`, `git push`

### B · Claude-Projekt hier konfigurieren

1. **Project Instructions** in diesem Claude-Projekt setzen: Inhalt von `PROJEKT_ANWEISUNGEN.md` reinkopieren (oder kürzer: nur §1–§4 als Pflicht-Bootstrap, Rest via Project Knowledge)
2. **Project Knowledge:** alle 6 `docs/*.md`-Files hochladen (oder via GitHub-Connector synchronisieren, sobald Repo live)
3. **GitHub-Connector aktivieren** (empfohlen): synct das Repo flach ins Project Knowledge — kein manuelles Re-Uploaden bei Doc-Updates

### C · Drei Chats anlegen

1. **EZ:S1_Strategie — Demo-Sprint-Kickoff** (Claude Desktop/Web)
   - Liest: MASTER.md + strategie_kontext.md
   - Ziel: Tag-für-Tag-Plan für Pitch-Woche, Pitch-Story, Seed-Data-Strategie
2. **EZ:S1_AppCoding — Repo-Init + Setup** (Claude Code CLI im Repo-Root)
   - Liest: CLAUDE.md + MASTER.md + app-coding_kontext.md
   - Ziel: Firebase + Worker + Pages live, Config ersetzt, Smoke-Test
3. **EZ:S1_VI — Smoke-Visual-Check** (optional, erst aktiv wenn S1-Deployment Visual-Probleme zeigt)

### D · Erste Aktion

**S1 Strategie-Session öffnen.** Erstes Ziel: konkreten Demo-Sprint-Plan ausarbeiten (welcher Tag was?). Während Strategie läuft, kann Osi parallel das Repo lokal initialisieren.

## Wichtige Adaptionen gegenüber FinanceBird

- **Phase-Modell** statt Sprint-Modell (4 Phasen: A Demo Sprint → B Discovery → C Build & Pilot → D Multi-Customer)
- **Kunden-Tech-Lead-Begriff** für Stakeholder auf Kundenseite (generisch für Service-Produkt-Skalierung)
- **A11 Configuration-First** + **A12 Customer-Data-Isolation** + **DP10 Customer-agnostisch** als Service-Produkt-Regeln (neu, FB hat das nicht)
- **Phase-A-Notlauf-Regel:** gelockerte Briefing-Pflicht während Pitch-Woche (B6-Check bleibt strikt, B1–B5 entfallen)
- **Kein Smoke-Test** vorhanden (wird ggf. in Phase C gebaut) — `node --check` ist der einzige automatische Check

## Nicht im Bundle (musst du selber machen)

- `ez-cockpit.html` — schon im Projekt vorhanden, einfach ins Repo kopieren
- `worker.js` — wird in S1 via Cloudflare-Dashboard angelegt (Code in `EZ_COCKPIT_UEBERGABE.md` §4.2)
- `firebaseConfig` + `ANTHROPIC_PROXY_URL` — Werte aus deinem Firebase/Cloudflare-Setup in `ez-cockpit.html` einfügen (Zeile ~1894+)
- `.gitignore` — falls du `.env` o.ä. hast (Standard-Inhalt: `.DS_Store`, `node_modules/`, `*.log`)

---

*Generated 2026-05-20 by Claude im EZ-Cockpit-Bootstrap-Chat.*
