"use client";

import React from "react";
import type { HistogramBin } from "@/lib/budget/simulate";

interface BudgetHistogramProps {
  bins: HistogramBin[];
  p50: number;
  p80: number;
  p95: number;
  targetBudget: number;
  currencySymbol?: string;
}

export default function BudgetHistogram({
  bins,
  p80,
  targetBudget,
  currencySymbol = "$",
}: BudgetHistogramProps) {
  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const totalRuns = bins.reduce((sum, b) => sum + b.count, 0) || 1;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative h-44 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b-2 border-[var(--ink)]"
        role="img"
        aria-label={`Budget simulation histogram. P80 mark is ${currencySymbol}${p80.toLocaleString()}. Target budget is ${currencySymbol}${targetBudget.toLocaleString()}.`}
      >
        {bins.map((bin, idx) => {
          const heightPercent = Math.round((bin.count / maxCount) * 100);
          const containsP80 = p80 >= bin.binStart && p80 <= bin.binEnd;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              <div
                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute -top-8 bg-white text-black text-xs font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10"
                aria-hidden="true"
              >
                {currencySymbol}
                {Math.round(bin.binStart).toLocaleString()} - {bin.count} runs
              </div>

              <div
                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                className={`w-full border border-[var(--ink)] rounded-t-sm transition-all ${
                  containsP80 ? "budget-pattern-bar-p80" : "budget-pattern-bar"
                }`}
              />

              <span className="text-xs font-mono text-[var(--muted)] truncate w-full text-center mt-1 hidden sm:block">
                {Math.round(bin.binStart / 1000)}k
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 border border-[var(--ink)] budget-pattern-bar inline-block" />
            <span>Simulated Runs</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 border border-[var(--ink)] budget-pattern-bar-p80 inline-block" />
            <span className="font-bold text-[var(--cue-red)]">P80 Realistic Mark</span>
          </span>
        </div>
        <div className="text-[var(--muted)]">
          P80: {currencySymbol}{Math.round(p80).toLocaleString()} | Target: {currencySymbol}{Math.round(targetBudget).toLocaleString()}
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer font-bold text-[var(--muted)] hover:text-[var(--ink)] py-1">
          View Accessible Histogram Data Table
        </summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left font-mono border-collapse border border-[var(--line)]">
            <caption className="sr-only">Budget Simulation Histogram Distribution</caption>
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)]">
                <th scope="col" className="p-2">Range ({currencySymbol})</th>
                <th scope="col" className="p-2">Frequency (Runs)</th>
                <th scope="col" className="p-2">Probability</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((bin, i) => (
                <tr key={i} className="border-b border-[var(--line)]">
                  <td className="p-2">
                    {Math.round(bin.binStart).toLocaleString()} – {Math.round(bin.binEnd).toLocaleString()}
                  </td>
                  <td className="p-2">{bin.count}</td>
                  <td className="p-2">
                    {((bin.count / totalRuns) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
