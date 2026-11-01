import { describe, it, expect } from "vitest";
import { buildEventView, type EventRow } from "@/lib/event-view";

const event: EventRow = {
  id: "e1", title: "Gala", kind: "community", event_date: "2030-05-01",
  guest_count: 50, budget_total: "8000", outdoor: true, brief: "Night market", plan: null,
};
const empty = { tasks: [], risks: [], vendors: [], budget: [] };

describe("buildEventView", () => {
  it("uses template content and flags it when nothing is saved", () => {
    const view = buildEventView(event, empty);
    expect(view.isTemplate).toEqual({ risks: true, guestPanel: true });
    expect(view.state.risks).toHaveLength(5);
    expect(view.state.tasks.length).toBeGreaterThan(0);
    expect(view.state.event.budget_total).toBe(8000);
    expect(view.personas).toHaveLength(4);
    expect(view.ideas.length).toBeGreaterThan(0);
  });

  it("prefers saved rows, saved ideas and saved guest panel", () => {
    const plan = {
      ideas: [1, 2, 3, 4, 5].map((n) => ({ title: `Idea ${n}`, why: "Because" })),
      guest_panel: {
        personas: ["timeline", "budget", "food", "venue"].map((part, i) => ({
          name: `G${i}`, role: `Role ${i}`, concern: "Too late", suggestion: "Start earlier", plan_part: part,
        })),
        accessibility_checks: [{ item: "Ramp", status: "ok", note: "Step-free" }, { item: "Toilets", status: "fix", note: "Add one" }],
      },
    };
    const view = buildEventView({ ...event, kind: "unknown", plan }, {
      tasks: [{ id: "t1", title: "Book hall", duration_days: 3, depends_on: null }],
      risks: [{ id: "r1", title: "Rain", likelihood: 3, impact: 4, plan_b: "Tent" }],
      vendors: [{ id: "v1", category: "Food", name: "Cafe", status: "weird", quote: "120", deadline: null }],
      budget: [{ id: "b1", name: "Hall", min_cost: "1", likely_cost: "2", max_cost: "3" }],
    });
    expect(view.state.event.kind).toBe("other");
    expect(view.state.tasks[0]).toMatchObject({ id: "t1", depends_on: [], done: false });
    expect(view.state.vendors[0]).toMatchObject({ status: "to_call", quote: 120, deadline: null });
    expect(view.state.budget_items[0]).toMatchObject({ min_cost: 1, max_cost: 3, scales_with_guests: false });
    expect(view.ideas[0]).toEqual({ title: "Idea 1", description: "Because" });
    expect(view.personas[0].feedback).toBe("Too late Suggestion: Start earlier");
    expect(view.accessibilityChecks.map((c) => c.status)).toEqual(["pass", "needs_attention"]);
    expect(view.isTemplate).toEqual({ risks: false, guestPanel: false });
  });

  it("ignores a malformed stored plan", () => {
    const view = buildEventView({ ...event, plan: { ideas: "nope", guest_panel: 5 } }, empty);
    expect(view.isTemplate.guestPanel).toBe(true);
    expect(view.ideas.length).toBeGreaterThan(0);
  });

  it("keeps a null vendor quote as null", () => {
    const view = buildEventView(event, { ...empty, vendors: [{ id: "v", category: "DJ", name: "", status: "booked", quote: null }] });
    expect(view.state.vendors[0]).toMatchObject({ quote: null, status: "booked", deadline: null });
  });
});
