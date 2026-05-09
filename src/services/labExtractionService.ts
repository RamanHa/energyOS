import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExtractedLabResult {
  marker: string;
  value: number;
  unit: string;
  date: string; // YYYY-MM-DD
}

export async function extractLabsFromImage(base64Data: string, mimeType: string): Promise<ExtractedLabResult[]> {
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const prompt = `
    Extract all laboratory markers and their corresponding values, units, and dates from the provided laboratory report image.
    Convert all dates to YYYY-MM-DD format.
    If a laboratory date is not found on the report, use today's date (${new Date().toISOString().split('T')[0]}).
    Focus on common biomarkers like Insulin, Vitamin D, HbA1c, hs-CRP, etc., but extract everything you can find.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              marker: { type: Type.STRING, description: "The name of the biomarker" },
              value: { type: Type.NUMBER, description: "The numerical value of the result" },
              unit: { type: Type.STRING, description: "The unit of measurement (e.g., ng/mL, uIU/mL)" },
              date: { type: Type.STRING, description: "The date of the lab test in YYYY-MM-DD format" }
            },
            required: ["marker", "value", "unit", "date"]
          }
        }
      }
    });

    const resultStr = response.text;
    if (!resultStr) return [];
    
    return JSON.parse(resultStr);
  } catch (error) {
    console.error("Lab extraction failed:", error);
    throw error;
  }
}
