import React from "react";

export interface IdeaItem {
  category: "themes" | "activities" | "food" | "small_touches" | string;
  title: string;
  description: string;
}

interface IdeasTabProps {
  ideas: IdeaItem[];
}

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  themes: { label: "Theme & Atmosphere", icon: "🎨" },
  activities: { label: "Engaging Activities", icon: "🎯" },
  food: { label: "Food & Beverage", icon: "🍽️" },
  small_touches: { label: "Personalized Touches", icon: "✨" },
};

export function IdeasTab({ ideas }: IdeasTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="cue-card p-4">
        <h3 className="font-display font-bold text-base mb-1">
          Personalized Ideas Rehearsal
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Bespoke themes, interactive activities, hospitality menus, and unexpected small touches generated for your brief.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea, idx) => {
          const cat = CATEGORY_MAP[idea.category] || {
            label: idea.category,
            icon: "💡",
          };

          return (
            <article
              key={idx}
              className="cue-card p-4 flex flex-col justify-between gap-3 border-t-2 border-t-[var(--ink)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-[var(--muted)]">
                  {cat.icon} {cat.label}
                </span>
                <span className="font-mono text-xs text-[var(--cue-red)] font-bold">
                  IDEA #{idx + 1}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm sm:text-base text-[var(--ink)] mb-1">
                  {idea.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {idea.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
