import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteEventButton } from "@/components/DeleteEventButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, title, kind, event_date, guest_count, budget_total, created_at")
    .order("event_date", { ascending: true });

  const eventList = events || [];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[var(--ink)] pb-4">
        <div>
          <span className="gaffer-tape text-xs">STAGE MANAGER ARCHIVE</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[var(--ink)] mt-2">
            Productions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Active rehearsals on file for {user.email || "Guest"}
          </p>
        </div>

        <Link
          href="/events/new"
          className="px-4 py-2.5 bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-xs sm:text-sm rounded shadow hover:opacity-90 min-h-[44px] flex items-center"
        >
          + New Slate
        </Link>
      </div>

      {/* Productions List */}
      {eventList.length === 0 ? (
        <div className="cue-card cue-card-torn p-8 text-center flex flex-col items-center gap-3">
          <span className="stamp-label text-xs">SLATE EMPTY</span>
          <h2 className="font-display font-bold text-lg text-[var(--ink)]">
            No rehearsals found on this stage
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md">
            You haven&apos;t created any events yet. Click below to draft your first creative brief and generate a full rehearsal plan.
          </p>
          <Link
            href="/events/new"
            className="mt-2 px-5 py-2.5 bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-xs rounded min-h-[44px] flex items-center"
          >
            Create Your First Rehearsal →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventList.map((event) => {
            const targetDate = new Date(event.event_date);
            const today = new Date();
            const daysLeft = Math.ceil(
              (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <article
                key={event.id}
                className="cue-card p-5 flex flex-col justify-between gap-4 border-l-4 border-l-[var(--ink)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] uppercase bg-[var(--line)] px-2 py-0.5 rounded text-[var(--ink)]">
                      {event.kind}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        daysLeft < 30 ? "text-[var(--cue-red)]" : "text-[var(--safe-green)]"
                      }`}
                    >
                      {daysLeft >= 0 ? `${daysLeft} days to call` : "Past Event"}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-lg text-[var(--ink)]">
                    <Link href={`/events/${event.id}`} className="hover:underline">
                      {event.title}
                    </Link>
                  </h2>

                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)] mt-2">
                    <span>Date: {event.event_date}</span>
                    <span>Guests: {event.guest_count}</span>
                    <span>Budget: ${Number(event.budget_total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
                  <Link
                    href={`/events/${event.id}`}
                    className="font-mono font-bold text-xs text-[var(--ink)] hover:underline min-h-[44px] flex items-center"
                  >
                    Open Call Sheet →
                  </Link>

                  <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
