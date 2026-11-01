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
  ];

  it("handles seed = 0, default options and custom runs", () => {
    const res = simulateBudget(sampleItems, { seed: 0, baseGuestCount: 0 });
    expect(res.p50).toBeGreaterThan(0);
  });

  it("handles triangular distribution when a >= b", () => {
    const item: BudgetItem = {
      name: "Fixed Fee",
      min_cost: 100,
      likely_cost: 100,
      max_cost: 100,
      scales_with_guests: false,
    };
    const res = simulateBudget([item], { runs: 10 });
    expect(res.p50).toBe(100);
  });

  it("handles single item with identical min, likely, max for zero binWidth branch", () => {
    const res = simulateBudget(
      [{ name: "Static", min_cost: 50, likely_cost: 50, max_cost: 50, scales_with_guests: false }],
      { runs: 5 }
    );
    expect(res.histogram).toHaveLength(12);
  });
});
