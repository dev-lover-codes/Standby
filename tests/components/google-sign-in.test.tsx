import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ auth: { signInWithOAuth } }),
}));

const { GoogleSignInButton } = await import("@/components/GoogleSignInButton");

describe("GoogleSignInButton", () => {
  it("starts Google sign-in with a callback that keeps the next page", async () => {
    signInWithOAuth.mockResolvedValueOnce({ error: null });
    render(<GoogleSignInButton next="/events/new" disabled={false} onError={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=%2Fevents%2Fnew` },
    });
  });

  it("shows a plain error when the provider is off", async () => {
    signInWithOAuth.mockResolvedValueOnce({ error: { message: "Unsupported provider: provider is not enabled" } });
    const onError = vi.fn();
    render(<GoogleSignInButton next="/dashboard" disabled={false} onError={onError} />);
    await userEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringMatching(/Google sign-in is off/)));
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeEnabled();
  });

  it("is disabled when sign-in is not configured", () => {
    render(<GoogleSignInButton next="/dashboard" disabled onError={vi.fn()} />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeDisabled();
  });
});
