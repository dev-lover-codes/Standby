import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventViewClient } from "./EventViewClient";
import {
  getFallbackPlan,
  getFallbackPreMortem,
  getFallbackGuestPanel,
} from "@/lib/ai/fallback";
import type { RehearsalEventState } from "@/lib/scenarios/apply";
import type { Task, Vendor, Risk, BudgetItem } from "@/lib/validation/schemas";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch event record
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventErr || !event) {
    notFound();
  }

  // Fetch relational data
  const [tasksRes, risksRes, vendorsRes, budgetRes] = await Promise.all([
    supabase.from("tasks").select("*").eq("event_id", id),
    supabase.from("risks").select("*").eq("event_id", id),
    supabase.from("vendors").select("*").eq("event_id", id),
    supabase.from("budget_items").select("*").eq("event_id", id),
  ]);

  const promptCtx = {
    title: event.title,
    kind: event.kind as "wedding" | "birthday" | "community" | "other",
    event_date: event.event_date,
    guest_count: event.guest_count,
    budget_total: Number(event.budget_total),
    outdoor: event.outdoor,
    brief: event.brief,
  };

  const fallback = getFallbackPlan(promptCtx);
  const fallbackPreMortem = getFallbackPreMortem();
  const fallbackGuestPanel = getFallbackGuestPanel();

  const tasks: Task[] = (tasksRes.data && tasksRes.data.length > 0)
    ? tasksRes.data.map((t) => ({
        id: t.id,
        title: t.title,
        duration_days: t.duration_days,
        depends_on: t.depends_on || [],
        due_date: t.due_date,
        done: t.done,
      }))
    : fallback.tasks.map((t, idx) => ({
        id: `fb-task-${idx}`,
        title: t.title,
        duration_days: t.duration_days,
        depends_on: [],
        done: false,
      }));

  const risks: Risk[] = (risksRes.data && risksRes.data.length > 0)
    ? risksRes.data.map((r) => ({
        id: r.id,
        title: r.title,
        plan_b: r.plan_b,
        likelihood: r.likelihood,
        impact: r.impact,
      }))
    : fallbackPreMortem.risks.map((r, idx) => ({
        id: `fb-risk-${idx}`,
        title: r.title,
        plan_b: r.plan_b,
        likelihood: r.likelihood,
        impact: r.impact,
      }));

  const vendors: Vendor[] = (vendorsRes.data && vendorsRes.data.length > 0)
    ? vendorsRes.data.map((v) => ({
        id: v.id,
        category: v.category,
        name: v.name,
        status: v.status as "to_call" | "quoted" | "booked" | "confirmed",
        quote: v.quote ? Number(v.quote) : null,
        deadline: v.deadline,
      }))
    : fallback.vendors.map((v, idx) => ({
        id: `fb-vendor-${idx}`,
        category: v.category,
        name: v.tip || v.category,
        status: "to_call" as const,
        quote: null,
        deadline: null,
      }));

  const budgetItems: BudgetItem[] = (budgetRes.data && budgetRes.data.length > 0)
    ? budgetRes.data.map((b) => ({
        id: b.id,
        name: b.name,
        min_cost: Number(b.min_cost),
        likely_cost: Number(b.likely_cost),
        max_cost: Number(b.max_cost),
        scales_with_guests: b.scales_with_guests,
      }))
    : fallback.budget_items.map((b) => ({
        name: b.name,
        min_cost: b.min,
        likely_cost: b.likely,
        max_cost: b.max,
        scales_with_guests: b.scales_with_guests,
      }));

  const eventState: RehearsalEventState = {
    event: {
      id: event.id,
      title: event.title,
      kind: event.kind as "wedding" | "birthday" | "community" | "other",
      event_date: event.event_date,
      guest_count: event.guest_count,
      budget_total: Number(event.budget_total),
      outdoor: event.outdoor,
      brief: event.brief,
      plan: event.plan,
    },
    tasks,
    risks,
    vendors,
    budget_items: budgetItems,
  };

  const personas = fallbackGuestPanel.personas.map((p) => ({
    persona: p.role,
    feedback: p.concern,
    concernArea: p.plan_part,
  }));

  const accessibilityChecks = fallbackGuestPanel.accessibility_checks.map((c) => ({
    check: c.item,
    status: (c.status === "ok" ? "pass" : "needs_attention") as "pass" | "needs_attention" | "fail",
    detail: c.note,
  }));

  const ideas = fallback.ideas.map((idea) => ({
    category: "themes",
    title: idea.title,
    description: idea.why,
  }));

  return (
    <EventViewClient
      initialState={eventState}
      initialPersonas={personas}
      initialAccessibilityChecks={accessibilityChecks}
      initialIdeas={ideas}
    />
  );
}
