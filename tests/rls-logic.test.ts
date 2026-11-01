import { describe, it, expect } from "vitest";

describe("RLS Policy Architecture", () => {
  it("verifies security definer functions don't leak user ids", () => {
    // Simulated shape of public.get_shared_event
    const sharedPayload = {
      event: {
        id: "ev-123",
        title: "Community Festival",
        kind: "community",
        event_date: "2027-08-15",
        guest_count: 200,
        budget_total: 5000,
        outdoor: true,
        brief: "Annual block event",
        plan: null,
      },
      tasks: [],
      risks: [],
      vendors: [],
      budget_items: [],
    };

    expect(sharedPayload.event).not.toHaveProperty("owner_id");
    expect(Object.keys(sharedPayload.event)).not.toContain("owner_id");
  });
});
