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

export async function generateWeeklySynthesis(logs: LogEntry[]) {
  const model = "gemini-3-flash-preview";

  const logSummary = logs.map(log => ({
    type: log.type,
    time: new Date(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString(),
    details: log.data
  }));

  const prompt = `
    You are an advanced Bio-hacking AI coach (EnergyOS). You are generating a deep-dive, narrative weekly summary authored by you.
    Analyze these logs from the past week.
    Generate a JSON object with the following exact structure:
    {
      "summary": "A 2-3 sentence narrative describing the user's overall trajectory and physiological state this week.",
      "challenges": ["challenge 1", "challenge 2"],
      "wins": ["win 1", "win 2"],
      "moodVectors": ["Dominant mood trend 1", "Dominant mood trend 2"],
      "gamePlan": "A brief actionable protocol or strategy for the upcoming week based on this data."
    }

    Logs to analyze:
    ${JSON.stringify(logSummary, null, 2)}
  `;

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Synthesis Error:", error);
    return null;
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
