import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
const rpc = vi.fn();
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ rpc, auth: { getUser } })),
}));

describe("session helpers", () => {
  it("returns the signed-in user and checks the AI quota", async () => {
    const { getSessionClient, quotaCheck } = await import("@/lib/supabase/session");
    getUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    const { supabase, user } = await getSessionClient();
    expect(user).toEqual({ id: "u1" });

    rpc.mockResolvedValueOnce({ data: true }).mockResolvedValueOnce({ data: null });
    const check = quotaCheck(supabase as never);
    expect(await check()).toBe(true);
    expect(await check()).toBe(false);
    expect(rpc).toHaveBeenCalledWith("consume_ai_quota", { p_max: 20 });
  });
});
