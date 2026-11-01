import type { ReactNode } from "react";

export interface RiskItem {
  id?: string;
  title: string;
  plan_b: string;
  likelihood?: number;
  impact?: number;
}

interface PreMortemTabProps {
  risks: RiskItem[];
  isTemplate?: boolean;
  action?: ReactNode;
}

export function PreMortemTab({ risks, isTemplate = false, action }: PreMortemTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="cue-card p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[60ch]">
          <h2 className="text-lg font-semibold">Pre-Mortem: how this event could fail</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            We imagined the event went wrong and listed the 5 most likely causes. Each one has a Plan B.
            {isTemplate && " These are starter risks; run the Pre-Mortem to tailor them to your brief."}
          </p>
        </div>
        {action}
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.slice(0, 5).map((risk, index) => (
          <li key={risk.id ?? index} className="cue-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="stamp-label">RISK {index + 1}/5</span>
              {risk.likelihood !== undefined && (
                <span className="text-xs text-[var(--muted)]">
                  Likelihood {risk.likelihood}/5 · Impact {risk.impact ?? 3}/5
                </span>
              )}
            </div>
            <h3 className="font-medium">{risk.title}</h3>
            <div className="p-3 rounded-[10px] bg-white/5 border border-[var(--line)]">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--safe-green)] block mb-1">Plan B</span>
              <p className="text-sm text-[var(--ink-nav)]">{risk.plan_b}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
