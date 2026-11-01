import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteEventButton } from "@/components/DeleteEventButton";

export const metadata: Metadata = { title: "Productions | Standby" };

function daysUntil(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const today = new Date();
  return Math.ceil((Date.UTC(y, m - 1, d) - Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / 86_400_000);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/dashboard");

  const { data, error } = await supabase
    .from("events")
    .select("id, title, kind, event_date, guest_count, budget_total")
    .order("event_date", { ascending: true });
  const events = data ?? [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Productions</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Signed in as {auth.user.is_anonymous ? "a guest" : auth.user.email}
          </p>
        </div>
        <Link href="/events/new" className="btn btn-solid">New event</Link>
      </div>

      {error && (
        <p role="alert" className="cue-card p-4 text-sm text-[var(--cue-red)]">
          Could not load your events. Check that the database migration has run, then refresh.
        </p>
      )}

      {!error && events.length === 0 ? (
        <div className="cue-card p-10 text-center flex flex-col items-center gap-3">
          <h2 className="text-xl font-semibold">No events yet</h2>
          <p className="text-sm text-[var(--muted)] max-w-md">
            Write a short brief and Standby builds the budget, timeline, vendor checklist and personalized ideas.
          </p>
          <Link href="/events/new" className="btn btn-solid mt-2">Plan your first event</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const days = daysUntil(event.event_date);
            return (
              <li key={event.id} className="cue-card p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="gaffer-tape text-xs capitalize">{event.kind}</span>
                  <span className={`text-sm font-medium ${days < 30 ? "text-[var(--cue-red)]" : "text-[var(--safe-green)]"}`}>
                    {days > 0 ? `${days} days to go` : days === 0 ? "Today" : "Past event"}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    <Link href={`/events/${event.id}`} className="hover:underline">{event.title}</Link>
                  </h2>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {event.event_date} · {event.guest_count} guests · ${Number(event.budget_total).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
                  <Link href={`/events/${event.id}`} className="btn btn-ghost">Open call sheet</Link>
                  <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
