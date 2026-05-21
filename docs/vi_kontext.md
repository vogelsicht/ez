# EZ Cockpit · vi_kontext.md

> Chat "EZ · Brand & VI & UX"
> Stand: 2026-05-20 (S0 Bootstrap)
> Bug-Register + Backlog + Regeln → MASTER.md (Quelle der Wahrheit)

---

## Zweck dieses Chats

Visuelle Identität, Brand-Tonalität, Layout-Entscheide, UX-Patterns. Konzeption von visuellen Tweaks für Demo-Pitches und Kunden-Tech-Lead-Reviews.

**Phasen-spezifischer Auftrag:**
- **Phase A:** minimal aktiv — EZ-Branding ist bereits in `ez-cockpit.html` umgestellt. Nur falls beim Pitch-Vorbereitungs-Test visuelle Probleme auffallen, hier ad-hoc Tweaks.
- **Phase B:** stärker aktiv — Discovery mit Kunden-Tech-Lead kann VI-Wünsche aufzeigen (Light-Mode? Tonalität in System-Texten? Layout-Anpassungen?).
- **Phase C+:** wenn Feedback aus Pilot-Nutzung Layout-/UX-Issues zeigt.

---

## ⚡ BRIEFING FÜR NÄCHSTE SESSION

**Wo stehen wir nach S0:**
- EZ Visual Identity ist im Code bereits angewandt (`ez-cockpit.html`):
  - CSS-Variablen in `:root`: EZ Bright Blue, Magenta, Cyan-Teal, Indigo
  - Marken-Schrift: Darker Grotesque (Google Fonts)
  - Animierter 6-color-Gradient im Header-Logo
  - 708 Stellen referenzieren `var(--app-*)` — Re-Skinning trivial via `:root`-Edit
- **Noch nicht visuell verifiziert** (kein Browser-Test bisher) — erst bei Live-Deployment in S1 wird sich zeigen ob alles konsistent rendert.

**Was als nächstes VI-relevant ist (priorisiert):**

1. **Smoke-Visual-Check nach S1-Deployment:** sobald die App live ist, durchklicken und auf VI-Drift achten:
   - Lädt Darker Grotesque sauber (Google Fonts CDN)?
   - Sind alle Akzentfarben EZ-konform?
   - Funktioniert der Gradient-Loop im Header?
   - Konsistenz über alle Tabs (Cockpit / Aufgaben / CRM / Logs / Arbeitszeit / Co-Lead / Projekt)?
2. **Optionale Pitch-Tweaks** falls etwas auffällt: in Phase A minimaler Scope, nur was Pitch direkt verbessert.
3. **Phase-B-Discovery-Vorbereitung:** Frageliste an Kunden-Tech-Lead für VI-Themen:
   - Gibt es ein EZ-internes Style-Guide-Dokument, das ich kennen sollte?
   - Wird Light-/Dark-Mode-Toggle gewünscht?
   - Gibt es Tonalitäts-Konventionen für System-Texte (Sie/Du, fachlich/locker)?
   - Sollen bestimmte UI-Elemente prominenter/zurückgezogener sein als heute?

---

## EZ Visual Identity — Stand 0.1.0

### Farbpalette

| Variable | Wert | Bedeutung |
|---|---|---|
| `--app-primary` | `#3D46FB` | EZ Bright Blue (Hauptakzent) |
| `--app-secondary` | `#b200a5` | EZ Magenta |
| `--app-tertiary` | `#2bbdd4` | EZ Cyan-Teal |
| `--app-text-strong` | `#161336` | EZ Indigo (Headings) |
| `--app-text` | `#2a2545` | Lauftext |
| `--app-bg` | `#f6f8fb` | App-Hintergrund |
| `--app-bg-alt` | `#eaeef5` | Zonen-Hintergrund |

Plus: animierter 6-color-Gradient im Header-Logo (`#00ca9e, #9252fa, #2bbdd4, #19bd99, #b200a5, #4278ff`, 60s loop).

### Typografie

- Heading + Body: `'Darker Grotesque', system-ui, sans-serif`
- Geladen über Google Fonts CDN
- Wenn Darker Grotesque nicht lädt → System-UI-Fallback (auf den meisten OSen funktional, aber off-brand)

### Layout-Konventionen

- Tab-basierte Hauptnavigation
- Sidebar links für Identity + Logs
- Modals via `<div class="modal-overlay">` (zentriert, dimmed Background)
- Notion-Stil Tabellen mit Spalten-Filtern
- Kanban-Spalten für Tasks

---

## VI-Beschlüsse

(Stand S0: keine VI-spezifischen Beschlüsse — EZ-Identity wurde 1:1 aus dem Brand-Guide übernommen, kein Eigen-Interpretations-Spielraum gefunden bzw. genutzt.)

---

## Offene Themen für künftige VI-Sessions

| # | Thema | Wann |
|---|---|---|
| **VI-Q1** | Light-/Dark-Mode-Toggle wünschenswert für EZ? | Phase B (Discovery-Frage) |
| **VI-Q2** | Tonalität System-Texte: aktuell „Sie/Du"-neutral. Sollte EZ einen klaren Default? | Phase B |
| **VI-Q3** | Kunden-Tech-Lead-Review-Tool: braucht es eine vereinfachte „Read-only-Variante" mit anderem Layout? | Phase B/C |
| **VI-Q4** | Mobile-optimiertes Layout (BL-030) — wenn ja, welche Module priorisiert? | Phase D |
| **VI-Q5** | Co-Lead-Tonalität: aktueller Prompt referenziert "Co-Lead von Team". EZ-spezifische Persona? | Phase B (überlappt mit Strategie-DS4) |

---

## Zweck-Split mit anderen Chats

| Thema | Wo |
|---|---|
| Farbpalette / Schriften / Layouts | hier (VI) |
| LLM-System-Prompts (Tonalität, Persönlichkeit) | hier (VI) + Strategie (Funktion) — gemeinsam |
| Phase-Planung / Roadmap | Strategie |
| Code-Patches an CSS / HTML | App-Coding (CLI) |

---

## Sessions

| # | Datum | Highlights |
|---|---|---|
| **S0** | **2026-05-20** | **Bootstrap (kein VI-Inhalt) · vi_kontext initialisiert · VI-Stand 0.1.0 dokumentiert · Frageliste für Phase-B-Discovery vorbereitet (5 offene VI-Q's)** |

---

*EZ Cockpit · vi_kontext.md · 2026-05-20 · S0 (Bootstrap) · Oswald H. König + Claude*
