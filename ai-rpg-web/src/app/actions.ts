'use server'

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function generateContentServer(model: string, prompt: string, config?: any) {
  if (!apiKey) throw new Error("API Key missing on server");
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: config
    });
    return response.text;
  } catch (error: any) {
    console.error("Server AI Error:", error);
    throw new Error(error.message || "AI Generation failed");
  }
}