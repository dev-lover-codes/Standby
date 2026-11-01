"use client";

import React, { useState } from "react";
import { deleteEventAction } from "@/app/actions";

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
  onDeleted?: () => void;
}

export function DeleteEventButton({
  eventId,
  eventTitle,
  onDeleted,
}: DeleteEventButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteEventAction(eventId);
    setLoading(false);
    setConfirmOpen(false);
    if (onDeleted) onDeleted();
  };

  return (
    <div className="relative inline-block">
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="btn text-[var(--cue-red)] hover:underline"
          aria-label={`Delete event rehearsal: ${eventTitle}`}
        >
          Delete
        </button>
      ) : (
        <div
          role="group"
          aria-labelledby={`del-title-${eventId}`}
          className="flex flex-wrap items-center gap-2 p-2 bg-[var(--card-bg)] border border-[var(--cue-red)] rounded-[12px]"
        >
          <span id={`del-title-${eventId}`} className="text-sm text-[var(--cue-red)] font-semibold">
            Confirm delete?
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="btn bg-[var(--cue-red)] text-black"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
