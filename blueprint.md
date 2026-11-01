# Blueprint: Standby ("Standby. Your event is rehearsed.")

## 1. Overview & Purpose
Standby is an event & celebration planner answering PromptWars Challenge 5. It helps users organize weddings, birthdays, and community events with:
- **Budget**: Reality Simulator via deterministic Monte Carlo simulation (triangular distribution per item, seeded PRNG, P50/P80/P95, histogram).
- **Timeline**: Call Sheet backward scheduler with dependency graph, topological sort, cycle detection, critical path calculation, and slack days.
- **Vendor Checklist**: Categorized vendor tracking with status lifecycle (`to_call`, `quoted`, `booked`, `confirmed`), quotes, and deadlines.
- **Personalized Ideas**: Contextual themes, activities, and touches generated via Google Gemini API (with robust local offline fallback).
- **Pre-Mortem**: 5 failure risk scenarios with Plan B mitigations.
- **Guest Panel**: AI review from 4 distinct guest personas plus an accessibility checklist.
- **Plan B Switch**: Physical-styled two-position toggle applying deterministic scenario transformations (Rain, Vendor cancelled, Budget cut 20%, +30 guests).
- **Share & Export**: RFC 5545 `.ics` export, expiring token read-only share links, print stylesheet.

## 2. Style, Architecture & Design Tokens: "The Rehearsal Room"
- **Visual Aesthetic**: Stage manager backstage paper cue sheet. No purple gradients or space imagery.
- **Color Tokens**:
  - Light (Paper): Background `#F4ECDC`, Ink `#1B1A17`, Cue-Red `#B42318`, Safe-Green `#1F6B3A`, Tape-Yellow `#E0A800`, Line `#CFC3AA`.
  - Dark ("Blackout"): Background `#12110F`, Ink/Text `#F1E9D8`, Red `#FF8A7A`, Green `#7DD3A0`, Yellow `#F2C94C`, Line `#38352F`.
- **Typography**:
  - Headings: `Fraunces`
  - Body: `Public Sans`
  - Cue & Data: `IBM Plex Mono`
- **Contrast**: Script `check:contrast` enforcing minimum 4.5:1 (3:1 for large text).
- **Accessibility**: 100 Lighthouse target, 0 axe violations, complete keyboard ARIA tabs navigation, 44x44px min tap targets, forced-colors compatible.

## 3. Implementation Plan & Progress

### Phase 1: Foundation & Design Tokens (COMPLETED)
- [x] Dependencies: Vitest, Testing Library, Prettier, `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `@google/genai` (or official Google Gen AI SDK), Lucide icons (if needed) / CSS icons.
- [x] Folder structure: `src/lib/ai`, `src/lib/budget`, `src/lib/timeline`, `src/lib/scenarios`, `src/lib/ics`, `src/lib/supabase`, `src/lib/validation`, `src/lib/share`, `src/components`, `src/app`.
- [x] Design tokens, CSS variables, `globals.css`, Google fonts (`Fraunces`, `Public Sans`, `IBM Plex Mono`).
- [x] Theme toggle with localStorage persistence & flash-free inline script.
- [x] App shell (Skip link, Header with Fraunces wordmark, Nav, Main, Footer, Theme toggle).
- [x] `scripts/check-contrast.ts` ensuring WCAG AA contrast compliance.
- [x] `.env.example`, `.gitignore`, README skeleton.
- [x] Test foundation: lint, typecheck, contrast check, build.

### Phase 2: Database & Auth (COMPLETED)
- [x] Supabase migrations in `supabase/migrations/` for `events`, `risks`, `tasks`, `vendors`, `budget_items`, `share_links`, `ai_usage`.
- [x] Row Level Security (RLS) on all tables (`owner_id = (select auth.uid())`).
- [x] Security Definer function `get_shared_event(p_token text)` and `consume_ai_quota(p_max int)` and `ping()`.
- [x] TypeScript database types.
- [x] `@supabase/ssr` client, server, and middleware.
- [x] Accessible `/login` page with email/password and "Try as guest" anonymous sign-in, session guards for `/dashboard` and `/events/*`.

### Phase 3: Pure Logic & Unit Tests (>85% coverage) (COMPLETED)
- [x] `src/lib/validation/schemas.ts`: Zod schemas with bounds and sanitization.
- [x] `src/lib/budget/simulate.ts`: Triangular Monte Carlo simulation with `mulberry32` PRNG.
- [x] `src/lib/timeline/schedule.ts`: Backward topological scheduler, cycle detection with `CycleError`, critical path & slack computation.
- [x] `src/lib/scenarios/apply.ts`: Deterministic scenario transformation (`rain`, `vendor_cancelled`, `budget_cut_20`, `guests_plus_30`).
- [x] `src/lib/ics/build.ts`: RFC 5545 compliant `.ics` calendar generation (CRLF, 75-octet folding, escaped text).
- [x] `src/lib/share/token.ts`: Crypto random token generation and expiry check.
- [x] Exhaustive Vitest test suite.

### Phase 4: AI Layer & Fallbacks (COMPLETED)
- [x] `src/lib/ai/client.ts`: Google Gemini client with server-only protection, JSON mode, timeout & single retry.
- [x] `src/lib/ai/schemas.ts`: Strict Zod output schemas for Plan, Pre-Mortem, Guest Panel, Scenario Explanation.
- [x] `src/lib/ai/prompts.ts`: Delimited prompt builders (`<brief>...</brief>`) immune to injection.
- [x] `src/lib/ai/fallback.ts`: High quality local template plans for weddings, birthdays, community, and other events.
- [x] `src/lib/ai/service.ts`: Quota check, AI invocation, fallback handler.
- [x] Server Actions in `src/app/actions.ts`: `createEvent`, `runPreMortem`, `runGuestPanel`, `applyScenarioAction`, `createShareLink`, `deleteEvent`.
- [x] Tests with mocked AI scenarios.

### Phase 5: Rehearsal Room UI (COMPLETED)
- [x] `/` Landing page: Hero, tagline, live static sample Call Sheet, 3 feature pillars.
- [x] `/dashboard`: Productions list with cue-sheet cards, days left badge, accessible delete confirmation dialog.
- [x] `/events/new`: Slate brief form with live char counter, event kind, date, guest count, budget, outdoor toggle.
- [x] `/events/[id]`:
  - Physical Plan B Switch & scenario picker.
  - ARIA tabs (Call Sheet, Pre-Mortem, Money, Vendors, Guest Panel, Ideas).
  - Call Sheet: Q cue list, call dates, HOLD critical path badges, checkbox toggle, .ics download.
  - Pre-Mortem: 5 risk cards with -3deg stamp label and Plan B.
  - Money: Budget Simulator stats (P50/P80/P95), accessible SVG/CSS stripe pattern histogram, table alternative.
  - Vendors: Checklist table, status selectors, quote & deadline, progress indicator.
  - Guest Panel: 4 persona cards + accessibility checks.
  - Ideas: Personalized idea cards.
- [x] `/share/[token]`: Read-only public share view.
- [x] Print stylesheet (`@media print` for clean 1-page Call Sheet).

### Phase 6: Hardening (Security, Performance, A11Y) (COMPLETED)
- [x] Nonce-based CSP & security headers in `middleware.ts`.
- [x] Lazy loading for heavy elements, bundle optimization.
- [x] Accessibility review: ARIA landmarks, focus rings, keyboard navigability, contrast.

### Phase 7: Tests, CI & Keep-Alive (COMPLETED)
- [x] Component tests with Testing Library (`tests/components/`).
- [x] Playwright E2E configuration & Axe accessibility audit specs (`e2e/accessibility-and-flows.spec.ts`).
- [x] `/api/health` route with `ping()` check and test suite.
- [x] `.github/workflows/ci.yml` and `.github/workflows/keepalive.yml`.

### Phase 8 & 9: Documentation & Verification
- [ ] Comprehensive `README.md` under 250 lines with Mermaid diagram and `⚠️ UNVERIFIED` notes.
- [ ] `docs/ARCHITECTURE.md`.
- [ ] Final audit against Definition of Done checklist.
