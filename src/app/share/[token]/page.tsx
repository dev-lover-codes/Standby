import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { scheduleBackward, type InputScheduleTask } from "@/lib/timeline/schedule";
import { CallSheetTab } from "@/components/CallSheetTab";
import { PreMortemTab } from "@/components/PreMortemTab";
import { MoneyTab } from "@/components/MoneyTab";
import { VendorsTab, type VendorItem } from "@/components/VendorsTab";
import { GuestPanelTab } from "@/components/GuestPanelTab";
import { IdeasTab } from "@/components/IdeasTab";
import {
  getFallbackPlan,
  getFallbackPreMortem,
  getFallbackGuestPanel,
} from "@/lib/ai/fallback";
import type { BudgetItem } from "@/lib/validation/schemas";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_shared_event", {
    p_token: token,
  });

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="cue-card cue-card-torn p-8 border-2 border-[var(--cue-red)] flex flex-col items-center gap-4">
          <span className="stamp-label text-xs">EXPIRED OR INVALID</span>
          <h1 className="font-display font-black text-2xl text-[var(--ink)]">
            Rehearsal Access Unavailable
          </h1>
          <p className="text-sm text-[var(--muted)]">
            This share link has expired or does not exist. Share tokens are strictly time-bounded for security.
          </p>
          <Link
            href="/events/new"
            className="mt-2 px-6 py-2.5 bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-xs rounded min-h-[44px] flex items-center"
          >
            Rehearse Your Own Event on Standby →
          </Link>
        </div>
      </div>
    );
  }

  const payload = data as {
    event: { id: string; title: string; kind: "wedding" | "birthday" | "community" | "other"; event_date: string; guest_count: number; budget_total: number; brief: string };
    tasks: Array<{ id: string; title: string; duration_days: number; depends_on: string[]; due_date?: string; done?: boolean }>;
    risks: Array<{ id: string; title: string; plan_b: string; likelihood: number; impact: number }>;
    vendors: Array<{ id: string; category: string; name: string; status: "to_call" | "quoted" | "booked" | "confirmed"; quote: number | null; deadline?: string | null }>;
    budget_items: Array<{ name: string; min_cost: number; likely_cost: number; max_cost: number; scales_with_guests?: boolean }>;
  };

  const promptCtx = {
    title: payload.event.title,
    kind: payload.event.kind,
    event_date: payload.event.event_date,
    guest_count: payload.event.guest_count,
    budget_total: Number(payload.event.budget_total),
    outdoor: false,
    brief: payload.event.brief,
  };

  const fallback = getFallbackPlan(promptCtx);
  const fallbackPreMortem = getFallbackPreMortem();
  const fallbackGuestPanel = getFallbackGuestPanel();

  const rawTasks: InputScheduleTask[] = (payload.tasks && payload.tasks.length > 0)
    ? payload.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        duration_days: t.duration_days,
        depends_on: t.depends_on || [],
        done: t.done,
      }))
    : fallback.tasks.map((t, idx) => ({
        id: `fb-t-${idx}`,
        title: t.title,
        duration_days: t.duration_days,
        depends_on: [],
        done: false,
      }));

  const scheduled = scheduleBackward(rawTasks, payload.event.event_date);

  const budgetItems: BudgetItem[] = (payload.budget_items && payload.budget_items.length > 0)
    ? payload.budget_items.map((b) => ({
        name: b.name,
        min_cost: Number(b.min_cost),
        likely_cost: Number(b.likely_cost),
        max_cost: Number(b.max_cost),
        scales_with_guests: !!b.scales_with_guests,
      }))
    : fallback.budget_items.map((b) => ({
        name: b.name,
        min_cost: b.min,
        likely_cost: b.likely,
        max_cost: b.max,
        scales_with_guests: b.scales_with_guests,
      }));

  const vendors: VendorItem[] = (payload.vendors && payload.vendors.length > 0)
    ? payload.vendors.map((v) => ({
        id: v.id,
        category: v.category,
        name: v.name,
        status: v.status,
        quote: v.quote ? Number(v.quote) : 0,
        deadline: v.deadline || "",
      }))
    : fallback.vendors.map((v, i) => ({
        id: `fb-v-${i}`,
        category: v.category,
        name: v.tip || v.category,
        status: "to_call",
        quote: 0,
        deadline: "",
      }));

  const risks = (payload.risks && payload.risks.length > 0)
    ? payload.risks.map((r) => ({
        id: r.id,
        title: r.title,
        plan_b: r.plan_b,
        likelihood: r.likelihood,
        impact: r.impact,
      }))
    : fallbackPreMortem.risks.map((r, idx) => ({
        id: `fb-r-${idx}`,
        title: r.title,
        plan_b: r.plan_b,
        likelihood: r.likelihood,
        impact: r.impact,
      }));

  const personas = fallbackGuestPanel.personas.map((p) => ({
    persona: p.role,
    feedback: p.concern,
    concernArea: p.plan_part,
  }));

  const accessibilityChecks = fallbackGuestPanel.accessibility_checks.map((c) => ({
    check: c.item,
    status: (c.status === "ok" ? "pass" : "needs_attention") as "pass" | "needs_attention" | "fail",
    detail: c.note,
  }));

  const ideas = fallback.ideas.map((idea) => ({
    category: "themes",
    title: idea.title,
    description: idea.why,
  }));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="p-3 bg-[var(--tape-yellow)] text-[#1B1A17] font-mono text-xs font-bold flex items-center justify-between rounded shadow-sm no-print">
        <span>READ-ONLY REHEARSAL COPY • ACTIVE ACCESS TOKEN</span>
        <Link href="/" className="underline hover:opacity-80">
          Powered by Standby
        </Link>
      </div>

      <header className="cue-card p-6 border-l-4 border-l-[var(--ink)]">
        <span className="font-mono text-xs uppercase bg-[var(--line)] px-2 py-0.5 rounded text-[var(--ink)] font-bold">
          {payload.event.kind} PRODUCTION
        </span>
        <h1 className="font-display font-black text-3xl text-[var(--ink)] mt-2">
          {payload.event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--muted)] mt-2">
          <span>Call Date: <strong>{payload.event.event_date}</strong></span>
          <span>Guests: <strong>{payload.event.guest_count}</strong></span>
          <span>Target Budget: <strong>${Number(payload.event.budget_total).toLocaleString()}</strong></span>
        </div>
      </header>

      <section aria-labelledby="shared-call-sheet-heading">
        <h2 id="shared-call-sheet-heading" className="font-display font-bold text-xl mb-3 text-[var(--ink)]">
          Timeline Call Sheet
        </h2>
        <CallSheetTab
          tasks={scheduled}
          eventTitle={payload.event.title}
          eventDate={payload.event.event_date}
        />
      </section>

      <section aria-labelledby="shared-pre-mortem-heading">
        <h2 id="shared-pre-mortem-heading" className="font-display font-bold text-xl mb-3 text-[var(--ink)]">
          Pre-Mortem Failure Risks & Plan B
        </h2>
        <PreMortemTab risks={risks} />
      </section>

      <section aria-labelledby="shared-money-heading">
        <h2 id="shared-money-heading" className="font-display font-bold text-xl mb-3 text-[var(--ink)]">
          Budget Reality Simulation
        </h2>
        <MoneyTab
          items={budgetItems}
          targetBudget={Number(payload.event.budget_total)}
        />
      </section>

      <section aria-labelledby="shared-vendors-heading">
        <VendorsTab initialVendors={vendors} />
      </section>

      <section aria-labelledby="shared-guest-panel-heading">
        <GuestPanelTab
          personas={personas}
          accessibilityChecks={accessibilityChecks}
        />
      </section>

      <section aria-labelledby="shared-ideas-heading">
        <IdeasTab ideas={ideas} />
      </section>
    </div>
  );
}
