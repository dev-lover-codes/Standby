import { describe, it, expect, vi } from "vitest";

const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    rpc: mockRpc,
  })),
}));

describe("Health API Route (/api/health)", () => {
  it("returns 200 with { ok: true, time } when ping succeeds", async () => {
    mockRpc.mockResolvedValueOnce({ data: "pong", error: null });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.time).toBeDefined();
    expect(json.secret).toBeUndefined();
  });

  it("returns 503 when ping fails", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: "DB timeout" } });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.ok).toBe(false);
  });
});
