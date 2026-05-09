import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export interface ExtractedSleepData {
  sleepDuration: number;
  sleepQuality: number;
  remSleep: number;
  deepSleep: number;
  lightSleep: number;
  rhr: number;
}

export async function extractSleepFromImage(base64Data: string, mimeType: string): Promise<ExtractedSleepData | null> {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const prompt = `
    Extract sleep metrics from this image (likely a screenshot from a health app like Oura, Whoop, or Apple Health).
    Provide the following fields:
    - sleepDuration: Total sleep time in hours (number)
    - sleepQuality: A score from 1 to 10. If the app uses percentage (e.g. 85%), convert to 1-10 scale (e.g. 8.5).
    - remSleep: REM sleep duration in hours (number)
    - deepSleep: Deep sleep duration in hours (number)
    - lightSleep: Light sleep duration in hours (number)
    - rhr: Resting Heart Rate (Resting HR) in bpm (number)

    Ensure all time values are in hours (decimal format).
  `;

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sleepDuration: { type: Type.NUMBER },
            sleepQuality: { type: Type.NUMBER },
            remSleep: { type: Type.NUMBER },
            deepSleep: { type: Type.NUMBER },
            lightSleep: { type: Type.NUMBER },
            rhr: { type: Type.NUMBER }
          },
          required: ["sleepDuration", "sleepQuality", "remSleep", "deepSleep", "lightSleep", "rhr"]
        }
      }
    });

    const resultStr = response.text;
    if (!resultStr) return null;
    
    return JSON.parse(resultStr);
  } catch (error) {
    console.error("Sleep extraction failed:", error);
    throw error;
  }
}
