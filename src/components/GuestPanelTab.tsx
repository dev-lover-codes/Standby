import React from "react";

export interface PersonaItem {
  persona: string;
  feedback: string;
  concernArea: string;
}

export interface AccessibilityCheckItem {
  check: string;
  status: "pass" | "needs_attention" | "fail";
  detail: string;
}

interface GuestPanelTabProps {
  personas: PersonaItem[];
  accessibilityChecks: AccessibilityCheckItem[];
}

const PERSONA_BADGES: Record<string, string> = {
  "strict grandparent": "👴 Grandparent",
  "vegan friend": "🌱 Vegan Friend",
  "parent with toddler": "🧸 Parent + Toddler",
  "wheelchair user": "♿ Wheelchair User",
};

export function GuestPanelTab({ personas, accessibilityChecks }: GuestPanelTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="cue-card p-4">
        <h3 className="font-display font-bold text-base mb-1">
          Guest Panel Rehearsal (4 Perspectives)
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Four distinct event attendees reviewed the setup to identify blind spots before real guests arrive.
        </p>
      </div>

      {/* Personas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((p, idx) => {
          const badge = PERSONA_BADGES[p.persona.toLowerCase()] || `👤 ${p.persona}`;
          return (
            <article key={idx} className="cue-card p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  {badge}
                </span>
                <span className="text-[10px] font-mono bg-[var(--line)] px-2 py-0.5 rounded text-[var(--muted)]">
                  Focus: {p.concernArea}
                </span>
              </div>
              <blockquote className="text-xs sm:text-sm text-[var(--ink)] italic bg-[var(--bg)] p-3 border-l-2 border-[var(--tape-yellow)] rounded">
                &ldquo;{p.feedback}&rdquo;
              </blockquote>
            </article>
          );
        })}
      </div>

      {/* Accessibility Checks */}
      <div className="cue-card p-4">
        <h4 className="font-mono text-xs uppercase font-bold text-[var(--muted)] mb-3">
          Event Accessibility Checklist
        </h4>
        <div className="divide-y divide-[var(--line)]">
          {accessibilityChecks.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-xs sm:text-sm text-[var(--ink)] block">
                  {item.check}
                </span>
                <span className="text-xs text-[var(--muted)]">{item.detail}</span>
              </div>
              <span
                className={`font-mono text-xs font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap ${
                  item.status === "pass"
                    ? "bg-[var(--safe-green)] text-white"
                    : "bg-[var(--tape-yellow)] text-[#1B1A17]"
                }`}
              >
                {item.status === "pass" ? "Pass" : "Review"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
