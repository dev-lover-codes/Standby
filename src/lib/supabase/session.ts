import "server-only";
import { createClient } from "./server";

const AI_DAILY_LIMIT = 20;

export async function getSessionClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

/** Returns a function that spends one AI call from the user's daily quota (false = over quota). */
export function quotaCheck(supabase: Awaited<ReturnType<typeof createClient>>) {
  return async () => {
    const { data } = await supabase.rpc("consume_ai_quota", { p_max: AI_DAILY_LIMIT });
    return Boolean(data);
  };
}
