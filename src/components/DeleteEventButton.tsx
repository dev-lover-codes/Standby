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
          className="text-xs font-mono text-[var(--cue-red)] hover:underline p-2 min-h-[44px] flex items-center"
          aria-label={`Delete event rehearsal: ${eventTitle}`}
        >
          Delete
        </button>
      ) : (
        <div
          role="dialog"
          aria-labelledby={`del-title-${eventId}`}
          className="flex items-center gap-2 p-2 bg-[var(--card-bg)] border border-[var(--cue-red)] rounded shadow-md"
        >
          <span id={`del-title-${eventId}`} className="text-xs font-mono text-[var(--cue-red)] font-bold">
            Confirm delete?
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-2 py-1 bg-[var(--cue-red)] text-white font-mono text-xs rounded min-h-[44px] flex items-center"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="px-2 py-1 border border-[var(--line)] font-mono text-xs rounded min-h-[44px] flex items-center"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
