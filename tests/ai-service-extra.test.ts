import { describe, it, expect, vi, beforeEach } from "vitest";
import { runPreMortem, runGuestPanel, explainScenario } from "@/lib/ai/service";
import * as clientModule from "@/lib/ai/client";

vi.mock("@/lib/ai/client", () => ({
  callGeminiJson: vi.fn(),
}));

describe("AI Service Extra Success Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AI_MODE;
    process.env.GEMINI_API_KEY = "test-key";
  });

  const ctx = {
    title: "Fest",
    kind: "community",
    event_date: "2027-09-01",
    guest_count: 50,
    budget_total: 5000,
    outdoor: true,
    brief: "Fest brief",
  };

  it("successfully parses AI response in runPreMortem", async () => {
    vi.mocked(clientModule.callGeminiJson).mockResolvedValueOnce({
      risks: [
        { title: "R1", likelihood: 1, impact: 1, plan_b: "P1" },
        { title: "R2", likelihood: 2, impact: 2, plan_b: "P2" },
        { title: "R3", likelihood: 3, impact: 3, plan_b: "P3" },
        { title: "R4", likelihood: 4, impact: 4, plan_b: "P4" },
        { title: "R5", likelihood: 5, impact: 5, plan_b: "P5" },
      ],
    });

    const res = await runPreMortem(ctx);
    expect(res.source).toBe("ai");
    expect(res.data.risks).toHaveLength(5);
  });

  it("successfully parses AI response in runGuestPanel", async () => {
    vi.mocked(clientModule.callGeminiJson).mockResolvedValueOnce({
      personas: [
        { name: "P1", role: "R1", concern: "C1", suggestion: "S1", plan_part: "food" },
        { name: "P2", role: "R2", concern: "C2", suggestion: "S2", plan_part: "timeline" },
        { name: "P3", role: "R3", concern: "C3", suggestion: "S3", plan_part: "budget" },
        { name: "P4", role: "R4", concern: "C4", suggestion: "S4", plan_part: "venue" },
      ],
      accessibility_checks: [{ item: "Ramp", status: "ok", note: "Good" }],
    });

    const res = await runGuestPanel(ctx);
    expect(res.source).toBe("ai");
    expect(res.data.personas).toHaveLength(4);
  });

  it("successfully parses AI response in explainScenario", async () => {
    vi.mocked(clientModule.callGeminiJson).mockResolvedValueOnce({
      headline: "Rain Alert",
      changes_summary: ["Tent ready"],
      advice: "Stay dry",
    });

    const res = await explainScenario("rain", ["Tent added"]);
    expect(res.source).toBe("ai");
    expect(res.data.headline).toBe("Rain Alert");
  });
});
