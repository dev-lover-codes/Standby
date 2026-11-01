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
      const token = res.data?.token;
      if (!res.success || !token) {
        setAnnouncement(res.error ?? "Could not create a share link. Try again.");
        return;
      }

      const shareUrl = `${window.location.origin}/share/${token}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setAnnouncement("Read-only link copied. It expires in 7 days.");
      } catch {
        setAnnouncement(`Copy this read-only link (expires in 7 days): ${shareUrl}`);
      }
      setTimeout(() => setCopied(false), 4000);
    } catch {
      setAnnouncement("Could not create a share link. Check your connection and try again.");
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
        className="btn btn-ghost"
      >
        <span>{loading ? "Creating link…" : copied ? "Copied" : "Share read-only link"}</span>
      </button>

      {/* Screen reader live notification */}
      <span className="block text-xs text-[var(--muted)] mt-1 max-w-[16rem] break-all" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
