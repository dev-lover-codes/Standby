/**
 * WCAG 2.1 Contrast Checker for Standby design tokens
 * Verifies that text/background pairs meet AA requirements (4.5:1 for normal text, 3:1 for large text).
 */

interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): ColorRgb {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function relativeLuminance({ r, g, b }: ColorRgb): number {
  const transform = (channel: number) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * transform(r) +
    0.7152 * transform(g) +
    0.0722 * transform(b)
  );
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Standby "Orbit" tokens (src/app/globals.css). One dark theme; glass surfaces sit on black.
const t = {
  bg: "#000000",
  card: "#0e0e10",
  ink: "#FFFFFF",
  inkNav: "#E8E8E8", // rgba(255,255,255,.91) on black
  muted: "#A1A1A6",
  sub: "#808080", // landing sub-line: rgba(255,255,255,.50) on black, large-ish text
  red: "#FF8A7A",
  green: "#7DD3A0",
  yellow: "#F2C94C",
  focus: "#9B8CFF",
};

interface CheckPair {
  theme: string;
  label: string;
  foreground: string;
  background: string;
  minRatio: number;
}

const pairs: CheckPair[] = [
  { theme: "Orbit", label: "Ink on black", foreground: t.ink, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Nav ink on black", foreground: t.inkNav, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Muted on black", foreground: t.muted, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Muted on card", foreground: t.muted, background: t.card, minRatio: 4.5 },
  { theme: "Orbit", label: "Landing sub-line on black", foreground: t.sub, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Red on black", foreground: t.red, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Green on black", foreground: t.green, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Yellow on black", foreground: t.yellow, background: t.bg, minRatio: 4.5 },
  { theme: "Orbit", label: "Black on white button", foreground: t.bg, background: t.ink, minRatio: 4.5 },
  { theme: "Orbit", label: "Black on HOLD badge", foreground: t.bg, background: t.red, minRatio: 4.5 },
  { theme: "Orbit", label: "Black on OK badge", foreground: t.bg, background: t.green, minRatio: 4.5 },
  { theme: "Orbit", label: "Black on fix badge", foreground: t.bg, background: t.yellow, minRatio: 4.5 },
  { theme: "Orbit", label: "Focus ring on black", foreground: t.focus, background: t.bg, minRatio: 3 },
];

console.log("=== Standby Contrast Ratio Verification ===\n");
let hasFailure = false;

for (const pair of pairs) {
  const ratio = contrastRatio(pair.foreground, pair.background);
  const passed = ratio >= pair.minRatio;
  const status = passed ? "✓ PASS" : "✗ FAIL";
  console.log(
    `${status} [${pair.theme}] ${pair.label.padEnd(26)}: ${ratio.toFixed(2)}:1 (required >= ${pair.minRatio}:1)`
  );
  if (!passed) {
    hasFailure = true;
  }
}

console.log("\n===========================================");
if (hasFailure) {
  console.error("FAIL: One or more color pairs failed WCAG contrast check!");
  process.exit(1);
} else {
  console.log("SUCCESS: All color pairs exceed required WCAG contrast ratios.");
}
