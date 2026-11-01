"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/app/actions";

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
      const form = new FormData(e.currentTarget);
      const res = await createEventAction(form);
      if (!res.success || !res.eventId) {
        setError(res.error || "Failed to rehearse event. Please check inputs.");
        setLoading(false);
        return;
      }
      router.push(`/events/${res.eventId}`);
    } catch {
      setError("An unexpected error occurred while preparing your rehearsal.");
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="cue-card cue-card-torn p-6 sm:p-8 border-2 border-[var(--ink)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
          <div>
            <span className="stamp-label text-xs">SLATE 01</span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--ink)] mt-2">
              Rehearse a New Event
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`standby-light ${loading ? "animate-ping" : ""}`}
              role="status"
              aria-label={loading ? "AI rehearsal engine in progress" : "Engine ready"}
            />
            <span className="font-mono text-xs text-[var(--muted)]">
              {loading ? "PROCESSING" : "STANDBY"}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 p-3 bg-[var(--cue-red)]/10 border border-[var(--cue-red)] text-[var(--cue-red)] text-xs font-mono rounded"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label htmlFor="title" className="block font-bold text-[var(--ink)] mb-1">
              Event Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Maya & Leo's Backyard Wedding"
              className="w-full p-2.5 border border-[var(--line)] bg-[var(--bg)] rounded text-sm text-[var(--ink)] focus:border-[var(--ink)] min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kind" className="block font-bold text-[var(--ink)] mb-1">
                Event Kind *
              </label>
              <select
                id="kind"
                name="kind"
                required
                className="w-full p-2.5 border border-[var(--line)] bg-[var(--bg)] rounded text-sm text-[var(--ink)] min-h-[44px]"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Celebration</option>
                <option value="community">Community Gathering</option>
                <option value="other">Other Celebration</option>
              </select>
            </div>

            <div>
              <label htmlFor="event_date" className="block font-bold text-[var(--ink)] mb-1">
                Event Date *
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                min={todayStr}
                required
                defaultValue="2027-06-20"
                className="w-full p-2.5 border border-[var(--line)] bg-[var(--bg)] rounded text-sm text-[var(--ink)] min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest_count" className="block font-bold text-[var(--ink)] mb-1">
                Estimated Guests *
              </label>
              <input
                id="guest_count"
                name="guest_count"
                type="number"
                min="1"
                max="5000"
                defaultValue="80"
                required
                className="w-full p-2.5 border border-[var(--line)] bg-[var(--bg)] rounded text-sm text-[var(--ink)] min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="budget_total" className="block font-bold text-[var(--ink)] mb-1">
                Target Budget ($) *
              </label>
              <input
                id="budget_total"
                name="budget_total"
                type="number"
                min="100"
                max="10000000"
                defaultValue="15000"
                required
                className="w-full p-2.5 border border-[var(--line)] bg-[var(--bg)] rounded text-sm text-[var(--ink)] min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="outdoor"
              name="outdoor"
              type="checkbox"
              className="h-4 w-4 rounded accent-[var(--cue-red)]"
            />
            <label htmlFor="outdoor" className="font-bold text-[var(--ink)] cursor-pointer">
              Includes outdoor spaces (requires weather mitigations)
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="brief" className="font-bold text-[var(--ink)]">
                Creative Brief (up to 1,500 chars) *
              </label>
              <span className="text-[10px] text-[var(--muted)]">
                {brief.length}/1500
              </span>
            </div>
            <textarea
              id="brief"
              name="brief"
              rows={4}
              maxLength={1500}
              required
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Tell Gemini your vision, constraints, dietary needs, musical tastes, and atmosphere..."
              className="w-full p-2.5 border border-[var(--line)] bg-[var(--bg)] rounded text-sm text-[var(--ink)] font-sans focus:border-[var(--ink)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--ink)] text-[var(--bg)] font-bold text-sm rounded shadow hover:opacity-90 disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Rehearsing Event with Gemini..." : "Rehearse Production →"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
          <span>Engine: Gemini 2.5 Flash / Safe Template Fallback</span>
          <span>Prompt-Injection Isolated</span>
        </div>
      </div>
    </div>
  );
}
