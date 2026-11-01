import Link from "next/link";
import { GafferTape } from "@/components/GafferTape";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-6 sm:py-10 max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-4">
        <span className="gaffer-tape select-none text-xs sm:text-sm">
          PROMPTWARS CHALLENGE 5: CELEBRATION & EVENT PLANNER
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-[var(--ink)]">
          Standby.
        </h1>
        <p className="font-display italic text-xl sm:text-2xl text-[var(--cue-red)] max-w-2xl font-bold">
          &ldquo;Standby. Your event is rehearsed.&rdquo;
        </p>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl leading-relaxed">
          The GenAI planning assistant that helps users organize <strong>weddings</strong>, <strong>birthdays</strong>, and <strong>community events</strong> with <strong>budgets</strong>, <strong>timelines</strong>, <strong>vendor checklists</strong>, and <strong>personalized ideas</strong>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/events/new"
            className="px-6 py-3 bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-sm rounded shadow hover:opacity-90 min-h-[44px] flex items-center"
          >
            Start Your First Rehearsal →
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border-2 border-[var(--ink)] bg-[var(--card-bg)] text-[var(--ink)] font-mono font-bold text-sm rounded hover:bg-[var(--line)] min-h-[44px] flex items-center"
          >
            Try As Guest / Sign In
          </Link>
        </div>
      </section>

      <GafferTape label="LIVE SAMPLE CUE SHEET" />

      {/* Live Sample Call Sheet */}
      <section aria-labelledby="sample-cue-sheet-title" className="cue-card cue-card-torn p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4 mb-4">
          <div>
            <span className="stamp-label text-xs">REHEARSAL PREVIEW</span>
            <h2 id="sample-cue-sheet-title" className="font-display font-bold text-xl mt-2 text-[var(--ink)]">
              Sample Production: 100-Guest Autumn Wedding
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="standby-light" role="status" aria-label="Engine standby" />
            <span className="font-mono text-xs text-[var(--muted)]">STANDBY ACTIVE</span>
          </div>
        </div>

        <div className="divide-y divide-[var(--line)] font-mono text-xs sm:text-sm">
          <div className="py-2.5 grid grid-cols-12 items-center gap-2">
            <div className="col-span-2 font-bold text-[var(--cue-red)]">Q1</div>
            <div className="col-span-3 text-[var(--muted)]">T-180 Days</div>
            <div className="col-span-5 font-medium text-[var(--ink)]">Secure venue & sign contract</div>
            <div className="col-span-2 text-right"><span className="hold-badge">HOLD (0d)</span></div>
          </div>
          <div className="py-2.5 grid grid-cols-12 items-center gap-2">
            <div className="col-span-2 font-bold text-[var(--cue-red)]">Q2</div>
            <div className="col-span-3 text-[var(--muted)]">T-120 Days</div>
            <div className="col-span-5 font-medium text-[var(--ink)]">Book caterer & sample tasting</div>
            <div className="col-span-2 text-right"><span className="hold-badge">HOLD (0d)</span></div>
          </div>
          <div className="py-2.5 grid grid-cols-12 items-center gap-2">
            <div className="col-span-2 font-bold text-[var(--cue-red)]">Q3</div>
            <div className="col-span-3 text-[var(--muted)]">T-90 Days</div>
            <div className="col-span-5 font-medium text-[var(--ink)]">Send save-the-dates & collect diets</div>
            <div className="col-span-2 text-right text-[var(--safe-green)] font-semibold">+14d slack</div>
          </div>
          <div className="py-2.5 grid grid-cols-12 items-center gap-2">
            <div className="col-span-2 font-bold text-[var(--cue-red)]">Q4</div>
            <div className="col-span-3 text-[var(--muted)]">T-1 Day</div>
            <div className="col-span-5 font-medium text-[var(--ink)]">Backstage walkthrough & vendor roll call</div>
            <div className="col-span-2 text-right"><span className="hold-badge">HOLD (0d)</span></div>
          </div>
        </div>
      </section>

      <GafferTape label="THREE REHEARSAL PILLARS" />

      {/* 3 Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="cue-card p-5">
          <div className="font-mono text-xs font-bold text-[var(--cue-red)] uppercase mb-2">Pillar 1</div>
          <h3 className="font-display font-bold text-lg mb-2 text-[var(--ink)]">Budget That Tells the Truth</h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Pure code, NOT AI. Monte Carlo simulation with 2,000 runs using triangular distribution per item. Shows P50, P80, P95 and the exact probability of going over budget.
          </p>
        </article>

        <article className="cue-card p-5">
          <div className="font-mono text-xs font-bold text-[var(--cue-red)] uppercase mb-2">Pillar 2</div>
          <h3 className="font-display font-bold text-lg mb-2 text-[var(--ink)]">Timeline That Counts Backward</h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Call sheets scheduled backward from the event date with topological dependency sorting. Automatically highlights the critical path with HOLD badges.
          </p>
        </article>

        <article className="cue-card p-5">
          <div className="font-mono text-xs font-bold text-[var(--cue-red)] uppercase mb-2">Pillar 3</div>
          <h3 className="font-display font-bold text-lg mb-2 text-[var(--ink)]">Plan B in One Click</h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Switch from Plan A to Plan B instantly: Rain, Vendor Cancelled, Budget Cut 20%, or +30 Guests. Deterministic adjustments with AI explanations.
          </p>
        </article>
      </section>
    </div>
  );
}
