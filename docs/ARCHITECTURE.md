# Standby System Architecture

This document outlines the architectural principles, data flows, security boundaries, and design choices of **Standby**.

---

## 1. Core Principles

1. **Rehearse Before Execution**: Every calculation (money variance, backward schedules, crisis contingencies) happens before any physical or monetary commitment.
2. **Pure Business Logic in `src/lib`**: All simulation algorithms, topological graph schedulers, scenario transforms, and calendar serialization functions are pure TypeScript functions. They have no DOM or React dependencies and are tested with 100% repeatability via seeded PRNGs.
3. **Resilient AI Pipeline**: The Gemini API is treated as an optional enhancement. If the API is slow, rate-limited, or unconfigured, the application gracefully falls back to deterministic local templates without failing or crashing.
4. **Accessible "Orbit" Design**: Black space hero landing page (planet video, Inter, glass surfaces); app pages share the same black, white and glass style. Zero axe-core accessibility violations.

---

## 2. Directory Structure

```
├── .github/workflows/
│   ├── ci.yml                 # CI: lint, typecheck, contrast, unit/component tests, build, e2e
│   └── keepalive.yml          # Keep-alive cron pinging /api/health every 12 hours
├── e2e/
│   └── accessibility-and-flows.spec.ts # Playwright + Axe accessibility scans
├── scripts/
│   └── check-contrast.ts      # Automated WCAG AA contrast ratio verification script
├── src/
│   ├── app/                   # Next.js App Router pages and Server Actions
│   │   ├── actions.ts         # Authenticated Server Actions (create, delete, scenario, share)
│   │   ├── api/health/        # Dynamic health ping endpoint for Supabase
│   │   ├── dashboard/         # "Productions" management list
│   │   ├── events/[id]/       # Event rehearsal view (Plan B switch, 6 ARIA tabs)
│   │   ├── events/new/        # "Slate" brief submission form
│   │   ├── login/             # Accessible authentication & anonymous guest sign-in
│   │   └── share/[token]/     # Read-only token-gated public view
│   ├── components/            # Thin, accessible UI components (Tabs, Switch, Histogram, etc.)
│   └── lib/                   # Pure business logic modules
│       ├── ai/                # Gemini client, injection-isolated prompts, fallback templates
│       ├── budget/            # Monte Carlo triangular distribution simulation
│       ├── ics/               # RFC 5545 calendar serializer with 75-octet folding
│       ├── scenarios/         # Deterministic Plan B transforms
│       ├── share/             # Crypto-random token generation & validation
│       ├── supabase/          # SSR browser and server clients, session helpers (proxy refreshes sessions)
│       ├── timeline/          # Kahn's topological backward scheduler & critical path
│       └── validation/        # Zod schemas for all models and inputs
└── supabase/
    ├── migrations/            # Schema DDL, constraints, foreign keys, indexes, and RLS
    └── tests/                 # SQL RLS isolation proof queries
```

---

## 3. Pure Logic Modules

### 3.1 Budget Reality Simulator (`src/lib/budget/simulate.ts`)
- Implements a triangular distribution `T(min, likely, max)`.
- Uses a deterministic `mulberry32` pseudo-random number generator to guarantee reproducibility across test suites and simulation runs.
- Calculates P50 (median), P80 (conservative target), P95 (tail risk), and empirical overrun probability `P(Cost > Budget)`.
- Generates 12 equal-interval histogram buckets with accessible stripe/dot patterns.

### 3.2 Backward Timeline Scheduler (`src/lib/timeline/schedule.ts`)
- Computes task schedules backward from the target event date.
- Employs Kahn's algorithm for topological ordering and cycle detection. Throws typed `CycleError` with the cycle chain upon detection.
- Computes earliest start, latest start, slack days, and flags zero-slack tasks with the critical path indicator (`HOLD`).

### 3.3 Plan B Switch (`src/lib/scenarios/apply.ts`)
- Pure function applying one-click crisis scenarios:
  - `rain`: Disables outdoor flag, inserts tent procurement cues, adjusts equipment budget.
  - `vendor_cancelled`: Reverts target vendor to `to_call`, inserts emergency backup tasks.
  - `budget_cut_20`: Reductions applied to discretionary items while preserving non-negotiable costs.
  - `guests_plus_30`: Scales guest-sensitive catering and rental costs, updates seating tasks.

---

## 4. Security & Isolation

- **Prompt-Injection Defense**: Creative brief inputs are bounded to 1,500 characters, wrapped in isolated `<brief>` XML delimiters, and explicitly marked as raw data to prevent instruction spoofing.
- **Strict Row Level Security (RLS)**: Enforced on all Supabase tables (`events`, `tasks`, `risks`, `vendors`, `budget_items`, `share_links`, `ai_usage`). Users can only query rows where `owner_id = (select auth.uid())`.
- **Public Share View**: Uses a PostgreSQL `security definer` function `get_shared_event(p_token text)` with strict `search_path = ''`. Only returns sanitised event data if `expires_at > now()`, never exposing owner UUIDs or sensitive credentials.
- **Client Bundle Safety**: Verified via bundle scans ensuring `GEMINI_API_KEY` and Supabase service-role keys are never packaged into client-facing bundles.
- **Security Headers**: Nonce-based CSP without `unsafe-eval` in production, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `frame-ancestors 'none'`.
