"use client";

import { useState } from "react";
import type { ScheduledTask } from "@/lib/timeline/schedule";
import { buildIcs } from "@/lib/ics/build";
import { setTaskDoneAction } from "@/app/feature-actions";

interface CallSheetTabProps {
  tasks: ScheduledTask[];
  eventTitle: string;
  eventDate: string;
  /** When true, ticking a task saves it. Share pages pass false (read-only). */
  editable?: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CallSheetTab({ tasks, eventTitle, eventDate, editable = false }: CallSheetTabProps) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("");

  const toggle = async (task: ScheduledTask, value: boolean) => {
    setDone((prev) => ({ ...prev, [task.id]: value }));
    if (!UUID.test(task.id)) return;
    const res = await setTaskDoneAction(task.id, value);
    if (!res.success) {
      setDone((prev) => ({ ...prev, [task.id]: !value }));
      setStatus(res.error ?? "Could not save. Try again.");
    } else {
      setStatus(`${task.title}: marked ${value ? "done" : "not done"}.`);
    }
  };

  const downloadIcs = () => {
    const ics = buildIcs(
      { title: eventTitle, event_date: eventDate },
      tasks.map((t) => ({ id: t.id, title: t.title, due_date: t.due_date, duration_days: t.duration_days }))
    );
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-call-sheet.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <p className="text-sm text-[var(--muted)]">
          Timeline scheduled backward from <strong className="text-white">{eventDate}</strong>. HOLD = critical path (no spare days).
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={downloadIcs} className="btn btn-ghost">Download .ics</button>
          <button type="button" onClick={() => window.print()} className="btn btn-ghost">Print call sheet</button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{status}</p>

      <ol className="cue-card divide-y divide-[var(--line)]" aria-label="Call sheet">
        {tasks.map((task, idx) => {
          const isDone = done[task.id] ?? Boolean(task.done);
          return (
            <li key={task.id} className={`p-3 sm:p-4 grid grid-cols-[3rem_1fr] sm:grid-cols-[3rem_8rem_1fr_auto] items-center gap-x-3 gap-y-1 ${isDone ? "opacity-60" : ""}`}>
              <span className="font-mono font-semibold text-[var(--cue-red)]">Q{idx + 1}</span>
              <span className="font-mono text-sm">
                {task.due_date}
                <span className="block text-xs text-[var(--muted)]">{task.duration_days} day(s)</span>
              </span>
              <div className="col-span-2 sm:col-span-1 flex items-start gap-3">
                {editable ? (
                  <input type="checkbox" id={`chk-${task.id}`} checked={isDone}
                    onChange={(e) => void toggle(task, e.target.checked)}
                    className="mt-0.5 h-5 w-5 accent-white" />
                ) : null}
                <label htmlFor={editable ? `chk-${task.id}` : undefined} className={`text-sm ${isDone ? "line-through" : ""}`}>
                  {task.title}
                  {isDone && <span className="sr-only"> (done)</span>}
                  {task.depends_on.length > 0 && (
                    <span className="block text-xs text-[var(--muted)]">Waits for {task.depends_on.length} earlier task(s)</span>
                  )}
                </label>
              </div>
              <span className="col-span-2 sm:col-span-1 sm:text-right">
                {task.critical ? (
                  <span className="hold-badge" title="Critical path: a delay here delays the event">HOLD</span>
                ) : (
                  <span className="text-xs font-medium text-[var(--safe-green)]">+{task.slack}d slack</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
