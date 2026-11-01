import { describe, it, expect } from "vitest";
import { eventInputSchema } from "@/lib/validation/schemas";

describe("Validation Extra Cases", () => {
  it("rejects non-existent dates formatted as YYYY-MM-DD", () => {
    expect(() =>
      eventInputSchema.parse({
        title: "Leap year test",
        kind: "birthday",
        event_date: "2027-02-31", // invalid date
        guest_count: 10,
        budget_total: 500,
        brief: "party",
      })
    ).toThrow();
  });
});
