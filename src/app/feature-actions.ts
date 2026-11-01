"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionClient, quotaCheck } from "@/lib/supabase/session";
import { runPreMortem, runGuestPanel, explainScenario } from "@/lib/ai/service";
import type { AiScenarioExplain } from "@/lib/ai/schemas";
import { eventKindSchema, scenarioIdSchema, vendorStatusSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "./actions";

const idSchema = z.uuid();
const SIGN_IN = "Your session ended. Sign in again, then retry.";

async function loadEvent(eventId: string) {
  const { supabase, user } = await getSessionClient();
  if (!user || !idSchema.safeParse(eventId).success) return null;
  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
  if (!event) return null;
  const kind = eventKindSchema.catch("other").parse(event.kind);
  const ctx = {
    title: event.title, kind, event_date: event.event_date, guest_count: event.guest_count,
    budget_total: Number(event.budget_total), outdoor: event.outdoor, brief: event.brief,
  };
  return { supabase, user, event, ctx };
}

export async function rerunPreMortemAction(eventId: string): Promise<ActionResult<null>> {
  const loaded = await loadEvent(eventId);
  if (!loaded) return { success: false, error: SIGN_IN };
  const { supabase, user, ctx } = loaded;

  const res = await runPreMortem(ctx, quotaCheck(supabase));
  await supabase.from("risks").delete().eq("event_id", eventId);
  const { error } = await supabase
    .from("risks")
    .insert(res.data.risks.map((r) => ({ ...r, event_id: eventId, owner_id: user.id })));
  if (error) return { success: false, error: "Could not save the new risks. Try again." };

  revalidatePath(`/events/${eventId}`);
  return { success: true, data: null, source: res.source };
}

export async function rerunGuestPanelAction(eventId: string): Promise<ActionResult<null>> {
  const loaded = await loadEvent(eventId);
  if (!loaded) return { success: false, error: SIGN_IN };
  const { supabase, event, ctx } = loaded;

  const res = await runGuestPanel(ctx, quotaCheck(supabase));
  const plan = event.plan && typeof event.plan === "object" && !Array.isArray(event.plan) ? event.plan : {};
  const { error } = await supabase.from("events").update({ plan: { ...plan, guest_panel: res.data } }).eq("id", eventId);
  if (error) return { success: false, error: "Could not save the guest feedback. Try again." };

  revalidatePath(`/events/${eventId}`);
  return { success: true, data: null, source: res.source };
}

const explainInput = z.object({
  scenarioId: scenarioIdSchema,
  changes: z.array(z.string().max(300)).max(30),
});

/** The scenario itself is computed by deterministic code on the client; the AI only explains it. */
export async function explainScenarioAction(scenarioId: string, changes: string[]): Promise<ActionResult<AiScenarioExplain>> {
  const parsed = explainInput.safeParse({ scenarioId, changes });
  if (!parsed.success) return { success: false, error: "Unknown scenario." };
  const { supabase, user } = await getSessionClient();
  if (!user) return { success: false, error: SIGN_IN };

  const res = await explainScenario(parsed.data.scenarioId, parsed.data.changes, quotaCheck(supabase));
  return { success: true, data: res.data, source: res.source };
}

const vendorPatch = z
  .object({
    status: vendorStatusSchema,
    quote: z.number().min(0).max(1_000_000_000).nullable(),
    deadline: z.iso.date().nullable(),
  })
  .partial();

export async function updateVendorAction(vendorId: string, patch: unknown): Promise<ActionResult<null>> {
  const parsed = vendorPatch.safeParse(patch);
  if (!idSchema.safeParse(vendorId).success || !parsed.success) {
    return { success: false, error: "That value was not valid. Check it and try again." };
  }
  const { supabase, user } = await getSessionClient();
  if (!user) return { success: false, error: SIGN_IN };

  const { error } = await supabase.from("vendors").update(parsed.data).eq("id", vendorId);
  return error ? { success: false, error: "Could not save the vendor. Try again." } : { success: true, data: null };
}

export async function setTaskDoneAction(taskId: string, done: boolean): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(taskId).success || typeof done !== "boolean") {
    return { success: false, error: "Unknown task." };
  }
  const { supabase, user } = await getSessionClient();
  if (!user) return { success: false, error: SIGN_IN };

  const { error } = await supabase.from("tasks").update({ done }).eq("id", taskId);
  return error ? { success: false, error: "Could not save the task. Try again." } : { success: true, data: null };
}
