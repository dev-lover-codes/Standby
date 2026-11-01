import { describe, it, expect } from "vitest";
import { buildIcs } from "@/lib/ics/build";

describe("ICS Edge Cases", () => {
  it("handles event without id, without brief, and tasks without id or due_date", () => {
    const event = {
      title: "Simple Picnic",
      event_date: "2027-05-01",
    };

    const tasks = [
      { title: "Buy Sandwiches", due_date: "2027-04-30" },
      { title: "No Date Task", due_date: null },
    ];

    const ics = buildIcs(event, tasks);
    expect(ics).toContain("UID:standby-event-rehearsal@standby.app");
    expect(ics).toContain("DESCRIPTION:Production Rehearsal Event");
    expect(ics).toContain("UID:standby-task-buy-sandwiches@standby.app");
    expect(ics).not.toContain("No Date Task");
  });
});
