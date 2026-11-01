"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { credentialsSchema, friendlyAuthError } from "@/lib/validation/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

const INPUT = "w-full min-h-[44px] px-3 rounded-[10px] bg-white/5 border border-[var(--line)] text-sm text-white placeholder:text-[var(--muted)]";

function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { configured } = getSupabaseEnv();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(
    params.get("error") === "auth"
      ? { text: "Sign-in did not finish. The link may have expired or Google was cancelled. Try again.", error: true }
      : null
  );

  const run = async (task: () => Promise<string | null>) => {
    setLoading(true);
    setMessage(null);
    try {
      const notice = await task();
      if (notice) setMessage({ text: notice, error: false });
    } catch (err: unknown) {
      setMessage({ text: friendlyAuthError(err instanceof Error ? err.message : String(err)), error: true });
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    router.replace(next);
    router.refresh();
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setMessage({ text: parsed.error.issues[0]?.message ?? "Check your details.", error: true });
      return;
    }
    void run(async () => {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        goNext();
        return "Signed in. Opening your productions…";
      }
      const { data, error } = await supabase.auth.signUp({
        ...parsed.data,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) throw error;
      if (data.session) {
        goNext();
        return "Account created. Opening your productions…";
      }
      setMode("signin");
      return "Account created. Check your inbox and open the confirmation link, then sign in.";
    });
  };

  const handleGuest = () =>
    void run(async () => {
      const { error } = await createClient().auth.signInAnonymously();
      if (error) throw error;
      goNext();
      return "Guest pass ready. Opening your productions…";
    });

  return (
    <div className="cue-card p-6 sm:p-8">
      <span className="gaffer-tape text-xs">Stage access</span>
      <h1 className="text-3xl font-semibold tracking-tight mt-4 mb-2">
        {mode === "signin" ? "Sign in to Standby" : "Create your account"}
      </h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Your budgets, timelines, vendor checklists and personalized ideas, saved in one place.
      </p>

      {!configured && (
        <p role="alert" className="mb-6 p-3 rounded-[10px] border border-[var(--tape-yellow)] text-sm text-[var(--tape-yellow)]">
          Sign-in is not set up yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the app.
        </p>
      )}

      <div id="auth-status" role="status" aria-live="polite">
        {message && (
          <p className={`mb-6 p-3 rounded-[10px] border text-sm ${message.error ? "border-[var(--cue-red)] text-[var(--cue-red)]" : "border-[var(--safe-green)] text-[var(--safe-green)]"}`}>
            {message.text}
          </p>
        )}
      </div>

      <GoogleSignInButton next={next} disabled={loading || !configured}
        onError={(text) => setMessage({ text, error: true })} />
      <p className="my-4 flex items-center gap-3 text-xs text-[var(--muted)] before:h-px before:flex-1 before:bg-[var(--line)] after:h-px after:flex-1 after:bg-[var(--line)]">
        or use email
      </p>

      <form onSubmit={handleEmail} className="space-y-4" noValidate>
        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium mb-1">Email</label>
          <input id="auth-email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={INPUT}
            aria-describedby="auth-status" />
        </div>
        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium mb-1">Password</label>
          <input id="auth-password" type="password" required minLength={6} value={password}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)} className={INPUT} aria-describedby="auth-status" />
        </div>
        <button type="submit" disabled={loading || !configured} className="btn btn-ghost w-full">
          {loading ? "Checking…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button type="button" className="btn w-full my-3 text-sm text-[var(--ink-nav)] hover:underline"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(null); }}>
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>

      <div className="border-t border-[var(--line)] pt-4">
        <button type="button" onClick={handleGuest} disabled={loading || !configured} className="btn btn-ghost w-full">
          <span className="standby-light" aria-hidden="true" /> Try as guest (no email)
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <Suspense fallback={<p className="cue-card p-6 text-center text-sm">Loading sign-in…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
