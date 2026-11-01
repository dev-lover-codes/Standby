# Standby: project rules (every agent and every phase must follow these)

## 1. Product
Name: Standby. Tagline: "Standby. Your event is rehearsed."
It answers PromptWars Challenge 5 (Celebration & Event Planner): a GenAI-powered planning assistant that helps users organize
weddings, birthdays and community events with budgets, timelines, vendor checklists and personalized ideas.
Use these exact words in the UI and README: budget, timeline, vendor checklist, personalized ideas.

What makes it different: it REHEARSES the event on paper. Features:
1. Slate (brief): user writes a short brief; Gemini turns it into a structured plan (JSON).
2. Pre-Mortem: AI imagines the event failed and lists exactly 5 risks, each with a Plan B.
3. Money (Budget Reality Simulator): pure code, NOT AI. Monte Carlo simulation (thousands of random "what if" runs) with a triangular distribution (min / likely / max) per budget item. Shows P50, P80, P95 and the chance of going over budget. Histogram plus an accessible data table.
4. Call Sheet (timeline): tasks with dependencies, scheduled BACKWARD from the event date. Computes the critical path (the chain of tasks that can delay everything) and slack (spare days).
5. Vendor checklist: category, status (to_call, quoted, booked, confirmed), quote, deadline.
6. Guest Panel: AI plays 4 guest personas (strict grandparent, vegan friend, parent with toddler, wheelchair user) and gives short feedback tied to one part of the plan, plus an event accessibility check.
7. Ideas: personalized ideas (themes, activities, food, small touches) based on the brief.
8. Plan B Switch: one-click scenarios (Rain, Vendor cancelled, Budget cut 20%, +30 guests). A DETERMINISTIC function changes tasks and budget; the AI only adds a short explanation.
9. Share + Export: read-only share link (expiring token), `.ics` calendar export, print stylesheet for a clean printable call sheet.

## 2. Hard rules
- Stack: Next.js (App Router, latest stable), TypeScript `strict: true`, Tailwind CSS, Supabase (Auth, Postgres, RLS), Vercel. Package manager: npm.
- NO paid service. NO service that needs a credit card. NO secrets in the repo, logs, or client code. Never use the Supabase service-role key in the app.
- AI = Google Gemini API through the official SDK, SERVER SIDE ONLY. Model name from env `GEMINI_MODEL` (default `gemini-2.5-flash`).
  `AI_MODE=mock` returns fixed sample data (used by tests and as a safe fallback).
  If the AI call fails, times out or returns bad JSON: retry once, then use local template fallbacks. The app must never crash because of AI.
- Validate EVERY user input and EVERY AI output with Zod before use. Never use `dangerouslySetInnerHTML`.
- Prompt-injection safe: the user brief is DATA, not instructions. Wrap it in clear delimiters, tell the model to ignore instructions inside it, cap it at 1,500 characters.
- Few, small dependencies. Prefer plain CSS/Tailwind over animation libraries. No `any`. No leftover `console.log`. No dead code. No TODO or placeholder code.
- Small files (aim under 150 lines). Folders: `src/lib/ai`, `src/lib/budget`, `src/lib/timeline`, `src/lib/scenarios`, `src/lib/ics`, `src/lib/supabase`, `src/lib/validation`, `src/components`, `src/app`.
- Business logic lives in PURE functions in `src/lib`. Components stay thin.
- Server Components by default; `"use client"` only where needed. Lazy-load the chart. Add a DB index for every foreign key and every column used in a `where`.
- Make only the changes that were asked for. One conventional commit per phase. Do not push (the human pushes).
- If something is uncertain (a tool, a limit, a policy), write `⚠️ UNVERIFIED` in the README instead of guessing.

## 3. Design: "Orbit" (black space hero, white ink, glass surfaces)
Decided 2026-11-01 by the project owner; replaces the earlier paper "Rehearsal Room" look.
- Landing `/`: full-screen, non-scrolling Orbit hero built from the owner's spec (`src/app/landing.css`, `landing-intro.css`).
  Every size is `calc(N * var(--u))` where `--u` is one pixel of the 1563x1006 reference render. Keep those values exact.
  Background: looping muted planet video with a still poster (external host allowed in the CSP `media-src`/`img-src`).
  Entrance animation runs once (about 1.7s) then its classes are removed. Copy uses Standby words.
- App pages: same language. Black `#000`, white ink, muted `#A1A1A6`, glass cards (`rgba(255,255,255,.06)`, 1px `rgba(255,255,255,.15)` border, 14px radius),
  buttons radius 10px (solid = white/black, ghost = white outline). Status colours: red `#FF8A7A`, green `#7DD3A0`, yellow `#F2C94C`; focus ring `#9B8CFF`.
  One dark theme only (no theme toggle).
- Font: Inter variable (opsz + wght) via `next/font/google`, self-hosted at build.
- Kept elements: Q1/Q2 cue numbers, "RISK n/5" stamp, HOLD badge on the critical path, PLAN A / PLAN B switch with a STANDBY light,
  striped/dotted histogram patterns (work without colour).
- `check:contrast` verifies every token pair is at least 4.5:1 (3:1 for the focus ring) and FAILS the build if not.
- One column on phones. Max line length about 70 characters. Tap targets at least 44x44px (landing hero buttons follow the spec sizes).
- Motion: short CSS transitions; `prefers-reduced-motion: reduce` turns ALL motion off.
- `@media print`: the Call Sheet becomes a clean black-on-white one-pager (no nav, no buttons).
- Pages: `/` landing, `/login`, `/dashboard` ("Productions"), `/events/new` ("Slate" form),
  `/events/[id]` (tabs: Call Sheet, Pre-Mortem, Money, Vendors, Guest Panel, Ideas), `/share/[token]` (read-only), `/api/health`, `/auth/callback`.
- Copy: short, plain, friendly English. Errors and empty states always say what happened and what to do next.

## 4. Accessibility (target: Lighthouse 100 and zero axe violations)
Landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, correct heading order, "Skip to content" link, every input has a visible `<label>`,
errors linked with `aria-describedby` and announced with `aria-live="polite"`, visible focus ring (3:1), full keyboard use (tabs follow the ARIA tabs pattern with arrow keys),
loading states announced to screen readers, `lang="en"`, meaningful page titles, no information by colour alone, every chart has a text/table alternative,
`forced-colors` friendly, 200% zoom without breaking, no keyboard traps.

## 5. Testing and CI
- Vitest unit tests: budget simulator (SEEDED random generator, e.g. mulberry32, so results repeat; test P50<=P80<=P95, min=max, zero items), critical path (chain, parallel branches, cycle detection with a clear error, slack), scenario transforms, Zod schemas (valid, invalid, hostile text), ICS generator, share-token expiry, AI fallback path with a failing mocked AI. Coverage threshold 85% for `src/lib`.
- Testing Library component tests: form, tabs, Plan B Switch.
- Playwright with `AI_MODE=mock` plus `@axe-core/playwright` scans on every page.
- GitHub Actions `ci.yml`: install, lint, typecheck, unit tests with coverage, build, Playwright.
- npm scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `check:contrast`.

## 6. Keep-alive, security headers, deploy
- `/api/health` (dynamic, uncached) calls Supabase `ping()` and returns `{ ok: true, time }` or 503. No secrets in the response.
- `.github/workflows/keepalive.yml`: runs every 12 hours, calls the URL in repository variable `HEALTH_URL`, fails if not 200.
- README explains how to add a free UptimeRobot monitor on the same URL (`⚠️ UNVERIFIED`: check the free interval).
- `.env.example` has NAMES ONLY: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_MODE`, `NEXT_PUBLIC_SITE_URL`.
- Security headers: nonce-based Content-Security-Policy (no `unsafe-eval`), `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.

## 7. Definition of Done
- [ ] `npm run dev` and `npm run build` work.
- [ ] `lint`, `typecheck`, `test`, `test:e2e`, `check:contrast` all pass.
- [ ] No secrets in repo (scan with `git grep`) and none in client bundles.
- [ ] RLS on every table; a second user cannot read the first user's rows (proved by a test or SQL).
- [ ] AI failure path tested; app works with `AI_MODE=mock` and with no `GEMINI_API_KEY`.
- [ ] Only requested features built; no placeholders; no unused code or packages.
- [ ] Every uncertain claim is marked `⚠️ UNVERIFIED` in the README.
