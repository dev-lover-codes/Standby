import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  },
}));

describe("AI Client (Gemini API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-gemini-key";
  });

  it("returns null if GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    const { callGeminiJson } = await import("@/lib/ai/client");
    const res = await callGeminiJson("test prompt");
    expect(res).toBeNull();
  });

  it("calls Gemini API and parses JSON on success", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ message: "Success" }),
    });

    const { callGeminiJson } = await import("@/lib/ai/client");
    const res = await callGeminiJson<{ message: string }>("hello");
    expect(res).toEqual({ message: "Success" });
  });

  it("retries once upon failure and returns parsed JSON if retry succeeds", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    mockGenerateContent
      .mockRejectedValueOnce(new Error("Network hiccup"))
      .mockResolvedValueOnce({
        text: JSON.stringify({ message: "Recovered" }),
      });

    const { callGeminiJson } = await import("@/lib/ai/client");
    const res = await callGeminiJson<{ message: string }>("retry test");
    expect(res).toEqual({ message: "Recovered" });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("returns null if both attempts fail", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    mockGenerateContent
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"));

    const { callGeminiJson } = await import("@/lib/ai/client");
    const res = await callGeminiJson("fail test");
    expect(res).toBeNull();
  });
});
