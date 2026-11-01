"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventInputSchema, type ScenarioId } from "@/lib/validation/schemas";
import { generatePlan, runPreMortem, runGuestPanel, explainScenario } from "@/lib/ai/service";
import { scheduleBackward } from "@/lib/timeline/schedule";
import { applyScenario, type RehearsalEventState } from "@/lib/scenarios/apply";
import { createShareToken } from "@/lib/share/token";
import type { Database } from "@/lib/supabase/database.types";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: "ai" | "fallback";
}

export async function createEvent(rawInput: unknown): Promise<ActionResult<{ eventId: string }>> {
  const parsed = eventInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid event input." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    return { success: false, error: "Authentication required to create a production." };
  }

  const eventInput = parsed.data;

  // AI Plan generation with quota check
  const planResult = await generatePlan(eventInput, async () => {
    const { data } = await supabase.rpc("consume_ai_quota", { p_max: 20 });
    return !!data;
  });

  const plan = planResult.data;

  // Insert event
  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .insert({
      owner_id: userId,
      title: eventInput.title,
      kind: eventInput.kind,
      event_date: eventInput.event_date,
      guest_count: eventInput.guest_count,
      budget_total: eventInput.budget_total,
      outdoor: eventInput.outdoor,
      brief: eventInput.brief,
      plan: {
        summary: plan.summary,
        ideas: plan.ideas,
        ai_source: planResult.source,
      },
    })
    .select("id")
    .single();

  if (eventErr || !eventRow) {
    return { success: false, error: eventErr?.message || "Failed to create event." };
  }

  const eventId = eventRow.id;

  // Map and resolve tasks
  const titleToIdMap = new Map<string, string>();
  const taskRowsToInsert: Array<Database["public"]["Tables"]["tasks"]["Insert"]> = [];

  for (const t of plan.tasks) {
    const taskId = crypto.randomUUID();
    titleToIdMap.set(t.title.trim().toLowerCase(), taskId);
  }

  const rawTasksForScheduler = plan.tasks.map((t) => {
    const id = titleToIdMap.get(t.title.trim().toLowerCase())!;
    const deps = (t.depends_on_titles || [])
      .map((title) => titleToIdMap.get(title.trim().toLowerCase()))
      .filter((depId): depId is string => Boolean(depId));

    return {
      id,
      title: t.title,
      duration_days: t.duration_days,
      depends_on: deps,
    };
  });

  // Backward schedule calculation
  const scheduledTasks = scheduleBackward(rawTasksForScheduler, eventInput.event_date);

  for (const st of scheduledTasks) {
    taskRowsToInsert.push({
      id: st.id,
      event_id: eventId,
      owner_id: userId,
      title: st.title,
      duration_days: st.duration_days,
      depends_on: st.depends_on,
      due_date: st.due_date,
      done: false,
    });
  }

  if (taskRowsToInsert.length > 0) {
    await supabase.from("tasks").insert(taskRowsToInsert);
  }

  // Insert budget items
  const budgetRows: Array<Database["public"]["Tables"]["budget_items"]["Insert"]> =
    plan.budget_items.map((b) => ({
      event_id: eventId,
      owner_id: userId,
      name: b.name,
      min_cost: b.min,
      likely_cost: b.likely,
      max_cost: b.max,
      scales_with_guests: b.scales_with_guests,
    }));

  if (budgetRows.length > 0) {
    await supabase.from("budget_items").insert(budgetRows);
  }

  // Insert vendors
  const vendorRows: Array<Database["public"]["Tables"]["vendors"]["Insert"]> = plan.vendors.map(
    (v) => ({
      event_id: eventId,
      owner_id: userId,
      category: v.category,
      name: v.tip ? `Note: ${v.tip}` : "",
      status: "to_call",
      quote: null,
      deadline: null,
    })
  );

  if (vendorRows.length > 0) {
    await supabase.from("vendors").insert(vendorRows);
  }

  revalidatePath("/dashboard");
  return { success: true, data: { eventId }, source: planResult.source };
}

export async function createEventAction(formData: FormData): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const rawInput = {
    title: formData.get("title"),
    kind: formData.get("kind"),
    event_date: formData.get("event_date"),
    guest_count: Number(formData.get("guest_count")),
    budget_total: Number(formData.get("budget_total") || formData.get("target_budget")),
    outdoor: formData.get("outdoor") === "on" || formData.get("is_outdoor") === "on",
    brief: formData.get("brief"),
  };
  const res = await createEvent(rawInput);
  if (!res.success) {
    return { success: false, error: res.error };
  }
  return { success: true, eventId: res.data?.eventId };
}

export async function runPreMortemAction(eventId: string): Promise<ActionResult<unknown>> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: "Unauthorized" };

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
  if (!event) return { success: false, error: "Event not found" };

  const res = await runPreMortem(
    {
      title: event.title,
      kind: event.kind,
      event_date: event.event_date,
      guest_count: event.guest_count,
      budget_total: Number(event.budget_total),
      outdoor: event.outdoor,
      brief: event.brief,
    },
    async () => {
      const { data } = await supabase.rpc("consume_ai_quota", { p_max: 20 });
      return !!data;
    }
  );

  // Insert 5 risks
  const riskRows = res.data.risks.map((r) => ({
    event_id: eventId,
    owner_id: userData.user.id,
    title: r.title,
    likelihood: r.likelihood,
    impact: r.impact,
    plan_b: r.plan_b,
  }));

  await supabase.from("risks").delete().eq("event_id", eventId);
  await supabase.from("risks").insert(riskRows);

  revalidatePath(`/events/${eventId}`);
  return { success: true, data: res.data.risks, source: res.source };
}

export async function runGuestPanelAction(eventId: string): Promise<ActionResult<unknown>> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: "Unauthorized" };

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
  if (!event) return { success: false, error: "Event not found" };

  const res = await runGuestPanel(
    {
      title: event.title,
      kind: event.kind,
      event_date: event.event_date,
      guest_count: event.guest_count,
      budget_total: Number(event.budget_total),
      outdoor: event.outdoor,
      brief: event.brief,
    },
    async () => {
      const { data } = await supabase.rpc("consume_ai_quota", { p_max: 20 });
      return !!data;
    }
  );

  const existingPlan = (event.plan as Record<string, unknown>) || {};
  await supabase
    .from("events")
    .update({ plan: { ...existingPlan, guest_panel: res.data } })
    .eq("id", eventId);

  revalidatePath(`/events/${eventId}`);
  return { success: true, data: res.data, source: res.source };
}

export async function applyScenarioAction(
  eventId: string,
  scenarioId: ScenarioId,
  currentState: RehearsalEventState
): Promise<ActionResult<unknown>> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: "Unauthorized" };

  const transformResult = applyScenario(currentState, scenarioId);
  const explainResult = await explainScenario(scenarioId, transformResult.changes, async () => {
    const { data } = await supabase.rpc("consume_ai_quota", { p_max: 20 });
    return !!data;
  });

  return {
    success: true,
    data: {
      nextState: transformResult.nextState,
      changes: transformResult.changes,
      explanation: explainResult.data,
    },
    source: explainResult.source,
  };
}

export async function createShareLinkAction(
  eventId: string,
  _expiresInDays = 7
): Promise<ActionResult<{ token: string }> & { token?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: "Unauthorized" };

  const token = createShareToken();
  const expiresAt = new Date(Date.now() + _expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("share_links").insert({
    token,
    event_id: eventId,
    owner_id: userData.user.id,
    expires_at: expiresAt,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, data: { token }, token };
}

export async function deleteEventAction(eventId: string): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", userData.user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard");
  return { success: true, data: null };
}
