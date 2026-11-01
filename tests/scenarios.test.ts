import { describe, it, expect } from "vitest";
import { applyScenario, type RehearsalEventState } from "@/lib/scenarios/apply";

describe("Deterministic Scenario Transformation", () => {
  const baseState: RehearsalEventState = {
    event: {
      title: "Silver Jubilee Celebration",
      kind: "community",
      event_date: "2027-07-20",
      guest_count: 100,
      budget_total: 10000,
      outdoor: true,
      brief: "Outdoor community silver jubilee festival.",
    },
    tasks: [
      { id: "task-1", title: "Book Open Air Pavilion", duration_days: 5, depends_on: [], done: false },
    ],
    risks: [
      { id: "risk-1", title: "Crowd congestion", likelihood: 3, impact: 3, plan_b: "Add second exit corridor" },
    ],
    vendors: [
      { id: "v1", category: "Catering", name: "Apex Catering", status: "booked", quote: 4000, deadline: "2027-06-01" },
    ],
    budget_items: [
      { id: "b1", name: "Catering Buffet", min_cost: 3000, likely_cost: 4000, max_cost: 5000, scales_with_guests: true },
      { id: "b2", name: "Sound System", min_cost: 800, likely_cost: 1000, max_cost: 1200, scales_with_guests: false },
    ],
  };

  it("applies rain scenario deterministically and preserves state immutability", () => {
    const result = applyScenario(baseState, "rain");

    // Pure: baseState is untouched
    expect(baseState.event.outdoor).toBe(true);
    expect(baseState.tasks).toHaveLength(1);

    // Transformed next state
    expect(result.nextState.event.outdoor).toBe(false);
    expect(result.nextState.tasks.length).toBeGreaterThan(baseState.tasks.length);
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.changes.some((c) => c.includes("canopy"))).toBe(true);
  });

  it("applies vendor cancellation scenario", () => {
    const result = applyScenario(baseState, "vendor_cancelled");

    expect(result.nextState.vendors[0].status).toBe("to_call");
    expect(result.nextState.vendors[0].name).toContain("CANCELLED");
    expect(result.nextState.tasks.some((t) => t.title.includes("Emergency vendor dispatch"))).toBe(true);
  });

  it("applies 20% budget cut across totals and items", () => {
    const result = applyScenario(baseState, "budget_cut_20");

    expect(result.nextState.event.budget_total).toBe(8000); // 10000 * 0.8
    expect(result.nextState.budget_items[0].likely_cost).toBe(3200); // 4000 * 0.8
    expect(result.nextState.risks.some((r) => r.title.includes("Budget"))).toBe(true);
  });

  it("applies +30 guests scenario and scales guest-dependent items", () => {
    const result = applyScenario(baseState, "guests_plus_30");

    expect(result.nextState.event.guest_count).toBe(130);
    // Catering item scales: 4000 * 1.3 = 5200
    expect(result.nextState.budget_items[0].likely_cost).toBe(5200);
    // Sound item does not scale: remains 1000
    expect(result.nextState.budget_items[1].likely_cost).toBe(1000);
  });
});
