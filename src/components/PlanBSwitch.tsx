"use client";

import React from "react";
import type { ScenarioType } from "@/lib/scenarios/apply";

interface PlanBSwitchProps {
  currentScenario: ScenarioType | null;
  onScenarioChange: (scenario: ScenarioType | null) => void;
  disabled?: boolean;
}

const SCENARIOS: { id: ScenarioType; label: string; desc: string }[] = [
  { id: "rain", label: "Rain Plan", desc: "Indoor backup venues & weather mitigations" },
  { id: "vendor_cancelled", label: "Vendor Cancelled", desc: "Emergency backup sourcing" },
  { id: "budget_cut_20", label: "Budget Cut 20%", desc: "Trim discretionary scope by 20%" },
  { id: "guests_plus_30", label: "+30 Guests", desc: "Expand rentals, food, seating" },
];

export function PlanBSwitch({
  currentScenario,
  onScenarioChange,
  disabled = false,
}: PlanBSwitchProps) {
  const isPlanB = currentScenario !== null;

  return (
    <div className="cue-card p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="standby-light"
            role="status"
            aria-label="Engine standby indicator: ready"
            title="Engine Ready"
          />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
            STANDBY READY
          </span>
        </div>

        {/* Physical 2-position switch */}
        <div
          role="radiogroup"
          aria-label="Plan rehearsal selector"
          className="plan-switch-track"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!isPlanB}
            data-active={!isPlanB}
            onClick={() => onScenarioChange(null)}
            disabled={disabled}
            className="plan-switch-knob focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            PLAN A
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={isPlanB}
            data-active={isPlanB}
            onClick={() => onScenarioChange(currentScenario || "rain")}
            disabled={disabled}
            className="plan-switch-knob focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            PLAN B
          </button>
        </div>
      </div>

      {isPlanB && (
        <fieldset className="border-t border-[var(--line)] pt-3">
          <legend className="font-mono text-xs uppercase text-[var(--muted)] pb-2">
            Simulate Crisis Scenario (Deterministic + AI Note)
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SCENARIOS.map((s) => {
              const active = currentScenario === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onScenarioChange(s.id)}
                  disabled={disabled}
                  aria-pressed={active}
                  className={`p-2 text-left border rounded-[10px] transition-colors min-h-[44px] ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-bold shadow-sm"
                      : "border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)]"
                  }`}
                >
                  <div className="font-mono text-xs leading-tight">{s.label}</div>
                  <div className="text-xs opacity-80 truncate hidden sm:block">
                    {s.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
