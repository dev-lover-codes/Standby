/** Supabase public settings. Both values are safe to expose; they are protected by RLS. */
export function getSupabaseEnv(): { url: string; anonKey: string; configured: boolean } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured = url.startsWith("https://") && anonKey.length > 20;
  return {
    url: configured ? url : "https://placeholder.supabase.co",
    anonKey: configured ? anonKey : "placeholder-anon-key",
    configured,
  };
}
