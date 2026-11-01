import { describe, it, expect, vi } from "vitest";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

let capturedCookieHandlers: {
  getAll: () => unknown[];
  setAll: (cookies: Array<{ name: string; value: string; options?: object }>) => void;
} | null = null;

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ auth: { getUser: vi.fn() } })),
  createServerClient: vi.fn((_url, _key, options) => {
    capturedCookieHandlers = options.cookies;
    return { auth: { getUser: vi.fn() } };
  }),
}));

const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [{ name: "test", value: "123" }],
    set: mockSet,
  })),
}));

describe("Supabase SSR Clients", () => {
  it("creates browser client with fallback configuration", () => {
    const client = createBrowserClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("creates server client with cookie store handling and tests setAll", async () => {
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const serverClient = await createServerClient();
    expect(serverClient).toBeDefined();
    expect(capturedCookieHandlers).toBeDefined();

    if (capturedCookieHandlers) {
      expect(capturedCookieHandlers.getAll()).toEqual([{ name: "test", value: "123" }]);
      capturedCookieHandlers.setAll([{ name: "session", value: "abc", options: {} }]);
      expect(mockSet).toHaveBeenCalledWith("session", "abc", {});

      // Test error handling in setAll
      mockSet.mockImplementationOnce(() => {
        throw new Error("Cannot set cookie in server component");
      });
      expect(() => {
        capturedCookieHandlers?.setAll([{ name: "err", value: "fail" }]);
      }).not.toThrow();
    }
  });
});
