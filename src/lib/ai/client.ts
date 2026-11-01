import "server-only";
import { GoogleGenAI } from "@google/genai";

const TIMEOUT_MS = 20_000;

export async function callGeminiJson<T>(prompt: string): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const executeCall = async (): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Gemini API call timed out after 20 seconds"));
      }, TIMEOUT_MS);
      timer.unref?.();
    });

    const callPromise = ai.models
      .generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
      .then((res) => {
        const text = res.text;
        if (!text) {
          throw new Error("Empty response text from Gemini API");
        }
        return JSON.parse(text) as T;
      });

    return Promise.race([callPromise, timeoutPromise]);
  };

  // First attempt
  try {
    return await executeCall();
  } catch {
    // Single retry
    try {
      return await executeCall();
    } catch {
      return null;
    }
  }
}
