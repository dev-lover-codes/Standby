"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OrbitLogo } from "@/components/OrbitLogo";

const LINKS = [
  { href: "/dashboard", label: "Productions" },
  { href: "/events/new", label: "New event" },
  { href: "/login", label: "Sign in" },
];

export function LandingBar() {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="bar" ref={barRef} data-open={open ? "true" : "false"}>
      <Link className="brand" href="/" aria-label="Standby — home">
        <OrbitLogo />
        <span className="brand-word">Standby</span>
      </Link>

      <nav className="links" aria-label="Primary">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
      </nav>

      <div className="actions">
        <Link className="btn ghost" href="/login">Try as guest</Link>
        <Link className="btn solid" href="/events/new">Get started</Link>
        <button
          type="button"
          className="menu"
          aria-label={open ? "Close menu" : "Menu"}
          aria-expanded={open}
          aria-controls="menu-sheet"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <svg viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <nav className="sheet" id="menu-sheet" aria-label="Menu">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
          <Link className="btn solid" href="/events/new">Get started</Link>
        </nav>
      </div>
    </header>
  );
}
