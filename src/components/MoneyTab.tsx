"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { simulateBudget } from "@/lib/budget/simulate";
import type { BudgetItem } from "@/lib/validation/schemas";

const BudgetHistogram = dynamic(() => import("./BudgetHistogram"), {
  ssr: false,
  loading: () => (
    <div className="h-44 w-full flex items-center justify-center font-mono text-xs text-[var(--muted)]">
      Simulating 2,000 budget reality scenarios...
    </div>
  ),
});

interface MoneyTabProps {
  items: BudgetItem[];
  targetBudget: number;
}

export function MoneyTab({ items, targetBudget }: MoneyTabProps) {
  const sim = useMemo(() => {
    return simulateBudget(items, { runs: 2000, seed: 42 });
  }, [items]);

  const overBudgetPercent = Math.round(sim.overBudgetProbability(targetBudget) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Simulation KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="cue-card p-3">
          <span className="font-mono text-[10px] uppercase text-[var(--muted)] block">Target Budget</span>
          <span className="font-mono font-bold text-lg sm:text-xl text-[var(--ink)]">
            ${Math.round(targetBudget).toLocaleString()}
          </span>
        </div>
        <div className="cue-card p-3">
          <span className="font-mono text-[10px] uppercase text-[var(--muted)] block">P50 (Median)</span>
          <span className="font-mono font-bold text-lg sm:text-xl text-[var(--ink)]">
            ${Math.round(sim.p50).toLocaleString()}
          </span>
        </div>
        <div className="cue-card p-3 border-2 border-[var(--cue-red)]">
          <span className="font-mono text-[10px] uppercase text-[var(--cue-red)] font-bold block">
            P80 Reality (80% Safe)
          </span>
          <span className="font-mono font-bold text-lg sm:text-xl text-[var(--cue-red)]">
            ${Math.round(sim.p80).toLocaleString()}
          </span>
        </div>
        <div className="cue-card p-3">
          <span className="font-mono text-[10px] uppercase text-[var(--muted)] block">Risk of Overrun</span>
          <span
            className={`font-mono font-bold text-lg sm:text-xl ${
              overBudgetPercent > 30 ? "text-[var(--cue-red)]" : "text-[var(--safe-green)]"
            }`}
          >
            {overBudgetPercent}%
          </span>
        </div>
      </div>

      {/* Histogram Simulator */}
      <div className="cue-card p-4 sm:p-5">
        <div className="mb-2">
          <h3 className="font-display font-bold text-base sm:text-lg">
            Budget Reality Simulator (Monte Carlo)
          </h3>
          <p className="text-xs text-[var(--muted)]">
            Pure code, NOT AI. 2,000 triangular random distribution runs factoring min, likely, and max vendor variance.
          </p>
        </div>

        <BudgetHistogram
          bins={sim.histogram}
          p50={sim.p50}
          p80={sim.p80}
          p95={sim.p95}
          targetBudget={targetBudget}
        />
      </div>

      {/* Itemized Budget Table */}
      <div className="cue-card p-4">
        <h4 className="font-mono text-xs uppercase font-bold text-[var(--muted)] mb-3">
          Itemized Budget Variance Parameters
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th scope="col" className="pb-2">Name / Category</th>
                <th scope="col" className="pb-2">Min ($)</th>
                <th scope="col" className="pb-2">Likely ($)</th>
                <th scope="col" className="pb-2">Max ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2 text-[var(--safe-green)]">${item.min_cost.toLocaleString()}</td>
                  <td className="py-2 font-bold">${item.likely_cost.toLocaleString()}</td>
                  <td className="py-2 text-[var(--cue-red)]">${item.max_cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
