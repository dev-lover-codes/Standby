import type { BudgetItem } from "../validation/schemas";

export interface SimulateOptions {
  guestCount?: number;
  baseGuestCount?: number;
  runs?: number;
  seed?: number;
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  count: number;
}

export interface SimulationResult {
  p50: number;
  p80: number;
  p95: number;
  mean: number;
  overBudgetProbability: (budget: number) => number;
  histogram: HistogramBin[];
  rawTotals: number[];
}

export function createMulberry32(seed: number): () => number {
  let s = (seed === 0 ? 1 : seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleTriangular(a: number, c: number, b: number, prng: () => number): number {
  if (a >= b) return a;
  const u = prng();
  const fc = (c - a) / (b - a);
  if (u < fc) {
    return a + Math.sqrt(u * (b - a) * (c - a));
  }
  return b - Math.sqrt((1 - u) * (b - a) * (b - c));
}

export function simulateBudget(
  items: BudgetItem[],
  options: SimulateOptions = {}
): SimulationResult {
  const runs = Math.max(1, options.runs ?? 5000);
  const prng = createMulberry32(options.seed ?? 42);
  const guestCount = options.guestCount ?? 100;
  const baseGuestCount = options.baseGuestCount ?? guestCount;
  const guestRatio = baseGuestCount > 0 ? guestCount / baseGuestCount : 1;

  if (items.length === 0) {
    return {
      p50: 0,
      p80: 0,
      p95: 0,
      mean: 0,
      overBudgetProbability: (budget: number) => (budget < 0 ? 1 : 0),
      histogram: [{ binStart: 0, binEnd: 0, count: runs }],
      rawTotals: new Array(runs).fill(0),
    };
  }

  const totals: number[] = new Array(runs);
  let grandSum = 0;

  for (let r = 0; r < runs; r++) {
    let runTotal = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const scale = item.scales_with_guests ? guestRatio : 1;
      const min = Math.max(0, item.min_cost * scale);
      const likely = Math.max(min, item.likely_cost * scale);
      const max = Math.max(likely, item.max_cost * scale);
      runTotal += sampleTriangular(min, likely, max, prng);
    }
    totals[r] = runTotal;
    grandSum += runTotal;
  }

  totals.sort((x, y) => x - y);

  const getPercentile = (pct: number) => {
    const idx = Math.min(runs - 1, Math.max(0, Math.floor((pct / 100) * runs)));
    const val = totals[idx];
    return Number.isFinite(val) ? Math.round(val * 100) / 100 : 0;
  };

  const p50 = getPercentile(50);
  const p80 = getPercentile(80);
  const p95 = getPercentile(95);
  const mean = Math.round((grandSum / runs) * 100) / 100;

  // Build 12 histogram bins
  const minVal = totals[0];
  const maxVal = totals[runs - 1];
  const numBins = 12;
  const binWidth = maxVal > minVal ? (maxVal - minVal) / numBins : 1;
  const histogram: HistogramBin[] = [];

  for (let b = 0; b < numBins; b++) {
    const bStart = minVal + b * binWidth;
    const bEnd = b === numBins - 1 ? maxVal : bStart + binWidth;
    histogram.push({
      binStart: Math.round(bStart),
      binEnd: Math.round(bEnd),
      count: 0,
    });
  }

  for (let r = 0; r < runs; r++) {
    const v = totals[r];
    const binIdx = Math.min(numBins - 1, Math.floor((v - minVal) / (binWidth || 1)));
    histogram[Math.max(0, binIdx)].count++;
  }

  const overBudgetProbability = (budget: number) => {
    if (budget <= 0) return 1;
    let over = 0;
    for (let i = 0; i < runs; i++) {
      if (totals[i] > budget) over++;
    }
    return Math.round((over / runs) * 1000) / 1000;
  };

  return {
    p50,
    p80,
    p95,
    mean,
    overBudgetProbability,
    histogram,
    rawTotals: totals,
  };
}
