"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PlanBSwitch } from "@/components/PlanBSwitch";
import { TabNav, type TabItem } from "@/components/TabNav";
import { CallSheetTab } from "@/components/CallSheetTab";
import { PreMortemTab, type RiskItem } from "@/components/PreMortemTab";
import { MoneyTab } from "@/components/MoneyTab";
import { VendorsTab, type VendorItem } from "@/components/VendorsTab";
import { GuestPanelTab, type PersonaItem, type AccessibilityCheckItem } from "@/components/GuestPanelTab";
import { IdeasTab, type IdeaItem } from "@/components/IdeasTab";
import { ShareButton } from "@/components/ShareButton";
import { applyScenario, type ScenarioType, type RehearsalEventState } from "@/lib/scenarios/apply";
import { scheduleBackward, type ScheduledTask } from "@/lib/timeline/schedule";

interface EventViewClientProps {
  initialState: RehearsalEventState;
  initialPersonas: PersonaItem[];
  initialAccessibilityChecks: AccessibilityCheckItem[];
  initialIdeas: IdeaItem[];
}

export function EventViewClient({
  initialState,
  initialPersonas,
  initialAccessibilityChecks,
  initialIdeas,
}: EventViewClientProps) {
  const [activeTab, setActiveTab] = useState("call-sheet");
  const [scenario, setScenario] = useState<ScenarioType | null>(null);

  // Deterministically adjust state when Plan B scenario is toggled
  const { currentState, scenarioChanges } = useMemo(() => {
    if (!scenario) {
      return { currentState: initialState, scenarioChanges: [] };
    }
    const result = applyScenario(initialState, scenario);
    return { currentState: result.nextState, scenarioChanges: result.changes };
  }, [scenario, initialState]);

  // Backward schedule the tasks from the event date
  const scheduledTasks: ScheduledTask[] = useMemo(() => {
    const inputTasks = currentState.tasks.map((t, idx) => ({
      id: t.id || `task-${idx}`,
      title: t.title,
      duration_days: t.duration_days,
      depends_on: t.depends_on || [],
      done: t.done,
    }));

    try {
      return scheduleBackward(inputTasks, currentState.event.event_date);
    } catch {
      return inputTasks.map((t) => ({
        ...t,
        due_date: currentState.event.event_date,
        latestFinish: currentState.event.event_date,
        latestStart: currentState.event.event_date,
        earliestStart: currentState.event.event_date,
        slack: 0,
        critical: true,
      }));
    }
  }, [currentState.tasks, currentState.event.event_date]);

  const tabs: TabItem[] = [
    { id: "call-sheet", label: "Call Sheet", cue: "Q1", count: scheduledTasks.length },
    { id: "pre-mortem", label: "Pre-Mortem", cue: "Q2", count: currentState.risks.length },
    { id: "money", label: "Money", cue: "Q3" },
    { id: "vendors", label: "Vendors", cue: "Q4", count: currentState.vendors.length },
    { id: "guest-panel", label: "Guest Panel", cue: "Q5" },
    { id: "ideas", label: "Ideas", cue: "Q6", count: initialIdeas.length },
  ];

  const vendorItems: VendorItem[] = currentState.vendors.map((v) => ({
    id: v.id || v.name,
    category: v.category,
    name: v.name,
    status: v.status,
    quote: v.quote ?? 0,
    deadline: v.deadline ?? "",
  }));

  const riskItems: RiskItem[] = currentState.risks.map((r) => ({
    id: r.id,
    title: r.title,
    plan_b: r.plan_b,
    likelihood: r.likelihood,
    impact: r.impact,
  }));

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href="/dashboard"
          className="text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)] flex items-center min-h-[44px]"
        >
          ← Back to Productions
        </Link>
        <div className="flex items-center gap-2">
          {currentState.event.id && <ShareButton eventId={currentState.event.id} />}
        </div>
      </div>

      <header className="cue-card p-5 border-l-4 border-l-[var(--cue-red)] flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs uppercase bg-[var(--line)] px-2 py-0.5 rounded text-[var(--ink)] font-bold">
            {currentState.event.kind} PRODUCTION
          </span>
          <span className="font-mono text-xs text-[var(--muted)]">
            Call Date: <strong>{currentState.event.event_date}</strong> | Guests: <strong>{currentState.event.guest_count}</strong>
          </span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--ink)]">
          {currentState.event.title}
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono line-clamp-2">
          Brief: {currentState.event.brief}
        </p>
      </header>

      <div className="no-print">
        <PlanBSwitch currentScenario={scenario} onScenarioChange={setScenario} />
      </div>

      {scenarioChanges.length > 0 && (
        <div className="p-3 bg-[var(--cue-red)]/10 border-l-4 border-[var(--cue-red)] text-xs font-mono text-[var(--ink)]">
          <strong>SCENARIO PLAN B ACTIVE:</strong>
          <ul className="list-disc list-inside mt-1">
            {scenarioChanges.map((change, i) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="no-print">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main id="tab-panels" className="pt-2">
        <div
          id="panel-call-sheet"
          role="tabpanel"
          aria-labelledby="tab-call-sheet"
          hidden={activeTab !== "call-sheet"}
        >
          {activeTab === "call-sheet" && (
            <CallSheetTab
              tasks={scheduledTasks}
              eventTitle={currentState.event.title}
              eventDate={currentState.event.event_date}
            />
          )}
        </div>

        <div
          id="panel-pre-mortem"
          role="tabpanel"
          aria-labelledby="tab-pre-mortem"
          hidden={activeTab !== "pre-mortem"}
        >
          {activeTab === "pre-mortem" && <PreMortemTab risks={riskItems} />}
        </div>

        <div
          id="panel-money"
          role="tabpanel"
          aria-labelledby="tab-money"
          hidden={activeTab !== "money"}
        >
          {activeTab === "money" && (
            <MoneyTab
              items={currentState.budget_items}
              targetBudget={currentState.event.budget_total}
            />
          )}
        </div>

        <div
          id="panel-vendors"
          role="tabpanel"
          aria-labelledby="tab-vendors"
          hidden={activeTab !== "vendors"}
        >
          {activeTab === "vendors" && <VendorsTab initialVendors={vendorItems} />}
        </div>

        <div
          id="panel-guest-panel"
          role="tabpanel"
          aria-labelledby="tab-guest-panel"
          hidden={activeTab !== "guest-panel"}
        >
          {activeTab === "guest-panel" && (
            <GuestPanelTab
              personas={initialPersonas}
              accessibilityChecks={initialAccessibilityChecks}
            />
          )}
        </div>

        <div
          id="panel-ideas"
          role="tabpanel"
          aria-labelledby="tab-ideas"
          hidden={activeTab !== "ideas"}
        >
          {activeTab === "ideas" && <IdeasTab ideas={initialIdeas} />}
        </div>
      </main>
    </div>
  );
}
