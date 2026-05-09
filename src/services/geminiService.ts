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

export async function getHealthInsights(logs: LogEntry[], profile?: any) {
  const model = "gemini-3-flash-preview";
  
  const logSummary = logs.map(log => ({
    type: log.type,
    time: new Date(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString(),
    details: log.data
  }));

  const goalsText = profile?.lifestyleGoals && profile.lifestyleGoals.length > 0 
    ? `User's Lifestyle Goals: ${profile.lifestyleGoals.join(", ")}` 
    : "No explicit lifestyle goals set.";

  const prompt = `
    As a proactive Bio-hacking AI coach, carefully monitor the user's recent biological logs against their specific lifestyle goals.
    
    ${goalsText}
    
    Logs:
    ${JSON.stringify(logSummary, null, 2)}
    
    Provide 3 high-impact, actionable coaching insights. If there are deviations from their goals or patterns (like low focus after certain meals, or poor sleep consistency), address them directly. Provide encouragement, ask targeted questions to provoke reflection, or suggest specific routines/interventions.
    
    Format your response as a JSON array of objects with:
    - "title": A short catchy title.
    - "insight": The coaching message, targeted question, or routine suggestion.
    - "category": e.g., "Sleep Coaching", "Metabolic Feedback", "Goal Alignment".
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

export async function parseSpokenLog(text: string, logType: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Extract structured data for a health logging app from the following spoken text.
    The text may be in any language (e.g., German, English), but you must understand it and extract the numeric values or tags accordingly.
    The current log category is: ${logType}.

    Return ONLY a JSON object. Do not include any explanation.

    If logType is "state", extract fields (if mentioned):
    - energy: number (1-10)
    - focus: number (1-5) (note: scale is 1 to 5)
    - sleepDuration: number (hours)
    - sleepQuality: number (1-10)
    - remSleep: number (hours)
    - deepSleep: number (hours)
    - lightSleep: number (hours)
    - rhr: number (resting heart rate in bpm)
    - moodTags: array of strings (choose from exactly these in English: Calm, Anxious, Stressed, Hangry, Energized)
    - gutTags: array of strings (choose from exactly these in English: Bloated, Light, Cramping, Optimal)

    If logType is "meal", extract fields (if mentioned):
    - timing: string (e.g., "fasting 16h")
    - notes: string (e.g., "chicken and rice")

    If logType is "event", extract fields (if mentioned):
    - stressor: string (what happened)
    - intensity: number (1-10)

    If a field is not quantitatively or clearly mentioned, do not guess, simply omit it or return null for that field. Include original text or relevant parts in "notes".
    
    Spoken text: "${text}"
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
    console.error("Gemini Parse Speech Error:", error);
    return {};
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
