"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionClient, quotaCheck } from "@/lib/supabase/session";
import { eventInputSchema, type EventInput } from "@/lib/validation/schemas";
import { generatePlan, runPreMortem, runGuestPanel } from "@/lib/ai/service";
import type { AiPlan } from "@/lib/ai/schemas";
import { safeSchedule } from "@/lib/timeline/safe-schedule";
import { createShareToken } from "@/lib/share/token";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: "ai" | "fallback";
}

const idSchema = z.uuid();

function buildTaskRows(plan: AiPlan, eventId: string, ownerId: string, eventDate: string) {
  const ids = new Map(plan.tasks.map((t) => [t.title.trim().toLowerCase(), crypto.randomUUID()]));
  const input = plan.tasks.map((t) => ({
    id: ids.get(t.title.trim().toLowerCase()) ?? crypto.randomUUID(),
    title: t.title,
    duration_days: t.duration_days,
    depends_on: t.depends_on_titles
      .map((title) => ids.get(title.trim().toLowerCase()))
      .filter((id): id is string => Boolean(id)),
    done: false,
  }));
  const scheduled = safeSchedule(input, eventDate);
  return scheduled.map((t) => ({
    id: t.id, event_id: eventId, owner_id: ownerId, title: t.title,
    duration_days: t.duration_days, depends_on: t.depends_on, due_date: t.due_date, done: false,
  }));
}

export async function createEvent(rawInput: unknown): Promise<ActionResult<{ eventId: string }>> {
  const parsed = eventInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Check the form and try again." };
  }
  const { supabase, user } = await getSessionClient();
  if (!user) return { success: false, error: "Your session ended. Sign in again, then retry." };

  const input: EventInput = parsed.data;
  const check = quotaCheck(supabase);
  const [planRes, riskRes, panelRes] = await Promise.all([
    generatePlan(input, check),
    runPreMortem(input, check),
    runGuestPanel(input, check),
  ]);
  const plan = planRes.data;

  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .insert({
      owner_id: user.id, title: input.title, kind: input.kind, event_date: input.event_date,
      guest_count: input.guest_count, budget_total: input.budget_total, outdoor: input.outdoor, brief: input.brief,
      plan: { summary: plan.summary, ideas: plan.ideas, guest_panel: panelRes.data, ai_source: planRes.source },
    })
    .select("id")
    .single();
  if (eventErr || !eventRow) {
    return { success: false, error: "Could not save the event. Check that the database is set up, then try again." };
  }

  const eventId = eventRow.id;
  const owned = { event_id: eventId, owner_id: user.id };
  const results = await Promise.all([
    supabase.from("tasks").insert(buildTaskRows(plan, eventId, user.id, input.event_date)),
    supabase.from("budget_items").insert(plan.budget_items.map((b) => ({
      ...owned, name: b.name, min_cost: b.min, likely_cost: b.likely, max_cost: b.max, scales_with_guests: b.scales_with_guests,
    }))),
    supabase.from("vendors").insert(plan.vendors.map((v) => ({ ...owned, category: v.category, name: v.tip, status: "to_call" as const }))),
    supabase.from("risks").insert(riskRes.data.risks.map((r) => ({ ...owned, ...r }))),
  ]);
  if (results.some((r) => r.error)) {
    return { success: false, error: "The event was saved, but some sections failed. Open it and use Run again." };
  }

  revalidatePath("/dashboard");
  return { success: true, data: { eventId }, source: planRes.source };
}

export async function createEventAction(formData: FormData): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const res = await createEvent({
    title: formData.get("title"),
    kind: formData.get("kind"),
    event_date: formData.get("event_date"),
    guest_count: Number(formData.get("guest_count")),
    budget_total: Number(formData.get("budget_total")),
    outdoor: formData.get("outdoor") === "on",
    brief: formData.get("brief"),
  });
  return res.success ? { success: true, eventId: res.data?.eventId } : { success: false, error: res.error };
}

export async function createShareLinkAction(eventId: string, expiresInDays = 7): Promise<ActionResult<{ token: string }>> {
  if (!idSchema.safeParse(eventId).success) return { success: false, error: "Unknown event." };
  const days = z.number().int().min(1).max(30).catch(7).parse(expiresInDays);
  const { supabase, user } = await getSessionClient();
  if (!user) return { success: false, error: "Sign in to share." };

  const token = createShareToken();
  const expires_at = new Date(Date.now() + days * 86_400_000).toISOString();
  const { error } = await supabase.from("share_links").insert({ token, event_id: eventId, owner_id: user.id, expires_at });
  if (error) return { success: false, error: "Could not create a share link. Try again." };
  return { success: true, data: { token } };
}

export async function deleteEventAction(eventId: string): Promise<ActionResult<null>> {
  if (!idSchema.safeParse(eventId).success) return { success: false, error: "Unknown event." };
  const { supabase, user } = await getSessionClient();
  if (!user) return { success: false, error: "Sign in to delete." };

  const { error } = await supabase.from("events").delete().eq("id", eventId).eq("owner_id", user.id);
  if (error) return { success: false, error: "Could not delete the event. Try again." };
  revalidatePath("/dashboard");
  return { success: true, data: null };
}
