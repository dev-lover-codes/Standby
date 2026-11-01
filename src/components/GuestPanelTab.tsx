import type { ReactNode } from "react";

export interface PersonaItem {
  persona: string;
  feedback: string;
  concernArea: string;
}

export interface AccessibilityCheckItem {
  check: string;
  status: "pass" | "needs_attention";
  detail: string;
}

interface GuestPanelTabProps {
  personas: PersonaItem[];
  accessibilityChecks: AccessibilityCheckItem[];
  isTemplate?: boolean;
  action?: ReactNode;
}

export function GuestPanelTab({ personas, accessibilityChecks, isTemplate = false, action }: GuestPanelTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="cue-card p-4 sm:p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[60ch]">
          <h2 className="text-lg font-semibold">Guest Panel</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Four guests review your plan: a strict grandparent, a vegan friend, a parent with a toddler and a wheelchair user.
            {isTemplate && " This is starter feedback; ask the panel to review your brief."}
          </p>
        </div>
        {action}
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((p) => (
          <li key={p.persona} className="cue-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold capitalize">{p.persona}</h3>
              <span className="gaffer-tape text-xs capitalize">About: {p.concernArea}</span>
            </div>
            <blockquote className="text-sm text-[var(--ink-nav)] border-l-2 border-[var(--line)] pl-3">{p.feedback}</blockquote>
          </li>
        ))}
      </ul>

      <section className="cue-card p-4 sm:p-5" aria-labelledby="access-heading">
        <h3 id="access-heading" className="font-semibold mb-3">Event accessibility check</h3>
        <ul className="divide-y divide-[var(--line)]">
          {accessibilityChecks.map((item) => (
            <li key={item.check} className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-medium block">{item.check}</span>
                <span className="text-sm text-[var(--muted)]">{item.detail}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap text-black ${item.status === "pass" ? "bg-[var(--safe-green)]" : "bg-[var(--tape-yellow)]"}`}>
                {item.status === "pass" ? "OK" : "Needs a fix"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
