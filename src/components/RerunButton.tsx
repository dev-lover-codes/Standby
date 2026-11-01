"use client";

import { useState, useTransition } from "react";

interface RerunButtonProps {
  label: string;
  busyLabel: string;
  run: () => Promise<{ success: boolean; error?: string; source?: "ai" | "fallback" }>;
}

/** Calls a server action and announces the result. The page refreshes itself via revalidatePath. */
export function RerunButton({ label, busyLabel, run }: RerunButtonProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState("");

  const onClick = () =>
    startTransition(async () => {
      setStatus(busyLabel);
      const res = await run();
      if (!res.success) setStatus(res.error ?? "Something went wrong. Try again.");
      else if (res.source === "fallback") setStatus("Done. The AI was unavailable, so a safe template was used.");
      else setStatus("Done. Fresh results are below.");
    });

  return (
    <div className="flex flex-col items-start gap-1 no-print">
      <button type="button" onClick={onClick} disabled={pending} className="btn btn-ghost text-sm">
        {pending ? busyLabel : label}
      </button>
      <p role="status" aria-live="polite" className="text-xs text-[var(--muted)] min-h-4">{status}</p>
    </div>
  );
}
