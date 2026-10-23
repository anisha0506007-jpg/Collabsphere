
import { GoogleGenAI } from "@google/genai";

export const generateAIResponse = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Check server/.env"
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const model =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction:
        "You are CollabSphere's developer assistant. " +
        "Explain programming concepts clearly for beginners. " +
        "When explaining code, describe what it does and why. " +
        "Do not claim code has been executed or tested unless it has.",
      maxOutputTokens: 1500,
    },
  });

  const answer = response.text;

  if (!answer) {
    throw new Error("Gemini returned an empty response");
  }

  return answer;
};
