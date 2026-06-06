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

## ⚡ BRIEFING FÜR NÄCHSTE STRATEGIE-SESSION (S4 oder später)

> **Achtung:** S3 ist die App-Coding-Session, die Briefing S2 Etappe 1 ausführt. S4 ist die nächste Strategie-Session — voraussichtlich nach Salimata-Preview-Call.

**Wo stehen wir nach S2 (Strategie, 2026-06-05):**

- Salimata hat zwei Feedback-Runden geschickt, Inhalt dokumentiert in §S2-Inputs unten
- Strategischer Pivot vollzogen: nicht ZFSG-sb8 portieren, sondern **Pivot-Tabelle nach Salimatas Sheet bauen** (anderer Workflow als ZFSG)
- Briefing `briefing_S2_pitch_features.md` produziert: 2 Etappen, Etappe 1 = Auth + Pivot-Tabelle + EZ-Seed (Ziel v0.2.0), Etappe 2 = Clockify-Auto-Sync + Auftrags-Rentabilität (Ziel v0.2a)
- Linsen-Feature aus sb8 bewusst geparkt (kein EZ-Bedarf für Pitch)
- Notion-Tasks-Sync bewusst geparkt (Phase-B-Discovery-Entscheid mit Salimata)
- Briefing wartet auf Übergabe in CLI → App-Coding-Chat

**Was vor S4 erledigt sein sollte (zeitlich vor nächster Strategie-Session):**

1. Briefing S2 wird via CLI ins Repo gespeichert (`docs/briefing_S2_pitch_features.md`)
2. App-Coding-Chat S3 startet, führt Etappe 1 aus → v0.2.0 deployed
3. Osi: Firebase Console — Authentication aktivieren, 8 EZ-User + Osi anlegen (Briefing §2.1)
4. Salimata-Preview-Call: URL + Login-Daten an Salimata, sie probiert ihren Workflow live aus
5. Salimata-Feedback einsammeln (mündlich/schriftlich)

**Themen für S4 (nach Salimata-Preview):**

1. **Salimata-Feedback-Triage:** was wird in Etappe 2 noch eingebaut, was wandert in Phase B, was wird verworfen
2. **Notion-Tasks-Entscheid:** read-only Sync oder Tasks im Cockpit pflegen — Salimatas Antwort entscheidet
3. **Datenschutz-Detail-Antwort vorbereiten:** Salimatas Punkt 1 (keine US-Apps, Auth, Encryption) — konkrete Antwort für formellen Pitch zum Auftrag (welche Datenverarbeiter, wo liegen Daten, EU-Region, was muss EZ prüfen)
4. **Pitch-Story finalisieren:** drei Frames (Service-Produkt-Logik / Setup-Mehrwert / Preis) — siehe Übergabe-Doc §11
5. **Backup-Plan:** Demo-Video lokal falls Live-Demo versagt (BL-007)

**Offene Strategie-Punkte aus S1 die nach Etappe 1 wieder hochkommen:**

- Multi-Projekt-Views (Eskalations-Item #2) → Phase-B-Discovery
- Logbook-Erweiterung (Eskalations-Item #4) → Phase-B-Discovery

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

## S2 Beschlüsse (bindend)

### S2-1 · Strategischer Pivot — von „sb8-Port" zu „Pivot-Tabelle nach Salimatas Sheet"

**Auslöser:** Code-Reality-Check der ZFSG-Sandbox (Report + HTML-Greps) deckte auf, dass sb8 zentrale Annahmen NICHT erfüllt: kein integriertes Person×Projekt×Woche-Soll, kein Personen-Kapazitäts-Modell. Der ZFSG-Stream-Wochenbudget-Mechanismus ist Person-agnostisch.

**Entscheid:** EZ-Pitch-Demo baut nicht auf der sb8-Wochentabelle auf, sondern repliziert **Salimatas Sheet-Workflow** (Person-Spalten × Kategorie-Hierarchie × Monat/Woche) als Live-Pivot-Tabelle. Datenmodell ist additive Erweiterung mit `projects/`, `personCapacity/`, `effortEstimates/`. Bestehendes EZ-Datenmodell wird nicht refactored.

**Konsequenz:** Volldetail in `briefing_S2_pitch_features.md` §1.

### S2-2 · Auth pro User von Anfang an

**Entscheid:** Firebase Auth E-Mail/Passwort wird in Phase A (Demo Sprint) implementiert, nicht erst in Phase C. Begründung: Salimatas Datenschutz-Punkt + erlaubt Personalisierung (Aufwandsplanung-Tab als Default für Salimata, Person-Identifikation aus Auth statt LocalStorage-Heuristik).

**Granularität:** Phase A = Auth als Login-Gate (`auth != null → r/w`). Granulare Rules (nur eigene Spalte editierbar etc.) bleibt Phase-B-Thema.

**Konsequenz:** BL-010 (Auth-Strategie Phase B) wird obsolet — Entscheid in S2 vorgegriffen. BL-021 (Settings-Panel) ebenfalls vorgegriffen, kommt in Etappe 1.

### S2-3 · Clockify-Integration via Worker-Cron-Auto-Sync

**Entscheid:** Clockify-API echt, nicht CSV-Import. Worker-Endpoint `/clockify/*` als Proxy (Key serverseitig als Secret), Cron-Trigger im Worker alle 2h pullt TimeEntries und schreibt nach Firebase. Manual-Sync-Button für Sofort-Bedarf.

**Granularität:** Mapping (Workspace, User, Projekt) pflegt Osi initial im Settings-Tab. Salimata sieht „verbunden ja/nein" + letzten Sync-Timestamp.

**Konsequenz:** API-Key lebt nur als Worker-Secret, nie im Frontend. Setup-Friction durch Cloudflare-Console akzeptiert.

### S2-4 · Linsen-Feature parken

**Entscheid:** sb8-Linsen-System wird in Etappe 1/2 NICHT portiert. Salimata hat es nicht angefragt; der Pitch-Kern (Pivot-Tabelle + Auftrags-Rentabilität) trägt ohne. Linsen bleiben als Phase-B+-Erweiterung verfügbar.

### S2-5 · Tagessoll = 8.4h Default, editierbar

**Entscheid:** Tagessoll lebt in `appConfig.tagessoll`, nicht in LocalStorage (siehe MASTER A14). Default 8.4 (ZFSG-Konvention). Editierbar im Settings-Tab — wenn EZ andere Konvention hat, ändert Osi/Salimata es einmalig.

---

## S2 Inputs · Salimata-Feedback (dokumentiert für Phase-B-Anschluss)

### Input 1 (zu Cockpit-Preview, 2026-06-04)

> „Zum Cockpit: Mega cool, danke fürs Teile! Han mir Paar Gedanke gmacht. Zwei Risike gits us Organisationsperspektive: 1. Datenschutz (?) 2. One more Plattform - also onboarding und workstreams im Team ibaue. Zum also a viable alternative zu unserem jetztige set-up ha müesstis simpel und sicher gnueg syy 🙂 Ich bin mir aktuell au am aluege wie ich unsri Needs direkt uf Notion oder unserem Google Workspace integriert werde könne, zums in bestehendi Strukture z ha. Ich schick dir trotzdem Snippets vo unserem aktuelle Modus. Aber let's talk before you spend too much time in the rabit hole - isch glaub eifacher."

Plus Screenshots: (1) ihre Ressourcenplanung (Sheet, Person × Kategorie × Monat), (2) Notion-Task-Liste eines Auftrags („VIS Mission Salesx") mit Spalte „Ressourcen in Tagen".

**Interpretation:** Buy/Build-Signal, nicht nur Feedback. Sie evaluiert aktiv eine Notion/GWS-native Alternative. Headline: „let's talk before you spend too much time" = gelb-bis-amber Warnung auf die Kern-These.

### Input 2 (Osi-Antwort + Salimata-Reply, 2026-06-04/05)

Osi an Salimata (Pitch der Bündelungs-These + Clockify-Auto-Sync-Versprechen):

> „Cockpit als Interface, das eure bestehenden Apps bündelt: API mit clockify → automatischi Ziterfassig 'IST' uf euchi laufende Projekt. Aufwandsplanung-Ansicht: monitoring IST Aufwände vs euchi budgetierte Stunde. Pro KW bspw. und de chamer auno witer ufschlüssle pro Person."

Plus Versprechen: KI-prompted Demo „mit sehr wenig Aufwand, wird sicherlich Fehler drinne ha, ebe s Potential ufzeige".

Salimatas Antwort (gleicher Tag):

> „Jetzt heds bi mir es bitzli dured! han mer au bitz gedanke mache müesse ;) 1. Dateschutz: chamer aluege und isch öppis womer uf euchne bedürfnis cha löse (kei US apps bspw., log-ins, encryptions, …) 2. was ich für euche case als de grossi vorteil gseh isch dass das cockpit als interface cha funktioniere wo euchi bestehende apps tuet bündle [...] uf dere basis chömer ja nachher mal euche case aluege ob das sinn macht oder ober ebe mit de bestehende mittel besser bedient sind :))"

Plus: ZFSG hat „powerful Linsen" gerade gebaut, HTML-Datei kommt nach.

**Interpretation:** Beide Risiken aus Input 1 entschärft. „Cockpit als Bündelungs-Interface" wird von Salimata selbst gespiegelt — wertvolleres Pitch-Argument geht nicht. Sie schickt ein eigenes KI-prompted Demo (echte Investition). „uf dere basis chömer aluege ob sinn macht" = Call wird Entscheidungsgespräch, nicht „mal schauen".

**Erkennbare EZ-Anforderungen (für Phase-B-Discovery sortiert):**
- Clockify-API → automatische Ist-Stunden (Etappe 2 deckt das)
- Aufwandsplanung-View mit Monitoring Ist vs. Budget pro KW + pro Person (Etappe 1+2 decken das)
- Linsen (sb8) erwähnt — Salimata hat sie gesehen, sieht ggf. Wert. Phase-B-Check ob für EZ relevant.
- Datenschutz-Antwort: keine US-Apps, Auth, Encryption → Firebase ist Google (US-Konzern!), das ist ein offener Punkt für Phase-B-Detail-Antwort

---

## Geplante Design-Sessions (DS-Roadmap)

| DS | Thema | Trigger | Status |
|---|---|---|---|
| **DS1** | EZ-spezifische Tag-Library kuratieren (sektoren / kompetenzen / themen) | Phase B mit Salimata | ⏳ wartet |
| **DS2** | Bereiche/Areas für Tasks anpassen (EZ-Vokabular) | Phase B | ⏳ wartet |
| **DS3** | Auth-Strategie verfeinern (granulare Rules pro Knoten) | Phase B | ⏳ wartet (Basis-Auth in S2 entschieden) |
| **DS4** | Frag-Co-Lead-Prompt-Refinement (EZ-Tonalität, Stakeholder-Begriffe) | Phase B | ⏳ wartet |
| **DS5** | Phasen-Templates für typische EZ-Sprints | Phase B | ⏳ wartet |
| **DS6** | Notion-Tasks-Sync vs. Tasks-im-Cockpit-Entscheid | Phase B Discovery mit Salimata | ⏳ wartet |
| **DS7** | Multi-Projekt-Views Architektur (ROOT_NODE-Subbaum vs. Property) | Phase B+C | ⏳ wartet |
| **DS8** | Datenschutz-Detail-Antwort für formellen Pitch (Firebase=Google-Konzern-Frage) | vor Auftragserteilung | ⏳ wartet |
| **DS9** | White-Label-Refactor für Kunde Nr. 2 | Phase D | ⏳ wartet |

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
