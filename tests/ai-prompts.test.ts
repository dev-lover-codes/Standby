import { describe, it, expect } from "vitest";
import {
  buildPlanPrompt,
  buildPreMortemPrompt,
  buildGuestPanelPrompt,
  buildScenarioExplainPrompt,
  type PromptContext,
} from "@/lib/ai/prompts";
import { getFallbackPlan } from "@/lib/ai/fallback";

describe("AI Prompts & Fallbacks Coverage", () => {
  const ctx: PromptContext = {
    title: "Gala Event",
    kind: "wedding",
    event_date: "2027-08-01",
    guest_count: 80,
    budget_total: 20000,
    outdoor: false,
    brief: "A grand wedding rehearsal.",
  };

  it("builds all prompt variants correctly", () => {
    const planPrompt = buildPlanPrompt(ctx);
    expect(planPrompt).toContain("<brief>");

    const preMortemPrompt = buildPreMortemPrompt(ctx);
    expect(preMortemPrompt).toContain("Pre-Mortem");

    const guestPanelPrompt = buildGuestPanelPrompt(ctx);
    expect(guestPanelPrompt).toContain("Guest Focus Panel");

    const explainPrompt = buildScenarioExplainPrompt("rain", ["Switched to tent"]);
    expect(explainPrompt).toContain("Trigger: rain");
  });

  it("generates fallback plans for wedding, birthday, and other", () => {
    const weddingPlan = getFallbackPlan({ ...ctx, kind: "wedding" });
    expect(weddingPlan.tasks.length).toBeGreaterThanOrEqual(6);

    const bdayPlan = getFallbackPlan({ ...ctx, kind: "birthday" });
    expect(bdayPlan.tasks.length).toBeGreaterThanOrEqual(6);

    const otherPlan = getFallbackPlan({ ...ctx, kind: "other" });
    expect(otherPlan.tasks.length).toBeGreaterThanOrEqual(6);
  });
});
