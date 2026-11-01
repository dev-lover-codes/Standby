"use client";

import { useEffect } from "react";

/** Plays the one-time entrance on .frame and keeps the muted background video playing. */
export function LandingEffects() {
  useEffect(() => {
    const frame = document.querySelector<HTMLElement>(".frame");
    const timers: number[] = [];
    const cleanup = () => frame?.classList.remove("intro", "intro-play");

    if (frame?.classList.contains("intro")) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cleanup();
      } else {
        let started = false;
        const start = () => {
          if (started) return;
          started = true;
          requestAnimationFrame(() => requestAnimationFrame(() => frame.classList.add("intro-play")));
        };
        timers.push(window.setTimeout(start, 700));
        document.fonts.ready.then(start, start);
        const last = frame.querySelector(".cta .btn:nth-child(2)");
        last?.addEventListener("animationend", (e) => {
          if (e.target === last) cleanup();
        });
        timers.push(window.setTimeout(cleanup, 3000), window.setTimeout(cleanup, 5000));
      }
    }

    const v = document.querySelector<HTMLVideoElement>("video.sky");
    if (!v) return () => timers.forEach(clearTimeout);
    v.muted = true;
    const play = () => {
      if (v.paused) v.play().catch(() => undefined);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    const once: AddEventListenerOptions = { passive: true, once: true };
    play();
    v.addEventListener("canplay", play);
    document.addEventListener("visibilitychange", onVisible);
    ["pointerdown", "touchstart", "scroll"].forEach((t) => window.addEventListener(t, play, once));

    return () => {
      timers.forEach(clearTimeout);
      v.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", onVisible);
      ["pointerdown", "touchstart", "scroll"].forEach((t) => window.removeEventListener(t, play));
    };
  }, []);

  return null;
}
