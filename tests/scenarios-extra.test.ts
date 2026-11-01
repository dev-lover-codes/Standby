import { describe, it, expect } from "vitest";
import { applyScenario, type RehearsalEventState } from "@/lib/scenarios/apply";

describe("Scenario Edge Cases", () => {
  it("handles vendor_cancelled when vendors list is empty or items list is empty", () => {
    const emptyState: RehearsalEventState = {
      event: {
        title: "Solo Event",
        kind: "other",
        event_date: "2027-12-01",
        guest_count: 5,
        budget_total: 500,
        outdoor: false,
        brief: "Solo party",
      },
      tasks: [],
      risks: [],
      vendors: [],
      budget_items: [],
    };

    const res = applyScenario(emptyState, "vendor_cancelled");
    expect(res.nextState.vendors).toHaveLength(0);
    expect(res.nextState.tasks).toHaveLength(1);
  });

  it("handles vendor with empty name in vendor_cancelled", () => {
    const state: RehearsalEventState = {
      event: {
        title: "Vendor nameless",
        kind: "wedding",
        event_date: "2027-09-01",
        guest_count: 50,
        budget_total: 2000,
        outdoor: false,
        brief: "Event",
      },
      tasks: [],
      risks: [],
      vendors: [{ category: "Florist", name: "", status: "quoted" }],
      budget_items: [],
    };

    const res = applyScenario(state, "vendor_cancelled");
    expect(res.nextState.vendors[0].name).toContain("Urgent Replacement Needed");
  });
});
