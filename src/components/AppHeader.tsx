import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth-actions";
import { OrbitLogo } from "./OrbitLogo";

const NAV_LINK = "min-h-[44px] flex items-center px-2 text-sm text-[var(--ink-nav)] hover:text-white transition-colors";

export async function AppHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const user = data.user;

  return (
    <header className="app-bar no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 min-h-[44px] text-white" aria-label="Standby — home">
          <OrbitLogo className="h-[17px] w-[27px]" />
          <span className="text-lg font-semibold tracking-tight">Standby</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-3">
          <Link href="/dashboard" className={NAV_LINK}>Productions</Link>
          <Link href="/events/new" className="btn btn-solid hidden sm:inline-flex">New event</Link>
          {user ? (
            <form action={signOutAction}>
              <button type="submit" className="btn btn-ghost">Sign out</button>
            </form>
          ) : (
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
