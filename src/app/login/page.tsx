"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setStatusMessage("Authenticated successfully. Redirecting to call sheet...");
        router.push(nextUrl);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setStatusMessage("Rehearsal account created. Please verify your email or proceed.");
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setIsError(true);
      const message = err instanceof Error ? err.message : "Authentication encountered an error.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setStatusMessage("Guest rehearsal pass granted. Redirecting...");
      router.push(nextUrl);
      router.refresh();
    } catch (err: unknown) {
      setIsError(true);
      const message =
        err instanceof Error
          ? err.message
          : "Anonymous rehearsal sign-in failed. Please verify Supabase configuration.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cue-card cue-card-torn p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="gaffer-tape text-xs">STAGE ACCESS</span>
        <span className="font-mono text-xs text-[var(--muted)]">SEC-01</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-fraunces)] mb-2">
        {mode === "signin" ? "Sign In to Standby" : "Create Production Pass"}
      </h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Access your event timelines, pre-mortem risk boards, and budget simulators.
      </p>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 mb-6 text-xs font-mono border ${
            isError
              ? "border-[var(--cue-red)] text-[var(--cue-red)] bg-red-50/10"
              : "border-[var(--safe-green)] text-[var(--safe-green)] bg-green-50/10"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-mono font-bold uppercase tracking-wider mb-1"
          >
            Stage Email Address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="producer@stage.theater"
            className="w-full min-h-[44px] px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--line)] rounded focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            aria-describedby="auth-email-hint"
          />
          <span id="auth-email-hint" className="sr-only">
            Enter the email associated with your Standby productions.
          </span>
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-mono font-bold uppercase tracking-wider mb-1"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-h-[44px] px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--line)] rounded focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {loading ? "CHECKING CREDENTIALS..." : mode === "signin" ? "SIGN IN" : "REGISTER"}
        </button>
      </form>

      <div className="my-6 flex items-center justify-between border-t border-b border-[var(--line)] py-3">
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setStatusMessage(null);
          }}
          className="text-xs font-mono hover:underline text-[var(--ink)] cursor-pointer"
        >
          {mode === "signin" ? "Need a pass? Register" : "Already have a pass? Sign In"}
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={handleGuestSignIn}
          disabled={loading}
          className="w-full min-h-[44px] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-[var(--ink)] hover:bg-[var(--line)]/30 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full inline-block bg-[var(--tape-yellow)]"
            aria-hidden="true"
          />
          TRY AS GUEST (1-CLICK PASS)
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <Suspense
        fallback={
          <div className="cue-card p-6 text-center font-mono text-xs">
            INITIALIZING PASS...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
