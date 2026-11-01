import { z } from "zod";
import { aiGuestPanelSchema, aiPlanSchema, type AiGuestPanel } from "./ai/schemas";
import { getFallbackGuestPanel, getFallbackPlan, getFallbackPreMortem } from "./ai/fallback";
import type { RehearsalEventState } from "./scenarios/apply";
import type { EventKind, VendorStatus } from "./validation/schemas";

export interface EventRow {
  id: string;
  title: string;
  kind: string;
  event_date: string;
  guest_count: number;
  budget_total: number | string;
  outdoor?: boolean;
  brief: string;
  plan?: unknown;
}
export interface TaskRow { id: string; title: string; duration_days: number; depends_on: string[] | null; done?: boolean }
export interface RiskRow { id: string; title: string; likelihood: number; impact: number; plan_b: string }
export interface VendorRow { id: string; category: string; name: string; status: string; quote: number | string | null; deadline?: string | null }
export interface BudgetRow { id?: string; name: string; min_cost: number | string; likely_cost: number | string; max_cost: number | string; scales_with_guests?: boolean }

export interface Persona { persona: string; feedback: string; concernArea: string }
export interface AccessCheck { check: string; status: "pass" | "needs_attention"; detail: string }
export interface Idea { title: string; description: string }

export interface EventView {
  state: RehearsalEventState;
  personas: Persona[];
  accessibilityChecks: AccessCheck[];
  ideas: Idea[];
  /** True when a section shows template content because nothing is saved yet. */
  isTemplate: { risks: boolean; guestPanel: boolean };
}

const storedPlanSchema = z.object({
  ideas: aiPlanSchema.shape.ideas.optional().catch(undefined),
  guest_panel: aiGuestPanelSchema.optional().catch(undefined),
});

const KINDS: EventKind[] = ["wedding", "birthday", "community", "other"];
const STATUSES: VendorStatus[] = ["to_call", "quoted", "booked", "confirmed"];

function toPersonas(panel: AiGuestPanel): Pick<EventView, "personas" | "accessibilityChecks"> {
  return {
    personas: panel.personas.map((p) => ({
      persona: p.role,
      feedback: `${p.concern} Suggestion: ${p.suggestion}`,
      concernArea: p.plan_part,
    })),
    accessibilityChecks: panel.accessibility_checks.map((c) => ({
      check: c.item,
      status: c.status === "ok" ? "pass" : "needs_attention",
      detail: c.note,
    })),
  };
}

/** Pure: builds everything the event and share pages render from database rows. */
export function buildEventView(
  event: EventRow,
  rows: { tasks: TaskRow[]; risks: RiskRow[]; vendors: VendorRow[]; budget: BudgetRow[] }
): EventView {
  const kind = KINDS.includes(event.kind as EventKind) ? (event.kind as EventKind) : "other";
  const ctx = {
    title: event.title, kind, event_date: event.event_date, guest_count: event.guest_count,
    budget_total: Number(event.budget_total), outdoor: Boolean(event.outdoor), brief: event.brief,
  };
  const fallback = getFallbackPlan(ctx);
  const stored = storedPlanSchema.safeParse(event.plan ?? {});
  const saved = stored.success ? stored.data : {};

  const tasks = rows.tasks.length
    ? rows.tasks.map((t) => ({ id: t.id, title: t.title, duration_days: t.duration_days, depends_on: t.depends_on ?? [], done: Boolean(t.done) }))
    : fallback.tasks.map((t, i) => ({ id: `template-task-${i}`, title: t.title, duration_days: t.duration_days, depends_on: [], done: false }));

  const risks = rows.risks.length
    ? rows.risks.map((r) => ({ id: r.id, title: r.title, plan_b: r.plan_b, likelihood: r.likelihood, impact: r.impact }))
    : getFallbackPreMortem().risks.map((r, i) => ({ id: `template-risk-${i}`, ...r }));

  const vendors = rows.vendors.length
    ? rows.vendors.map((v) => ({
        id: v.id, category: v.category, name: v.name,
        status: STATUSES.includes(v.status as VendorStatus) ? (v.status as VendorStatus) : "to_call",
        quote: v.quote === null ? null : Number(v.quote), deadline: v.deadline ?? null,
      }))
    : fallback.vendors.map((v, i) => ({ id: `template-vendor-${i}`, category: v.category, name: v.tip, status: "to_call" as const, quote: null, deadline: null }));

  const budget_items = rows.budget.length
    ? rows.budget.map((b) => ({ id: b.id, name: b.name, min_cost: Number(b.min_cost), likely_cost: Number(b.likely_cost), max_cost: Number(b.max_cost), scales_with_guests: Boolean(b.scales_with_guests) }))
    : fallback.budget_items.map((b) => ({ name: b.name, min_cost: b.min, likely_cost: b.likely, max_cost: b.max, scales_with_guests: b.scales_with_guests }));

  return {
    state: { event: { ...ctx, id: event.id, plan: event.plan }, tasks, risks, vendors, budget_items },
    ...toPersonas(saved.guest_panel ?? getFallbackGuestPanel()),
    ideas: (saved.ideas ?? fallback.ideas).map((i) => ({ title: i.title, description: i.why })),
    isTemplate: { risks: rows.risks.length === 0, guestPanel: !saved.guest_panel },
  };
}
