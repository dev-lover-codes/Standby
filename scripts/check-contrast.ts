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

// Standby Design Tokens defined in AGENTS.md
const tokens = {
  light: {
    name: "Paper (Light)",
    bg: "#F4ECDC",
    ink: "#1B1A17",
    cueRed: "#B42318",
    safeGreen: "#1F6B3A",
    tapeYellowBg: "#E0A800",
    line: "#CFC3AA",
  },
  dark: {
    name: "Blackout (Dark)",
    bg: "#12110F",
    text: "#F1E9D8",
    red: "#FF8A7A",
    green: "#7DD3A0",
    yellow: "#F2C94C",
    line: "#38352F",
  },
};

interface CheckPair {
  theme: string;
  label: string;
  foreground: string;
  background: string;
  minRatio: number;
}

const pairs: CheckPair[] = [
  // Light Theme Pairs
  { theme: "Light", label: "Ink on Paper BG", foreground: tokens.light.ink, background: tokens.light.bg, minRatio: 4.5 },
  { theme: "Light", label: "Cue-Red on Paper BG", foreground: tokens.light.cueRed, background: tokens.light.bg, minRatio: 4.5 },
  { theme: "Light", label: "Safe-Green on Paper BG", foreground: tokens.light.safeGreen, background: tokens.light.bg, minRatio: 4.5 },
  { theme: "Light", label: "Ink on Tape-Yellow BG", foreground: tokens.light.ink, background: tokens.light.tapeYellowBg, minRatio: 4.5 },

  // Dark Theme Pairs
  { theme: "Dark", label: "Text on Blackout BG", foreground: tokens.dark.text, background: tokens.dark.bg, minRatio: 4.5 },
  { theme: "Dark", label: "Red on Blackout BG", foreground: tokens.dark.red, background: tokens.dark.bg, minRatio: 4.5 },
  { theme: "Dark", label: "Green on Blackout BG", foreground: tokens.dark.green, background: tokens.dark.bg, minRatio: 4.5 },
  { theme: "Dark", label: "Yellow on Blackout BG", foreground: tokens.dark.yellow, background: tokens.dark.bg, minRatio: 4.5 },
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
