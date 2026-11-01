import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--bg)] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-inherit no-underline group focus-visible:outline-2"
          >
            <span
              className="standby-light"
              aria-hidden="true"
              title="System Standby: Armed"
            />
            <span
              className="text-2xl font-bold tracking-tight font-[family-name:var(--font-fraunces)]"
            >
              Standby
            </span>
            <span className="hidden sm:inline-block text-xs font-mono text-[var(--muted)] border-l border-[var(--line)] pl-2">
              REHEARSED
            </span>
          </Link>
        </div>

        <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="min-h-[44px] min-w-[44px] flex items-center px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider hover:underline"
          >
            Productions
          </Link>
          <Link
            href="/events/new"
            className="min-h-[44px] min-w-[44px] flex items-center px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider bg-[var(--ink)] text-[var(--bg)] hover:opacity-90"
          >
            + Slate
          </Link>
          <Link
            href="/login"
            className="min-h-[44px] min-w-[44px] flex items-center px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider hover:underline"
          >
            Account
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
