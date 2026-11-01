"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlanBSwitch } from "@/components/PlanBSwitch";
import { TabNav, type TabItem } from "@/components/TabNav";
import { CallSheetTab } from "@/components/CallSheetTab";
import { PreMortemTab } from "@/components/PreMortemTab";
import { MoneyTab } from "@/components/MoneyTab";
import { VendorsTab } from "@/components/VendorsTab";
import { GuestPanelTab } from "@/components/GuestPanelTab";
import { IdeasTab } from "@/components/IdeasTab";
import { ShareButton } from "@/components/ShareButton";
import { RerunButton } from "@/components/RerunButton";
import { ScenarioNotice } from "@/components/ScenarioNotice";
import { rerunGuestPanelAction, rerunPreMortemAction } from "@/app/feature-actions";
import { applyScenario, type ScenarioType } from "@/lib/scenarios/apply";
import { safeSchedule } from "@/lib/timeline/safe-schedule";
import type { EventView } from "@/lib/event-view";

export function EventViewClient({ view }: { view: EventView }) {
  const [activeTab, setActiveTab] = useState("call-sheet");
  const [scenario, setScenario] = useState<ScenarioType | null>(null);
  const eventId = view.state.event.id ?? "";

  const { state, changes } = useMemo(() => {
    if (!scenario) return { state: view.state, changes: [] as string[] };
    const r = applyScenario(view.state, scenario);
    return { state: r.nextState, changes: r.changes };
  }, [scenario, view.state]);

  const scheduled = useMemo(() => safeSchedule(state.tasks, state.event.event_date), [state.tasks, state.event.event_date]);

  const tabs: TabItem[] = [
    { id: "call-sheet", label: "Call Sheet", cue: "Q1", count: scheduled.length },
    { id: "pre-mortem", label: "Pre-Mortem", cue: "Q2", count: state.risks.length },
    { id: "money", label: "Money", cue: "Q3" },
    { id: "vendors", label: "Vendors", cue: "Q4", count: state.vendors.length },
    { id: "guest-panel", label: "Guest Panel", cue: "Q5" },
    { id: "ideas", label: "Ideas", cue: "Q6", count: view.ideas.length },
  ];

  const panels: Record<string, React.ReactNode> = {
    "call-sheet": <CallSheetTab tasks={scheduled} eventTitle={state.event.title} eventDate={state.event.event_date} editable />,
    "pre-mortem": (
      <PreMortemTab risks={state.risks} isTemplate={view.isTemplate.risks}
        action={<RerunButton label="Run Pre-Mortem again" busyLabel="Imagining what could go wrong…" run={() => rerunPreMortemAction(eventId)} />} />
    ),
    money: <MoneyTab items={state.budget_items} targetBudget={state.event.budget_total} />,
    vendors: (
      <VendorsTab editable initialVendors={state.vendors.map((v, i) => ({
        id: v.id ?? `vendor-${i}`, category: v.category, name: v.name, status: v.status, quote: v.quote ?? null, deadline: v.deadline ?? "",
      }))} />
    ),
    "guest-panel": (
      <GuestPanelTab personas={view.personas} accessibilityChecks={view.accessibilityChecks} isTemplate={view.isTemplate.guestPanel}
        action={<RerunButton label="Ask the guest panel again" busyLabel="Gathering guest feedback…" run={() => rerunGuestPanelAction(eventId)} />} />
    ),
    ideas: <IdeasTab ideas={view.ideas} />,
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-white min-h-[44px] flex items-center">
          ← Back to productions
        </Link>
        {eventId && <ShareButton eventId={eventId} />}
      </div>

      <header className="flex flex-col gap-2">
        <span className="gaffer-tape text-xs self-start capitalize">{state.event.kind}</span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{state.event.title}</h1>
        <p className="text-sm text-[var(--muted)]">
          {state.event.event_date} · {state.event.guest_count} guests · budget ${Math.round(state.event.budget_total).toLocaleString()}
        </p>
        <p className="text-sm text-[var(--ink-nav)] max-w-[70ch]">{state.event.brief}</p>
      </header>

      <div className="no-print">
        <PlanBSwitch currentScenario={scenario} onScenarioChange={setScenario} />
      </div>
      {scenario && changes.length > 0 && <ScenarioNotice scenario={scenario} changes={changes} />}

      <div className="no-print">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} tabIndex={0} hidden={activeTab !== t.id}>
          {activeTab === t.id && panels[t.id]}
        </div>
      ))}
    </div>
  );
}
