import { describe, it, expect, vi, afterEach } from "vitest";
import { buildCsp } from "@/lib/csp";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { credentialsSchema, friendlyAuthError } from "@/lib/validation/auth";
import { safeSchedule } from "@/lib/timeline/safe-schedule";

afterEach(() => vi.unstubAllEnvs());

describe("buildCsp", () => {
  it("allows Supabase over https and wss and blocks framing in production", () => {
    const csp = buildCsp("abc", "https://x.supabase.co", { isDev: false, https: true });
    expect(csp).toContain("connect-src 'self' https://x.supabase.co wss://x.supabase.co");
    expect(csp).toContain("'nonce-abc'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("unsafe-eval");
  });
  it("relaxes scripts only in development", () => {
    const csp = buildCsp("abc", "https://x.supabase.co", { isDev: true, https: false });
    expect(csp).toContain("unsafe-eval");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});

describe("getSupabaseEnv", () => {
  it("reports not configured with placeholders when values are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(getSupabaseEnv()).toEqual({ url: "https://placeholder.supabase.co", anonKey: "placeholder-anon-key", configured: false });
  });
  it("returns real values when set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "a".repeat(40));
    expect(getSupabaseEnv()).toMatchObject({ url: "https://abc.supabase.co", configured: true });
  });
});

describe("auth validation", () => {
  it("accepts good credentials and rejects bad ones", () => {
    expect(credentialsSchema.safeParse({ email: "a@b.co", password: "secret1" }).success).toBe(true);
    expect(credentialsSchema.safeParse({ email: "nope", password: "secret1" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ email: "a@b.co", password: "123" }).success).toBe(false);
  });
  it.each([
    ["Invalid login credentials", /wrong/],
    ["Email not confirmed", /Confirm your email/],
    ["Anonymous sign-ins are disabled", /Guest mode is off/],
    ["User already registered", /already has an account/],
    ["Unsupported provider: provider is not enabled", /Google sign-in is off/],
    ["Failed to fetch", /Could not reach/],
    ["Something odd", /Something odd/],
  ])("maps %s", (raw, expected) => {
    expect(friendlyAuthError(raw)).toMatch(expected);
  });
});

describe("safeSchedule", () => {
  it("schedules normally and survives a dependency loop", () => {
    const ok = safeSchedule([{ title: "A", duration_days: 2, depends_on: [], done: false }], "2030-01-10");
    expect(ok[0].id).toBe("task-0");
    const loop = safeSchedule(
      [
        { id: "a", title: "A", duration_days: 1, depends_on: ["b"], done: false },
        { id: "b", title: "B", duration_days: 1, depends_on: ["a"], done: false },
      ],
      "2030-01-10"
    );
    expect(loop.every((t) => t.depends_on.length === 0)).toBe(true);
  });
});
