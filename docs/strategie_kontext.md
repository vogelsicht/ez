# EZ Cockpit · strategie_kontext.md

> Chat "EZ · Strategie & Architektur"
> Stand: 2026-05-20 (S0 Bootstrap)
> Bug-Register + Backlog + Regeln + Phase-Plan → MASTER.md (Quelle der Wahrheit)

---

## Zweck dieses Chats

Übergeordnetes Denken: Business Case, Service-Produkt-Vision, Architektur-Entscheide, Discovery-Sessions mit Kunden-Tech-Lead, Phase-Planung, Briefings für App-Coding.

**Systemisches Prinzip:** Jede Entscheidung wird auf zwei Ebenen geprüft:
1. Funktioniert es für EZ (heutiger Kunde) konkret?
2. Wie skaliert es für Kunde Nr. 2, 3, 4 ohne Code-Forks (Service-Produkt-Logik)?

---

## ⚡ BRIEFING FÜR NÄCHSTE SESSION (S1)

**Wo stehen wir nach S0 (Bootstrap):**
- EZ-Cockpit-Projekt initialisiert
- Übergabe-Doc (`EZ_COCKPIT_UEBERGABE.md`) als Skizze identifiziert; FB-Setup-Patterns als kanonische Vorlage übernommen
- 7 Bootstrap-Docs generiert: `PROJEKT_ANWEISUNGEN.md`, `MASTER.md`, `COCKPIT.md`, `strategie_kontext.md` (dieses File), `vi_kontext.md`, `app-coding_kontext.md`, `CLAUDE.md` (für Repo-Root)
- **Phase A · Demo Sprint** als aktive Phase definiert
- Kunden-Tech-Lead-Pattern etabliert (siehe `PROJEKT_ANWEISUNGEN.md` §18)
- Phase-A-Notlauf-Regel verabschiedet: in Phase A reicht B6-Check als Briefing-Minimum (siehe `PROJEKT_ANWEISUNGEN.md` §15)
- A11 + A12 (Configuration-First + Customer-Data-Isolation) + DP10 (Customer-agnostisch by default) als Service-Produkt-Regeln eingeführt
- DP11 Test-Self-Equals-User aus FB übernommen — gilt auch für EZ-Pilot

**Was als nächstes Strategie-relevant ist (priorisiert):**

1. **S1 Demo-Sprint-Kickoff:** konkrete Tag-für-Tag-Planung für die Pitch-Woche
   - Tag 1-2: Repo + Firebase + Worker + GitHub Pages live (BL-001 bis BL-004)
   - Tag 3: Plausible EZ-Seed-Data anlegen (BL-005)
   - Tag 4: Pre-Pitch-Preview mit Kunden-Tech-Lead (BL-006)
   - Tag 5: Polish basierend auf Feedback
   - Tag 6: Backup-Plan + Pitch-Notizen (BL-007, BL-008)
   - Tag 7: Pitch
2. **EZ-Seed-Data-Strategie konkretisieren:** welche EZ-Projekte/Stakeholder zeigen wir plausibel? (Recherche-Quellen: expeditionzukunft.ch + LinkedIn + öffentliche Reports)
3. **Pitch-Story formulieren:** drei Frames vorbereiten — (a) Service-Produkt-Logik, (b) Setup-Aufwand-vs-Mehrwert, (c) Preis-Optionen (siehe Übergabe-Doc §11)
4. **Kunden-Tech-Lead-Touchpoint:** Wann genau wird sie eingebunden? Was zeigen wir? Welches Feedback wollen wir bekommen?

---

## S0 Beschlüsse (bindend)

### S0-1 · Phase-Plan ratifiziert

Vier-Phasen-Modell (A Demo Sprint → B Discovery → C Build & Pilot → D Multi-Customer). Trigger-Bedingungen pro Phase definiert. Volldetail: `MASTER.md` „Phase-Plan".

### S0-2 · Stakeholder-Begriff „Kunden-Tech-Lead"

Generischer Begriff für die IT-/Tech-verantwortliche Person auf Kundenseite (bei EZ konkret: interne Person). Macht Service-Produkt-Skalierbarkeit explizit. Phasen-spezifische Involvierung in `PROJEKT_ANWEISUNGEN.md` §18.

### S0-3 · Service-Produkt-Regeln (A11 + A12 + DP10)

- **A11 Configuration-First:** Kunden-Spezifisches geht in `APP_BRAND`/`APP_SLUG`/`ROOT_NODE`/`:root` — nicht in `if (customer === 'EZ')`.
- **A12 Customer-Data-Isolation:** jeder Kunde hat eigenen `ROOT_NODE`; Cross-Customer-Reads/Writes verboten.
- **DP10 Customer-agnostisch by default:** jedes neue Feature muss „Funktioniert das auch für Kunde Nr. 2 ohne Code-Patch?" beantworten.

### S0-4 · Phase-A-Notlauf-Regel

In Phase A reicht **B6 Code-Reality-Check** als Briefing-Minimum. B1–B5 ab Phase B reaktiviert. A-Regeln, DP11, Eskalations-Pflicht bei strukturellen Entscheiden bleiben strikt. Begründung: Pitch-Zeitdruck rechtfertigt Vollformalismus nicht.

### S0-5 · Versions-Schema

`{major}.{minor}{patch_letter}.{datum}`. Phase-Major-Bumps: 0.x = Phase A, 0.5.x = Phase B, 1.x = Phase C, 2.x = Phase D.

### S0-6 · Übernommene FB-Patterns

Strukturell 1:1 aus FinanceBird-Setup übernommen: 3-Chat-Struktur, Briefing-Workflow (B1–B6+), Doc-Update-vs-Code-Patch-Trennung, Sessions-Tabelle, Welcome-back-Reflex, "Overview"-Trigger, Eskalations-Pattern, Chat-Naming-Konvention.

**Nicht übernommen** (FB-spezifisch oder noch nicht relevant):
- Smoke-Test-Pattern (gibt's für EZ noch nicht)
- A · Worker-Source-Provenance (erst relevant wenn Worker live)
- DP Klasse-A/Klasse-B Präzision (FB-Buchhaltungs-spezifisch)
- L17–L26 Lessons (FB-spezifisch; eigene Lessons-Liste wird mit realen Vorfällen befüllt)

---

## Geplante Design-Sessions (DS-Roadmap)

| DS | Thema | Trigger |
|---|---|---|
| **DS1** | EZ-spezifische Tag-Library kuratieren (sektoren / kompetenzen / themen) | Phase B mit Kunden-Tech-Lead |
| **DS2** | Bereiche/Areas für Tasks anpassen (EZ-Vokabular) | Phase B |
| **DS3** | Auth-Strategie (Firebase Email/Password vs. Google-SSO vs. Magic-Link) | Phase B |
| **DS4** | Frag-Co-Lead-Prompt-Refinement (EZ-Tonalität, Stakeholder-Begriffe) | Phase B |
| **DS5** | Phasen-Templates für typische EZ-Sprints | Phase B |
| **DS6** | Multi-Workspace-Architektur (mehrere parallele Sprints?) | Phase C |
| **DS7** | White-Label-Refactor für Kunde Nr. 2 | Phase D |

---

## Q&A · Offene strategische Fragen

### Q1 · Welche Auth-Strategie für Phase C?

**Status:** offen. Discussion-Trigger: Phase-B-Beginn.

**Optionen:**
- **Firebase Email/Password:** simpel, kein Drittsystem, User-Pflege manuell
- **Google-SSO:** EZ-Team nutzt vermutlich Google Workspace → friction-arm; aber Vendor-Lock
- **Magic-Link:** kein Passwort, charmant; aber Email-Delivery-Risiko

**Entscheid hängt ab:** wie sieht EZ's bestehender Auth-Stack aus? (Kunden-Tech-Lead-Frage in Phase B.)

### Q2 · Multi-Workspace-Architektur — sinnvoll für EZ?

**Status:** offen. Discussion-Trigger: Phase-B-Discovery zeigt Bedürfnis.

**Hintergrund:** EZ macht vermutlich mehrere parallele Policy Sprints. Heute: ein `ROOT_NODE`, eine flache Ebene. Wenn EZ separate Workspaces pro Sprint will (z.B. "Verkehr Q3 2026" / "Bildung Q4 2026"), braucht es Workspace-Layer im Datenmodell.

**Optionen:**
- (a) Mehrere `ROOT_NODE`s parallel (`ezcockpit_verkehr` / `ezcockpit_bildung`) — eigener Workspace-Switcher
- (b) Workspace-Layer in Daten (`ezcockpit/workspaces/{id}/tasks/...`) — UI-Switcher
- (c) Tags/Phases ausreichend, kein eigener Workspace-Begriff

**Trigger:** Discovery zeigt ob das ein Problem ist oder nicht. Nicht Phase-A-relevant.

### Q3 · Preismodell finalisieren

**Status:** Übergabe-Doc §11 als Skizze (Setup-Paket 2.5-4.5k CHF + Wartung 500-1.5k/Monat + BYOK).

**Offen für Pitch:**
- Konkrete CHF-Zahl für EZ (Setup + 12-Monats-Wartung) festlegen
- Was beinhaltet "Wartung" genau? SLA? Reaktionszeit?
- Eskalation: was kostet ein neues größeres Feature außerhalb Wartung?

**Vor S1 mit Osi klären** (Pitch-Notizen-Vorbereitung BL-008).

---

## Zweck-Split mit anderen Chats

| Thema | Wo |
|---|---|
| Tag-Library-Konkretisierung | hier (Strategie) → mündet in DS1 mit Kunden-Tech-Lead |
| Farben/Layout/Typo-Tweaks für Demo | VI-Chat |
| Code-Patches an `ez-cockpit.html` | App-Coding |
| Cloudflare-Worker-Setup | App-Coding (CLI) |
| Firebase-Datenmodell-Anpassungen | hier (Strategie) → Briefing an App-Coding |
| Preismodell / Verkaufs-Story | hier (Strategie) |

---

## Sessions

| # | Datum | Highlights |
|---|---|---|
| **S0** | **2026-05-20** | **Bootstrap-Session · Übergabe-Doc analysiert (als Skizze identifiziert) · FB-Setup-Patterns als kanonische Vorlage übernommen · 7 Doku-Files generiert · Phase-Plan ratifiziert (A→B→C→D) · Kunden-Tech-Lead-Pattern etabliert · A11/A12/DP10 Service-Produkt-Regeln · DP11 Test-Self-Equals-User übernommen · Phase-A-Notlauf-Regel · 6 offene Q's (Auth, Multi-Workspace, Pricing) markiert für Phase B** |

---

*EZ Cockpit · strategie_kontext.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
