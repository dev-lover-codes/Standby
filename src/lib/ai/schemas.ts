import { z } from "zod";

export const aiPlanSchema = z.object({
  summary: z.string().min(10),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        duration_days: z.number().int().min(1).max(180),
        depends_on_titles: z.array(z.string()).default([]),
      })
    )
    .min(6)
    .max(14),
  budget_items: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        min: z.number().min(0),
        likely: z.number().min(0),
        max: z.number().min(0),
        scales_with_guests: z.boolean().default(false),
      })
    )
    .min(6)
    .max(12),
  vendors: z
    .array(
      z.object({
        category: z.string().min(1).max(100),
        tip: z.string().min(1).max(300),
      })
    )
    .min(4)
    .max(8),
  ideas: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        why: z.string().min(1).max(500),
      })
    )
    .min(5)
    .max(8),
});
export type AiPlan = z.infer<typeof aiPlanSchema>;

export const aiPreMortemSchema = z.object({
  risks: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        likelihood: z.number().int().min(1).max(5),
        impact: z.number().int().min(1).max(5),
        plan_b: z.string().min(1).max(500),
      })
    )
    .length(5),
});
export type AiPreMortem = z.infer<typeof aiPreMortemSchema>;

export const aiGuestPanelSchema = z.object({
  personas: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        concern: z.string().min(1),
        suggestion: z.string().min(1),
        plan_part: z.enum(["timeline", "budget", "vendors", "venue", "food"]),
      })
    )
    .length(4),
  accessibility_checks: z.array(
    z.object({
      item: z.string().min(1),
      status: z.enum(["ok", "fix"]),
      note: z.string().min(1),
    })
  ),
});
export type AiGuestPanel = z.infer<typeof aiGuestPanelSchema>;

export const aiScenarioExplainSchema = z.object({
  headline: z.string().min(1),
  changes_summary: z.array(z.string()),
  advice: z.string().min(1),
});
export type AiScenarioExplain = z.infer<typeof aiScenarioExplainSchema>;
