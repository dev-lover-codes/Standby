import { describe, it, expect } from "vitest";
import { createShareToken, isExpired } from "@/lib/share/token";

describe("Share Token Generator & Expiry", () => {
  it("generates URL-safe random tokens with at least 32 characters", () => {
    const token = createShareToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
  });

  it("produces distinct unique tokens across successive calls", () => {
    const tokenA = createShareToken();
    const tokenB = createShareToken();
    expect(tokenA).not.toBe(tokenB);
  });

  it("checks expiration accurately against reference timestamp", () => {
    const now = new Date("2027-01-01T12:00:00Z").getTime();
    const past = new Date("2027-01-01T11:00:00Z").toISOString();
    const future = new Date("2027-01-01T13:00:00Z").toISOString();

    expect(isExpired(past, now)).toBe(true);
    expect(isExpired(future, now)).toBe(false);
    expect(isExpired("not-a-date", now)).toBe(true);
  });
});
