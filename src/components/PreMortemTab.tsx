import React from "react";

export interface RiskItem {
  id?: string;
  title: string;
  plan_b: string;
  likelihood?: number;
  impact?: number;
}

interface PreMortemTabProps {
  risks: RiskItem[];
}

export function PreMortemTab({ risks }: PreMortemTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="cue-card p-4 border-l-4 border-[var(--cue-red)]">
        <h3 className="font-display font-bold text-base mb-1 text-[var(--cue-red)]">
          Pre-Mortem: How This Event Fails
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)]">
          We imagined the celebration was an absolute disaster and engineered exactly 5 failure points backwards.
          Every single failure point has an active <strong>Plan B</strong> ready to deploy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.slice(0, 5).map((risk, index) => (
          <article
            key={risk.id || index}
            className="cue-card cue-card-torn p-5 flex flex-col justify-between gap-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="stamp-label select-none" aria-label={`Risk ${index + 1} of 5`}>
                RISK {index + 1}/5
              </span>
              {risk.likelihood !== undefined && (
                <span className="text-[10px] font-mono uppercase bg-[var(--line)] px-2 py-0.5 rounded text-[var(--ink)]">
                  L:{risk.likelihood}/5 • I:{risk.impact || 3}/5
                </span>
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] mb-2">
                {risk.title}
              </h4>
              <div className="mt-3 p-3 bg-[var(--bg)] border border-[var(--line)] rounded">
                <span className="font-mono text-xs font-bold text-[var(--safe-green)] uppercase block mb-1">
                  ✓ Plan B Mitigation
                </span>
                <p className="text-xs text-[var(--ink)] leading-relaxed">
                  {risk.plan_b}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
