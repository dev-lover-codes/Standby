import { describe, it, expect } from "vitest";
import { scheduleBackward, CycleError } from "@/lib/timeline/schedule";

describe("Timeline Backward Scheduler", () => {
  it("schedules a linear chain of tasks backward from the event date", () => {
    const tasks = [
      { id: "t1", title: "Book Venue", duration_days: 5, depends_on: [] },
      { id: "t2", title: "Send Invitations", duration_days: 10, depends_on: ["t1"] },
      { id: "t3", title: "Confirm Final Guest Count", duration_days: 3, depends_on: ["t2"] },
    ];

    const scheduled = scheduleBackward(tasks, "2027-07-01");
    expect(scheduled).toHaveLength(3);

    const t3 = scheduled.find((t) => t.id === "t3")!;
    expect(t3.due_date).toBe("2027-07-01");
    expect(t3.critical).toBe(true);
    expect(t3.slack).toBe(0);

    const t2 = scheduled.find((t) => t.id === "t2")!;
    expect(t2.due_date).toBe("2027-06-28");
    expect(t2.critical).toBe(true);

    const t1 = scheduled.find((t) => t.id === "t1")!;
    expect(t1.due_date).toBe("2027-06-18");
    expect(t1.critical).toBe(true);
  });

  it("handles diamond dependency structures and computes slack accurately", () => {
    // Diamond: t1 -> [t2 (fast, 2 days), t3 (slow, 7 days)] -> t4
    const tasks = [
      { id: "t1", title: "Project Briefing", duration_days: 2, depends_on: [] },
      { id: "t2", title: "Sound Check", duration_days: 2, depends_on: ["t1"] },
      { id: "t3", title: "Lighting Rig Assembly", duration_days: 7, depends_on: ["t1"] },
      { id: "t4", title: "Final Dress Rehearsal", duration_days: 1, depends_on: ["t2", "t3"] },
    ];

    const scheduled = scheduleBackward(tasks, "2027-08-20");
    const t2 = scheduled.find((t) => t.id === "t2")!;
    const t3 = scheduled.find((t) => t.id === "t3")!;

    // t3 is the critical bottleneck (7 days vs 2 days)
    expect(t3.critical).toBe(true);
    expect(t3.slack).toBe(0);

    // t2 has 5 days of spare time (slack = 7 - 2 = 5 days)
    expect(t2.critical).toBe(false);
    expect(t2.slack).toBe(5);
  });

  it("detects cyclic dependencies and throws a typed CycleError listing the tasks", () => {
    const cyclicTasks = [
      { id: "a", title: "Task Alpha", duration_days: 1, depends_on: ["c"] },
      { id: "b", title: "Task Beta", duration_days: 2, depends_on: ["a"] },
      { id: "c", title: "Task Gamma", duration_days: 3, depends_on: ["b"] },
    ];

    expect(() => scheduleBackward(cyclicTasks, "2027-09-01")).toThrowError(CycleError);

    try {
      scheduleBackward(cyclicTasks, "2027-09-01");
    } catch (e) {
      expect(e).toBeInstanceOf(CycleError);
      const err = e as CycleError;
      expect(err.cycleTasks).toContain("Task Alpha");
      expect(err.cycleTasks).toContain("Task Beta");
      expect(err.cycleTasks).toContain("Task Gamma");
    }
  });

  it("returns an empty array when given zero tasks", () => {
    const res = scheduleBackward([], "2027-10-15");
    expect(res).toEqual([]);
  });
});
