"use client";

import React, { useState } from "react";
import type { ScheduledTask } from "@/lib/timeline/schedule";
import { buildIcs } from "@/lib/ics/build";

interface CallSheetTabProps {
  tasks: ScheduledTask[];
  eventTitle: string;
  eventDate: string;
}

export function CallSheetTab({ tasks, eventTitle, eventDate }: CallSheetTabProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggleTask = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const downloadIcs = () => {
    const icsContent = buildIcs(
      { title: eventTitle, event_date: eventDate },
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        due_date: t.due_date,
        duration_days: t.duration_days,
      }))
    );

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-call-sheet.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="text-xs text-[var(--muted)]">
          Scheduled backward from event call date: <strong className="text-[var(--ink)]">{eventDate}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadIcs}
            className="px-3 py-1.5 border border-[var(--ink)] bg-[var(--card-bg)] hover:bg-[var(--line)] font-mono text-xs rounded min-h-[44px] flex items-center gap-1.5"
          >
            <span aria-hidden="true">📅</span> Download .ics
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 border border-[var(--ink)] bg-[var(--card-bg)] hover:bg-[var(--line)] font-mono text-xs rounded min-h-[44px] flex items-center gap-1.5"
          >
            <span aria-hidden="true">🖨️</span> Print Call Sheet
          </button>
        </div>
      </div>

      {/* Cue Sheet Table */}
      <div className="cue-card divide-y divide-[var(--line)]">
        <div className="p-3 bg-[var(--bg)] grid grid-cols-12 text-xs font-mono font-bold text-[var(--muted)] uppercase">
          <div className="col-span-2 sm:col-span-1">Cue</div>
          <div className="col-span-4 sm:col-span-3">Call Date</div>
          <div className="col-span-6 sm:col-span-6">Task & Dependencies</div>
          <div className="hidden sm:block sm:col-span-2 text-right">Slack / Status</div>
        </div>

        {tasks.map((task, idx) => {
          const isDone = completed[task.id] || task.done;
          return (
            <div
              key={task.id}
              className={`p-3 grid grid-cols-12 items-center gap-2 transition-colors ${
                isDone ? "opacity-50 line-through bg-[var(--line)]/20" : ""
              }`}
            >
              <div className="col-span-2 sm:col-span-1 font-mono font-extrabold text-sm text-[var(--cue-red)]">
                Q{idx + 1}
              </div>
              <div className="col-span-4 sm:col-span-3 font-mono text-xs sm:text-sm">
                <div>{task.due_date}</div>
                <div className="text-[10px] text-[var(--muted)]">{task.duration_days} day(s)</div>
              </div>
              <div className="col-span-6 sm:col-span-6 flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`chk-${task.id}`}
                  checked={!!isDone}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark task completed: ${task.title}`}
                  className="mt-1 h-4 w-4 rounded accent-[var(--cue-red)]"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`chk-${task.id}`}
                    className="cursor-pointer font-medium text-xs sm:text-sm block"
                  >
                    {task.title}
                  </label>
                  {task.depends_on && task.depends_on.length > 0 && (
                    <div className="text-[10px] text-[var(--muted)] font-mono">
                      Depends on {task.depends_on.length} predecessor task(s)
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                {task.critical && (
                  <span className="hold-badge" title="Critical path: delay here delays the event">
                    HOLD (0d)
                  </span>
                )}
                {!task.critical && (
                  <span className="font-mono text-xs text-[var(--safe-green)] font-semibold">
                    +{task.slack}d slack
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
