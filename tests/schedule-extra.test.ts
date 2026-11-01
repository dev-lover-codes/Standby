import { describe, it, expect } from "vitest";
import { scheduleBackward } from "@/lib/timeline/schedule";

describe("Schedule Edge Cases", () => {
  it("handles tasks with missing depends_on array and unknown depIds", () => {
    const tasks = [
      { id: "1", title: "Task 1", duration_days: 1 },
      { id: "2", title: "Task 2", duration_days: 2, depends_on: ["unknown-id", "1"] },
    ];

    const scheduled = scheduleBackward(tasks, "2027-11-01");
    expect(scheduled).toHaveLength(2);
    const t2 = scheduled.find((t) => t.id === "2")!;
    expect(t2.depends_on).toHaveLength(2);
  });
});
