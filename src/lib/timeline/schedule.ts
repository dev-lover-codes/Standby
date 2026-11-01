export interface ScheduledTask {
  id: string;
  title: string;
  duration_days: number;
  depends_on: string[];
  due_date: string;
  latestFinish: string;
  latestStart: string;
  earliestStart: string;
  slack: number;
  critical: boolean;
  done?: boolean;
}

export interface InputScheduleTask {
  id: string;
  title: string;
  duration_days: number;
  depends_on?: string[];
  done?: boolean;
}

export class CycleError extends Error {
  public readonly cycleTasks: string[];

  constructor(message: string, cycleTasks: string[]) {
    super(`${message}: ${cycleTasks.join(" -> ")}`);
    this.name = "CycleError";
    this.cycleTasks = cycleTasks;
  }
}

const MS_PER_DAY = 86_400_000;

function parseUtcDate(dateStr: string): number {
  const parts = dateStr.split("-").map(Number);
  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

function formatUtcDate(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function scheduleBackward(
  tasks: InputScheduleTask[],
  eventDateStr: string
): ScheduledTask[] {
  if (tasks.length === 0) return [];

  const eventTime = parseUtcDate(eventDateStr);
  const taskMap = new Map<string, InputScheduleTask>();
  const successors = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const t of tasks) {
    taskMap.set(t.id, t);
    successors.set(t.id, []);
    inDegree.set(t.id, 0);
  }

  // Build edges: if B depends on A, edge is A -> B (A is prerequisite, B is successor)
  for (const task of tasks) {
    const deps = task.depends_on || [];
    for (const depId of deps) {
      if (taskMap.has(depId)) {
        successors.get(depId)!.push(task.id);
        inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
      }
    }
  }

  // Detect cycle via Kahn's algorithm
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const topoOrder: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    topoOrder.push(u);
    for (const v of successors.get(u) || []) {
      const nextDeg = inDegree.get(v)! - 1;
      inDegree.set(v, nextDeg);
      if (nextDeg === 0) {
        queue.push(v);
      }
    }
  }

  if (topoOrder.length !== tasks.length) {
    // Find cycle nodes for clear error
    const cycleIds = tasks.filter((t) => !topoOrder.includes(t.id)).map((t) => t.title);
    throw new CycleError("Dependency cycle detected", cycleIds);
  }

  // Forward pass: compute earliestStart and earliestFinish relative to day 0
  const earliestStartDays = new Map<string, number>();
  const earliestFinishDays = new Map<string, number>();

  for (const id of topoOrder) {
    const task = taskMap.get(id)!;
    const deps = task.depends_on || [];
    let maxPredFinish = 0;
    for (const depId of deps) {
      if (taskMap.has(depId)) {
        const predFinish = earliestFinishDays.get(depId) || 0;
        if (predFinish > maxPredFinish) maxPredFinish = predFinish;
      }
    }
    earliestStartDays.set(id, maxPredFinish);
    earliestFinishDays.set(id, maxPredFinish + task.duration_days);
  }

  // Total project duration along earliest path
  let maxProjectDays = 0;
  for (const finish of earliestFinishDays.values()) {
    if (finish > maxProjectDays) maxProjectDays = finish;
  }

  // Backward pass: compute latestFinish and latestStart relative to eventTime
  const latestFinishTime = new Map<string, number>();
  const latestStartTime = new Map<string, number>();

  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i];
    const task = taskMap.get(id)!;
    const succList = successors.get(id) || [];

    let lfTime = eventTime;
    if (succList.length > 0) {
      let minSuccStart = Number.POSITIVE_INFINITY;
      for (const succId of succList) {
        const sStart = latestStartTime.get(succId)!;
        if (sStart < minSuccStart) minSuccStart = sStart;
      }
      lfTime = minSuccStart;
    }

    const lsTime = lfTime - task.duration_days * MS_PER_DAY;
    latestFinishTime.set(id, lfTime);
    latestStartTime.set(id, lsTime);
  }

  // Project start time
  const projectStartTime = eventTime - maxProjectDays * MS_PER_DAY;

  const result: ScheduledTask[] = [];

  for (const task of tasks) {
    const id = task.id;
    const lf = latestFinishTime.get(id)!;
    const ls = latestStartTime.get(id)!;
    const esDays = earliestStartDays.get(id)!;
    const esTime = projectStartTime + esDays * MS_PER_DAY;

    // Slack in whole days
    const slackDays = Math.max(0, Math.round((ls - esTime) / MS_PER_DAY));
    const isCritical = slackDays === 0;

    result.push({
      id: task.id,
      title: task.title,
      duration_days: task.duration_days,
      depends_on: task.depends_on || [],
      due_date: formatUtcDate(lf),
      latestFinish: formatUtcDate(lf),
      latestStart: formatUtcDate(ls),
      earliestStart: formatUtcDate(esTime),
      slack: slackDays,
      critical: isCritical,
      done: task.done ?? false,
    });
  }

  // Sort chronologically by due date (call date)
  result.sort((a, b) => a.due_date.localeCompare(b.due_date));

  return result;
}
