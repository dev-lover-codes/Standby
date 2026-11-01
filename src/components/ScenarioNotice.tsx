"use client";

import { useEffect, useState } from "react";
import { explainScenarioAction } from "@/app/feature-actions";
import type { AiScenarioExplain } from "@/lib/ai/schemas";
import type { ScenarioType } from "@/lib/scenarios/apply";

interface ScenarioNoticeProps {
  scenario: ScenarioType;
  changes: string[];
}

/** Lists the deterministic changes, then adds a short AI explanation when it arrives. */
export function ScenarioNotice({ scenario, changes }: ScenarioNoticeProps) {
  const [result, setResult] = useState<{ key: string; data: AiScenarioExplain | null; error?: string } | null>(null);
  const key = `${scenario}:${changes.join("|")}`;

  useEffect(() => {
    let live = true;
    explainScenarioAction(scenario, changes).then(
      (res) => live && setResult({ key, data: res.data ?? null, error: res.error }),
      () => live && setResult({ key, data: null, error: "Could not load the explanation. The changes above still apply." })
    );
    return () => {
      live = false;
    };
  }, [scenario, changes, key]);

  const current = result?.key === key ? result : null;

  return (
    <section aria-labelledby="plan-b-heading" className="cue-card p-4 border-[var(--cue-red)]">
      <h2 id="plan-b-heading" className="text-sm font-semibold text-[var(--cue-red)] uppercase tracking-wide">
        Plan B is active
      </h2>
      <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
        {changes.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <div role="status" aria-live="polite" className="mt-3 text-sm text-[var(--ink-nav)]">
        {!current && <p className="text-[var(--muted)]">Writing a short explanation…</p>}
        {current?.data && (
          <p><strong className="text-white">{current.data.headline}.</strong> {current.data.advice}</p>
        )}
        {current?.error && <p className="text-[var(--muted)]">{current.error}</p>}
      </div>
    </section>
  );
}
