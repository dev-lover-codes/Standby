# Standby

> **"Standby. Your event is rehearsed."**

Standby answers **PromptWars Challenge 5 (Celebration & Event Planner)**. It is a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with **budgets**, **timelines**, **vendor checklists**, and **personalized ideas**.

Unlike traditional planners, Standby **rehearses the event on paper** before a single dollar is spent.

## Core Features
1. **Slate (Brief)**: Generates a complete event plan (JSON) from a user brief using Gemini.
2. **Pre-Mortem**: Identifies 5 failure scenarios with concrete Plan B contingencies.
3. **Money (Budget Reality Simulator)**: Pure deterministic Monte Carlo simulation (triangular distribution) computing P50, P80, P95, and over-budget risk.
4. **Call Sheet (Timeline)**: Backward topological scheduler computing critical path and slack days.
5. **Vendor Checklist**: Categorized vendor tracking with status lifecycle and quotes.
6. **Guest Panel**: AI perspectives from 4 diverse guest personas and an accessibility review.
7. **Personalized Ideas**: Contextual themes, activities, and touches.
8. **Plan B Switch**: Deterministic scenario switch (Rain, Vendor cancelled, Budget cut 20%, +30 guests).
9. **Share + Export**: Read-only expiring share link, `.ics` calendar export, and print-ready stylesheet.

## Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run contrast check
npm run check:contrast

# 3. Run unit tests
npm test

# 4. Build for production
npm run build
```

## Verified vs ⚠️ UNVERIFIED
- **Verified**: Next.js App Router, TypeScript strict, Tailwind CSS, Vitest unit test suite with seeded PRNG, WCAG AA contrast verification.
- ⚠️ **UNVERIFIED**: Gemini API free-tier exact rate limits in production regions.
- ⚠️ **UNVERIFIED**: Free UptimeRobot monitoring ping interval (typically 5 minutes on free tier).
