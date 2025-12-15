'use server'

import { GoogleGenAI } from "@google/genai";
import { createClient } from '@/utils/supabase/server';
import { SaveData } from '@/types';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function generateContentServer(model: string, prompt: string, config?: any) {
  if (!apiKey) throw new Error("API Key missing on server");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized: Please log in.");

  const { error: creditError } = await supabase.rpc('deduct_credit', { 
    user_uuid: user.id, 
    amount: 1 
  });

  if (creditError) throw new Error("Insufficient credits or database error.");
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: config
    });
    // Return necessary parts for client handling (text for stories, candidates for images)
    return {
      text: response.text,
      candidates: response.candidates
    };
  } catch (error: any) {
    console.error("Server AI Error:", error);
    throw new Error(error.message || "AI Generation failed");
  }
}

export async function saveGame(saveData: SaveData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('saves')
    .upsert({ 
      user_id: user.id, 
      game_state: saveData,
      updated_at: new Date().toISOString()
    });

  if (error) throw new Error("Failed to save game: " + error.message);
}

export async function loadLatestSave() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('saves')
    .select('game_state')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error("Failed to load save: " + error.message);
  return data?.game_state as SaveData;
}
