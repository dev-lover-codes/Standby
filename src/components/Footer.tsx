export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)] px-4 py-6 sm:px-6 mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--muted)]">
        <div>
          <span className="font-bold text-[var(--ink)]">Standby</span> &mdash;
          &quot;Standby. Your event is rehearsed.&quot;
        </div>
        <div className="flex items-center gap-4">
          <span>PromptWars Challenge 5: Celebration &amp; Event Planner</span>
          <span className="text-[var(--cue-red)] font-semibold">CUE: STANDBY</span>
        </div>
      </div>
    </footer>
  );
}
