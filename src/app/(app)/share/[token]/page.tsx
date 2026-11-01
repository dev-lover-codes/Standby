import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildEventView, type BudgetRow, type EventRow, type RiskRow, type TaskRow, type VendorRow } from "@/lib/event-view";
import { safeSchedule } from "@/lib/timeline/safe-schedule";
import { CallSheetTab } from "@/components/CallSheetTab";
import { PreMortemTab } from "@/components/PreMortemTab";
import { MoneyTab } from "@/components/MoneyTab";
import { VendorsTab } from "@/components/VendorsTab";
import { GuestPanelTab } from "@/components/GuestPanelTab";
import { IdeasTab } from "@/components/IdeasTab";

export const metadata: Metadata = { title: "Shared call sheet | Standby", robots: { index: false } };

const payloadSchema = z.object({
  event: z.custom<EventRow>((v) => typeof v === "object" && v !== null && "title" in v && "event_date" in v),
  tasks: z.array(z.custom<TaskRow>()).catch([]),
  risks: z.array(z.custom<RiskRow>()).catch([]),
  vendors: z.array(z.custom<VendorRow>()).catch([]),
  budget_items: z.array(z.custom<BudgetRow>()).catch([]),
});

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shared_event", { p_token: token.slice(0, 128) });
  const parsed = payloadSchema.safeParse(data);

  if (!parsed.success) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="cue-card p-8 flex flex-col items-center gap-4 text-center">
          <span className="stamp-label">Link expired</span>
          <h1 className="text-2xl font-semibold">This share link does not work</h1>
          <p className="text-sm text-[var(--muted)]">
            It has expired or was typed wrong. Ask the organizer for a new link, or plan your own event.
          </p>
          <Link href="/events/new" className="btn btn-solid">Plan your own event</Link>
        </div>
      </div>
    );
  }

  const p = parsed.data;
  const view = buildEventView(p.event, { tasks: p.tasks, risks: p.risks, vendors: p.vendors, budget: p.budget_items });
  const { event } = view.state;
  const vendors = view.state.vendors.map((v, i) => ({
    id: v.id ?? `v-${i}`, category: v.category, name: v.name, status: v.status, quote: v.quote ?? null, deadline: v.deadline ?? "",
  }));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-10">
      <p className="gaffer-tape text-xs self-start no-print">Read-only copy shared from Standby</p>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-sm text-[var(--muted)]">
          {event.event_date} · {event.guest_count} guests · budget ${Math.round(event.budget_total).toLocaleString()}
        </p>
      </header>
      <section aria-label="Call sheet">
        <CallSheetTab tasks={safeSchedule(view.state.tasks, event.event_date)} eventTitle={event.title} eventDate={event.event_date} />
      </section>
      <section aria-label="Pre-Mortem"><PreMortemTab risks={view.state.risks} /></section>
      <section aria-label="Money"><MoneyTab items={view.state.budget_items} targetBudget={event.budget_total} /></section>
      <section aria-label="Vendors"><VendorsTab initialVendors={vendors} /></section>
      <section aria-label="Guest Panel"><GuestPanelTab personas={view.personas} accessibilityChecks={view.accessibilityChecks} /></section>
      <section aria-label="Ideas"><IdeasTab ideas={view.ideas} /></section>
    </div>
  );
}
