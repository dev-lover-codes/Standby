import { describe, it, expect } from "vitest";
import {
  eventInputSchema,
  budgetItemSchema,
  taskSchema,
  vendorSchema,
  riskSchema,
  scenarioIdSchema,
} from "@/lib/validation/schemas";

describe("Validation Schemas", () => {
  it("validates well-formed event inputs", () => {
    const valid = {
      title: "  Summer Solstice Community Festival  ",
      kind: "community",
      event_date: "2027-06-21",
      guest_count: 350,
      budget_total: 12000,
      outdoor: true,
      brief: "A festive gathering for the community with live acoustic music.",
    };

    const parsed = eventInputSchema.parse(valid);
    expect(parsed.title).toBe("Summer Solstice Community Festival");
    expect(parsed.kind).toBe("community");
  });

  it("rejects invalid or hostile event inputs", () => {
    // Past date
    expect(() =>
      eventInputSchema.parse({
        title: "Old event",
        kind: "wedding",
        event_date: "1999-01-01",
        guest_count: 10,
        budget_total: 500,
        brief: "Past event",
      })
    ).toThrow();

    // Guest count exceeds 5000
    expect(() =>
      eventInputSchema.parse({
        title: "Huge event",
        kind: "birthday",
        event_date: "2027-10-10",
        guest_count: 10000,
        budget_total: 500,
        brief: "Over-capacity",
      })
    ).toThrow();

    // Hostile text is preserved as plain text (safe string, not rejected if within length)
    const hostileInput = {
      title: "<script>alert('xss')</script>",
      kind: "other",
      event_date: "2027-10-10",
      guest_count: 20,
      budget_total: 1000,
      outdoor: false,
      brief: "<div style='color:red'>Deliberate HTML injection attempt</div>",
    };
    const parsed = eventInputSchema.parse(hostileInput);
    expect(parsed.title).toBe("<script>alert('xss')</script>");
    expect(parsed.brief).toBe("<div style='color:red'>Deliberate HTML injection attempt</div>");
  });

  it("validates budget item ordering: min <= likely <= max", () => {
    const valid = budgetItemSchema.parse({
      name: "Sound & Stage Rental",
      min_cost: 1000,
      likely_cost: 1500,
      max_cost: 2200,
      scales_with_guests: false,
    });
    expect(valid.likely_cost).toBe(1500);

    // Invalid: min > likely
    expect(() =>
      budgetItemSchema.parse({
        name: "Broken item",
        min_cost: 2000,
        likely_cost: 1500,
        max_cost: 2500,
      })
    ).toThrow();

    // Invalid: likely > max
    expect(() =>
      budgetItemSchema.parse({
        name: "Broken item",
        min_cost: 1000,
        likely_cost: 3000,
        max_cost: 2500,
      })
    ).toThrow();
  });

  it("validates tasks and dependencies", () => {
    const task = taskSchema.parse({
      title: "Audio check",
      duration_days: 2,
      depends_on: ["task-1", "task-2"],
    });
    expect(task.duration_days).toBe(2);
    expect(task.depends_on).toHaveLength(2);
  });

  it("validates vendor statuses and quotes", () => {
    const vendor = vendorSchema.parse({
      category: "Catering",
      name: "Grand Banquet Services",
      status: "booked",
      quote: 4500,
    });
    expect(vendor.status).toBe("booked");

    expect(() =>
      vendorSchema.parse({
        category: "Catering",
        status: "unapproved", // Invalid status enum
      })
    ).toThrow();
  });

  it("validates risks and scenario IDs", () => {
    const risk = riskSchema.parse({
      title: "High wind gusts",
      likelihood: 4,
      impact: 5,
      plan_b: "Anchor tents with concrete ballast blocks",
    });
    expect(risk.impact).toBe(5);

    expect(scenarioIdSchema.parse("rain")).toBe("rain");
    expect(scenarioIdSchema.parse("budget_cut_20")).toBe("budget_cut_20");
    expect(() => scenarioIdSchema.parse("alien_invasion")).toThrow();
  });
});
