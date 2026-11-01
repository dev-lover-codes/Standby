"use client";

import React, { useState } from "react";
import { createShareLinkAction } from "@/app/actions";

interface ShareButtonProps {
  eventId: string;
}

export function ShareButton({ eventId }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const handleShare = async () => {
    try {
      setLoading(true);
      const res = await createShareLinkAction(eventId, 7);
      if (!res.success || !res.token) {
        setAnnouncement("Could not generate share link. Please try again.");
        return;
      }

      const shareUrl = `${window.location.origin}/share/${res.token}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setAnnouncement("Read-only share link copied to clipboard. Link expires in 7 days.");
      setTimeout(() => setCopied(false), 4000);
    } catch {
      setAnnouncement("Failed to copy link. Please check permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        className="px-3 py-1.5 border border-[var(--ink)] bg-[var(--card-bg)] hover:bg-[var(--line)] font-mono text-xs rounded min-h-[44px] flex items-center gap-1.5 transition-colors"
      >
        <span aria-hidden="true">🔗</span>
        <span>{loading ? "Generating..." : copied ? "Copied!" : "Share Link"}</span>
      </button>

      {/* Screen reader live notification */}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
