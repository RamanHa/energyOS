import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

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

export async function getHealthInsights(logs: LogEntry[]) {
  const model = "gemini-3-flash-preview";
  
  const logSummary = logs.map(log => ({
    type: log.type,
    time: new Date(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString(),
    details: log.data
  }));

  const prompt = `
    As a specialized Bio-hacking AI coach, analyze the following biological logs and provide 3-5 high-impact, actionable insights.
    Focus on correlation between food, habits, and energy/focus output.
    
    Logs:
    ${JSON.stringify(logSummary, null, 2)}
    
    Format your response as a JSON array of objects with "title", "insight", and "category" (e.g., Metabolic, Neurochemical, Sleep).
  `;

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return [];
  }
}

export async function getImmediateLogFeedback(log: LogEntry) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this single biological log entry and provide immediate feedback or a optimization tip.
    Log Type: ${log.type}
    Data: ${JSON.stringify(log.data)}
    
    Keep it very concise (max 30 words).
    Format: A single sentence of biological optimization advice.
  `;

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Feedback Error:", error);
    return "Log logged to biological state. Continue protocol.";
  }
}
