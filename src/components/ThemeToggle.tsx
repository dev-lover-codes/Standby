"use client";

import { useSyncExternalStore } from "react";

function getThemeSnapshot(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("standby-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    mql.removeEventListener("change", callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("standby-theme", nextTheme);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[var(--line)] rounded min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--card-bg)] transition-colors"
      aria-label={`Switch to ${theme === "light" ? "Blackout (dark)" : "Paper (light)"} theme`}
      title={`Switch to ${theme === "light" ? "Blackout" : "Paper"} mode`}
    >
      <span
        aria-hidden="true"
        className="w-2.5 h-2.5 rounded-full inline-block"
        style={{ backgroundColor: theme === "light" ? "#1B1A17" : "#F2C94C" }}
      />
      <span>{theme === "light" ? "BLACKOUT" : "PAPER"}</span>
    </button>
  );
}
