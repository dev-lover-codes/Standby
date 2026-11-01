# Standby

> **"Standby. Your event is rehearsed."**

Standby answers **PromptWars Challenge 5 (Celebration & Event Planner)**: a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with **budgets**, **timelines**, **vendor checklists**, and **personalized ideas**.

Unlike ordinary planners that treat events as static lists, Standby **rehearses the event on paper** using deterministic simulation, backward dependency scheduling, and crisis pre-mortems before a single dollar is spent.

---

## 🏛️ Architecture & System Design

```mermaid
flowchart TD
    User["User Brief / Slate"] --> Action["Server Action / Auth Guard"]
    Action --> Guard{"AI Engine or Mock?"}
    Guard -->|"AI_MODE=live"| Gemini["Gemini 2.5 Flash SDK (Isolated Prompt)"]
    Guard -->|"AI_MODE=mock or timeout"| Fallback["Strict Local Template Fallback"]
    Gemini --> ZodParse["Zod Schema Validation"]
    Fallback --> ZodParse
    ZodParse --> DB[("Supabase Postgres + RLS")]
    DB --> Scheduler["Backward Scheduler (Kahn's Topo Sort + Critical Path)"]
    DB --> MonteCarlo["Budget Simulator (Mulberry32 PRNG + Triangular Dist)"]
    Scheduler --> CallSheet["Call Sheet Timeline + .ics Export"]
    MonteCarlo --> Histogram["Budget Reality Histogram + Table"]
    DB --> PlanB["Plan B Switch (Deterministic Transforms)"]
```

---

## 🎯 The Nine Rehearsal Features

1. **Slate (Brief)**: Users input constraints and vision (up to 1,500 characters, prompt-injection isolated); Gemini synthesizes a structured production plan with graceful template fallback.
2. **Pre-Mortem**: Identifies exactly 5 catastrophic failure points backward from the event date, pairing each with an actionable **Plan B** contingency.
3. **Money (Budget Reality Simulator)**: Pure mathematical code, **NOT AI**. 2,000 triangular random distribution runs per budget item using a seeded `mulberry32` PRNG. Computes **P50**, **P80**, **P95**, and the exact percent probability of exceeding the target budget. Includes a WCAG AA striped pattern histogram and accessible data table.
4. **Call Sheet (Timeline)**: Tasks scheduled backward from the event call date. Calculates slack days and stamps critical path tasks with an unyielding **HOLD (0d)** badge.
5. **Vendor Checklist**: Categorized vendor tracking with status lifecycle (`to_call`, `quoted`, `booked`, `confirmed`), quotes, and deadlines.
6. **Guest Panel**: AI review playing 4 guest personas (Strict Grandparent, Vegan Friend, Parent with Toddler, Wheelchair User) alongside an event accessibility audit.
7. **Personalized Ideas**: Bespoke atmosphere themes, interactive activities, hospitality menus, and unexpected small touches.
8. **Plan B Switch**: Physical-styled two-position toggle applying deterministic transformations for **Rain**, **Vendor Cancelled**, **Budget Cut 20%**, and **+30 Guests**.
9. **Share & Export**: RFC 5545 `.ics` calendar generation, 7-day expiring token read-only share view (`/share/[token]`), and a print stylesheet for a black-on-white one-page Call Sheet.

---

## 🎨 Design Aesthetic: "The Rehearsal Room"

Standby looks and feels like a theatre stage manager's backstage binder:
- **Palette**: Paper background (`#F4ECDC`), stage ink (`#1B1A17`), cue-red (`#B42318`), safe-green (`#1F6B3A`), and gaffer tape yellow (`#E0A800`). Dark mode switches to high-contrast "Blackout" (`#12110F`).
- **Signature CSS-Only Elements**: Torn bottom edge cue cards, `-3deg` stamped risk labels, HOLD badges, physical switch tracks, and stripe-patterned histogram bars.
- **Accessibility & Contrast**: Built-in script `npm run check:contrast` validates WCAG AA contrast (minimum 4.5:1 for normal text, 3:1 for large text) across all light and dark token pairs.

---

## ⚡ Keep-Alive & Monitoring

- **`/api/health`**: Dynamic, uncached endpoint that pings the Supabase database and verifies query execution. Returns `{ ok: true, time }` with 200 status, or 503 if unavailable. Never returns secrets.
- **GitHub Actions Workflow (`.github/workflows/keepalive.yml`)**: Executes on a cron schedule every 12 hours. Pings the repository variable `HEALTH_URL` to prevent free database pausing.
- **UptimeRobot Setup**:
  1. Create a free monitor at [UptimeRobot](https://uptimerobot.com).
  2. Set monitor type to `HTTP(s)` pointing to `https://<YOUR-APP>/api/health`.
  3. Set interval to 5 minutes (`⚠️ UNVERIFIED`: verify current free plan interval limits).

---

## ⚙️ Development & Scripts

```bash
# Install dependencies
npm install

# Run contrast verification (enforces WCAG AA)
npm run check:contrast

# Typecheck TypeScript
npm run typecheck

# Run unit and component test suite with coverage
npm test

# Build for production
npm run build

# Run Playwright E2E & Axe accessibility audits
npm run test:e2e
```

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous key (never service-role) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key (server-side only) |
| `GEMINI_MODEL` | Optional | Default `gemini-2.5-flash` |
| `AI_MODE` | Optional | `live` or `mock` (mock returns deterministic templates) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Base URL for share links and metadata |

---

## ⚠️ Unverified Claims & Limits

- ⚠️ **UNVERIFIED**: Free UptimeRobot monitoring interval policy on new free accounts (standard historical free tier is 5 minutes).
- ⚠️ **UNVERIFIED**: Supabase free-tier project pause policy threshold (commonly 7 days of inactivity; mitigated by the keepalive workflow).
- ⚠️ **UNVERIFIED**: Gemini 2.5 Flash free-tier queries-per-minute ceiling in non-US regional deployments.
