export interface IdeaItem {
  title: string;
  description: string;
}

export function IdeasTab({ ideas }: { ideas: IdeaItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="cue-card p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Personalized ideas</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Themes, activities, food and small touches picked for your brief.
        </p>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea, idx) => (
          <li key={idea.title} className="cue-card p-4 flex flex-col gap-2">
            <span className="font-mono text-xs font-semibold text-[var(--cue-red)]">IDEA {idx + 1}</span>
            <h3 className="font-semibold">{idea.title}</h3>
            <p className="text-sm text-[var(--ink-nav)]">{idea.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
