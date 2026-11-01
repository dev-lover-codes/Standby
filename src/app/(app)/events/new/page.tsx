"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/app/actions";

const FIELD = "w-full min-h-[44px] px-3 rounded-[10px] bg-white/5 border border-[var(--line)] text-sm text-white";
const LABEL = "block text-sm font-medium mb-1";

export default function NewEventPage() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await createEventAction(new FormData(e.currentTarget));
      if (!res.success || !res.eventId) {
        setError(res.error || "Could not create the event. Check the form and try again.");
        setLoading(false);
        return;
      }
      router.push(`/events/${res.eventId}`);
    } catch {
      setError("Something went wrong while saving. Check your connection and try again.");
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const describedBy = error ? "slate-error" : undefined;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <span className="gaffer-tape text-xs">Slate</span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3">Rehearse a new event</h1>
        </div>
        <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="standby-light" aria-hidden="true" />
          {loading ? "Working" : "Standby"}
        </span>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {loading ? "Building your plan. This can take up to a minute." : ""}
      </div>
      {error && (
        <p id="slate-error" role="alert" className="mb-4 p-3 rounded-[10px] border border-[var(--cue-red)] text-sm text-[var(--cue-red)]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="cue-card p-6 sm:p-8 flex flex-col gap-5" aria-busy={loading}>
        <div>
          <label htmlFor="title" className={LABEL}>Event title</label>
          <input id="title" name="title" type="text" required maxLength={120} aria-describedby={describedBy}
            placeholder="Maya and Leo's backyard wedding" className={FIELD} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="kind" className={LABEL}>Event kind</label>
            <select id="kind" name="kind" required className={FIELD}>
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="community">Community event</option>
              <option value="other">Other celebration</option>
            </select>
          </div>
          <div>
            <label htmlFor="event_date" className={LABEL}>Event date</label>
            <input id="event_date" name="event_date" type="date" min={today} required defaultValue="2027-06-20"
              aria-describedby={describedBy} className={FIELD} />
          </div>
          <div>
            <label htmlFor="guest_count" className={LABEL}>Estimated guests</label>
            <input id="guest_count" name="guest_count" type="number" min={1} max={5000} defaultValue={80} required
              aria-describedby={describedBy} className={FIELD} />
          </div>
          <div>
            <label htmlFor="budget_total" className={LABEL}>Target budget ($)</label>
            <input id="budget_total" name="budget_total" type="number" min={0} max={1000000000} defaultValue={15000} required
              aria-describedby={describedBy} className={FIELD} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="outdoor" name="outdoor" type="checkbox" className="h-5 w-5 accent-white" />
          <label htmlFor="outdoor" className="text-sm">Part of the event is outdoors</label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="brief" className="text-sm font-medium">Creative brief</label>
            <span className="text-xs text-[var(--muted)]" aria-hidden="true">{brief.length}/1500</span>
          </div>
          <textarea id="brief" name="brief" rows={5} maxLength={1500} required value={brief}
            onChange={(e) => setBrief(e.target.value)} aria-describedby={describedBy ? `brief-hint ${describedBy}` : "brief-hint"}
            placeholder="Vision, must-haves, diets, music, mood…" className={`${FIELD} py-2`} />
          <p id="brief-hint" className="text-xs text-[var(--muted)] mt-1">Up to 1,500 characters. Treated as data, never as instructions.</p>
        </div>

        <button type="submit" disabled={loading} className="btn btn-solid w-full">
          {loading ? "Rehearsing your event…" : "Rehearse production"}
        </button>
      </form>
    </div>
  );
}
