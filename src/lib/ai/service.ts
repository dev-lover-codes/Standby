import { callGeminiJson } from "./client";
import {
  aiPlanSchema,
  aiPreMortemSchema,
  aiGuestPanelSchema,
  aiScenarioExplainSchema,
  type AiPlan,
  type AiPreMortem,
  type AiGuestPanel,
  type AiScenarioExplain,
} from "./schemas";
import {
  buildPlanPrompt,
  buildPreMortemPrompt,
  buildGuestPanelPrompt,
  buildScenarioExplainPrompt,
  type PromptContext,
} from "./prompts";
import {
  getFallbackPlan,
  getFallbackPreMortem,
  getFallbackGuestPanel,
  getFallbackScenarioExplain,
} from "./fallback";

export interface AiServiceResult<T> {
  data: T;
  source: "ai" | "fallback";
}

async function canUseAi(checkQuotaFn?: () => Promise<boolean>): Promise<boolean> {
  if (process.env.AI_MODE === "mock") {
    return false;
  }
  if (!process.env.GEMINI_API_KEY) {
    return false;
  }
  if (checkQuotaFn) {
    try {
      const allowed = await checkQuotaFn();
      if (!allowed) return false;
    } catch {
      // If quota check fails due to network, safely fallback
      return false;
    }
  }
  return true;
}

export async function generatePlan(
  ctx: PromptContext,
  checkQuotaFn?: () => Promise<boolean>
): Promise<AiServiceResult<AiPlan>> {
  const fallback = getFallbackPlan(ctx);

  if (!(await canUseAi(checkQuotaFn))) {
    return { data: fallback, source: "fallback" };
  }

  try {
    const prompt = buildPlanPrompt(ctx);
    const raw = await callGeminiJson<unknown>(prompt);
    if (!raw) {
      return { data: fallback, source: "fallback" };
    }

    const parsed = aiPlanSchema.safeParse(raw);
    if (parsed.success) {
      return { data: parsed.data, source: "ai" };
    }
  } catch {
    // Suppress raw provider errors
  }

  return { data: fallback, source: "fallback" };
}

export async function runPreMortem(
  ctx: PromptContext,
  checkQuotaFn?: () => Promise<boolean>
): Promise<AiServiceResult<AiPreMortem>> {
  const fallback = getFallbackPreMortem();

  if (!(await canUseAi(checkQuotaFn))) {
    return { data: fallback, source: "fallback" };
  }

  try {
    const prompt = buildPreMortemPrompt(ctx);
    const raw = await callGeminiJson<unknown>(prompt);
    if (!raw) {
      return { data: fallback, source: "fallback" };
    }

    const parsed = aiPreMortemSchema.safeParse(raw);
    if (parsed.success) {
      return { data: parsed.data, source: "ai" };
    }
  } catch {
    // Suppress raw provider errors
  }

  return { data: fallback, source: "fallback" };
}

export async function runGuestPanel(
  ctx: PromptContext,
  checkQuotaFn?: () => Promise<boolean>
): Promise<AiServiceResult<AiGuestPanel>> {
  const fallback = getFallbackGuestPanel();

  if (!(await canUseAi(checkQuotaFn))) {
    return { data: fallback, source: "fallback" };
  }

  try {
    const prompt = buildGuestPanelPrompt(ctx);
    const raw = await callGeminiJson<unknown>(prompt);
    if (!raw) {
      return { data: fallback, source: "fallback" };
    }

    const parsed = aiGuestPanelSchema.safeParse(raw);
    if (parsed.success) {
      return { data: parsed.data, source: "ai" };
    }
  } catch {
    // Suppress raw provider errors
  }

  return { data: fallback, source: "fallback" };
}

export async function explainScenario(
  scenarioId: string,
  changes: string[],
  checkQuotaFn?: () => Promise<boolean>
): Promise<AiServiceResult<AiScenarioExplain>> {
  const fallback = getFallbackScenarioExplain(scenarioId, changes);

  if (!(await canUseAi(checkQuotaFn))) {
    return { data: fallback, source: "fallback" };
  }

  try {
    const prompt = buildScenarioExplainPrompt(scenarioId, changes);
    const raw = await callGeminiJson<unknown>(prompt);
    if (!raw) {
      return { data: fallback, source: "fallback" };
    }

    const parsed = aiScenarioExplainSchema.safeParse(raw);
    if (parsed.success) {
      return { data: parsed.data, source: "ai" };
    }
  } catch {
    // Suppress raw provider errors
  }

  return { data: fallback, source: "fallback" };
}
