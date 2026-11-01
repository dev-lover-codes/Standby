import { describe, it, expect } from "vitest";
import { simulateBudget } from "@/lib/budget/simulate";
import type { BudgetItem } from "@/lib/validation/schemas";

describe("Budget Reality Simulator (Monte Carlo)", () => {
  const sampleItems: BudgetItem[] = [
    {
      id: "b1",
      name: "Venue Hall Rental",
      min_cost: 3000,
      likely_cost: 3500,
      max_cost: 4500,
      scales_with_guests: false,
    },
    {
      id: "b2",
      name: "Dinner & Refreshments",
      min_cost: 40,
      likely_cost: 55,
      max_cost: 75,
      scales_with_guests: true,
    },
    {
      id: "b3",
      name: "Acoustic Duo Band",
      min_cost: 800,
      likely_cost: 1000,
      max_cost: 1400,
      scales_with_guests: false,
    },
  ];

  it("produces valid percentile ordering: P50 <= P80 <= P95", () => {
    const result = simulateBudget(sampleItems, {
      guestCount: 100,
      baseGuestCount: 100,
      runs: 3000,
      seed: 12345,
    });

    expect(result.p50).toBeGreaterThan(0);
    expect(result.p50).toBeLessThanOrEqual(result.p80);
    expect(result.p80).toBeLessThanOrEqual(result.p95);
    expect(Number.isNaN(result.p50)).toBe(false);
    expect(Number.isNaN(result.p80)).toBe(false);
    expect(Number.isNaN(result.p95)).toBe(false);
    expect(Number.isNaN(result.mean)).toBe(false);
  });

  it("yields identical, reproducible results with identical seed", () => {
    const runA = simulateBudget(sampleItems, { runs: 2000, seed: 9876 });
    const runB = simulateBudget(sampleItems, { runs: 2000, seed: 9876 });

    expect(runA.p50).toBe(runB.p50);
    expect(runA.p80).toBe(runB.p80);
    expect(runA.p95).toBe(runB.p95);
    expect(runA.mean).toBe(runB.mean);
  });

  it("handles empty items list cleanly with zero values and no NaN", () => {
    const emptyResult = simulateBudget([]);
    expect(emptyResult.p50).toBe(0);
    expect(emptyResult.p80).toBe(0);
    expect(emptyResult.p95).toBe(0);
    expect(emptyResult.mean).toBe(0);
    expect(emptyResult.overBudgetProbability(100)).toBe(0);
    expect(emptyResult.overBudgetProbability(-5)).toBe(1);
  });

  it("handles min == max deterministic items without errors", () => {
    const fixedItems: BudgetItem[] = [
      {
        name: "Permit Fee",
        min_cost: 250,
        likely_cost: 250,
        max_cost: 250,
        scales_with_guests: false,
      },
    ];

    const result = simulateBudget(fixedItems, { runs: 500 });
    expect(result.p50).toBe(250);
    expect(result.p80).toBe(250);
    expect(result.p95).toBe(250);
    expect(result.mean).toBe(250);
    expect(result.overBudgetProbability(200)).toBe(1);
    expect(result.overBudgetProbability(300)).toBe(0);
  });

  it("scales guest-sensitive items proportionally", () => {
    const baseRun = simulateBudget(sampleItems, {
      guestCount: 50,
      baseGuestCount: 50,
      runs: 1000,
      seed: 42,
    });

    const doubledRun = simulateBudget(sampleItems, {
      guestCount: 100,
      baseGuestCount: 50,
      runs: 1000,
      seed: 42,
    });

    // Doubling guests increases total due to per-guest catering item
    expect(doubledRun.p50).toBeGreaterThan(baseRun.p50);
  });

  it("generates a complete 12-bin histogram with all counts accounted for", () => {
    const runs = 2500;
    const result = simulateBudget(sampleItems, { runs, seed: 777 });
    expect(result.histogram).toHaveLength(12);

    const totalHistogramCount = result.histogram.reduce((acc, bin) => acc + bin.count, 0);
    expect(totalHistogramCount).toBe(runs);
  });
});
