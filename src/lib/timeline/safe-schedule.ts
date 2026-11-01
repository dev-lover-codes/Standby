import { scheduleBackward, type ScheduledTask } from "./schedule";
import type { Task } from "../validation/schemas";

/** Schedules tasks backward; if the links form a loop, schedules them without links instead of failing. */
export function safeSchedule(tasks: Task[], eventDate: string): ScheduledTask[] {
  const input = tasks.map((t, i) => ({
    id: t.id ?? `task-${i}`,
    title: t.title,
    duration_days: t.duration_days,
    depends_on: t.depends_on ?? [],
    done: t.done,
  }));
  try {
    return scheduleBackward(input, eventDate);
  } catch {
    return scheduleBackward(input.map((t) => ({ ...t, depends_on: [] })), eventDate);
  }
}
