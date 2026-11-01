import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email address, like name@example.com."),
  password: z.string().min(6, "Use a password with at least 6 characters.").max(72),
});

/** Turns raw Supabase auth errors into plain next steps. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is wrong. Check them, or create an account.";
  if (m.includes("email not confirmed")) return "Confirm your email first: open the link we sent, then sign in.";
  if (m.includes("anonymous sign-ins are disabled"))
    return "Guest mode is off. Turn on Anonymous sign-ins in Supabase (Authentication → Sign In / Providers), or use email.";
  if (m.includes("provider is not enabled"))
    return "Google sign-in is off. Turn on the Google provider in Supabase (Authentication → Sign In / Providers).";
  if (m.includes("already registered")) return "That email already has an account. Sign in instead.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Could not reach the sign-in server. Check your connection and the Supabase URL, then try again.";
  return message;
}
