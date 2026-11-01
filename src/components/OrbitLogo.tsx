const RING = { cx: 13.25, cy: 8.4, rx: 13.2, ry: 2.9, transform: "rotate(-25 13.25 8.4)" };

/** Ringed-planet mark. Sized by the parent's CSS. */
export function OrbitLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 26.9 16.6" fill="none" overflow="visible" aria-hidden="true" className={className}>
      <ellipse {...RING} stroke="currentColor" strokeWidth="1.25" />
      <circle cx="13.25" cy="8.4" r="8.8" fill="#000" />
      <circle cx="13.25" cy="8.4" r="8.1" fill="currentColor" />
      <ellipse {...RING} stroke="#000" strokeWidth="0.9" strokeDasharray="28.2 28.2" />
      <ellipse {...RING} stroke="currentColor" strokeWidth="1.25" strokeDasharray="28.2 28.2" />
    </svg>
  );
}
