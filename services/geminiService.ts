import { GoogleGenAI, Type } from "@google/genai";
import { AuthorWorkPair } from '../types';
import { FALLBACK_DATA } from '../constants';

// Initialize client safely
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

/**
 * Fetches unique author-work pairs suitable for High School curriculum in Turkey.
 */
export const fetchGameData = async (count: number = 8): Promise<AuthorWorkPair[]> => {
  if (!ai) {
    console.warn("Gemini API Key is missing. Using fallback data.");
    return getFallbackData(count);
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Prompt updated to request clues (emojis) and periods specifically
    const prompt = `Bana Türk Edebiyatı müfredatından (Lise seviyesi: Tanzimat, Servet-i Fünun, Milli Edebiyat, Cumhuriyet Dönemi) ${count} adet farklı yazar-eser çifti ver. 
    
    Kurallar:
    1. Bilinen ve önemli eserler olsun.
    2. "period" alanı şu 4 değerden biri olmalı: "Tanzimat", "Servet-i Fünun", "Milli Edebiyat", "Cumhuriyet".
    3. "clue" alanı, eseri anlatan 2-3 emoji veya 1-2 kelimelik ipucu içersin (Asla eserin adını içermesin). Örn: Çalıkuşu -> "🐦🎒Öğretmen"
    
    JSON formatında döndür.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING },
              work: { type: Type.STRING },
              period: { type: Type.STRING, description: "Sadece: Tanzimat, Servet-i Fünun, Milli Edebiyat, Cumhuriyet" },
              clue: { type: Type.STRING, description: "Eseri anlatan emoji veya kısa ipucu" }
            },
            required: ["author", "work", "period", "clue"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const data = JSON.parse(text) as AuthorWorkPair[];
    
    // Normalize periods just in case
    return data.map(item => ({
        ...item,
        period: normalizePeriod(item.period)
    }));

  } catch (error) {
    console.error("Failed to fetch data from Gemini:", error);
    return getFallbackData(count);
  }
};

const normalizePeriod = (p?: string) => {
    if (!p) return "Cumhuriyet";
    if (p.toLowerCase().includes("tanzimat")) return "Tanzimat";
    if (p.toLowerCase().includes("servet")) return "Servet-i Fünun";
    if (p.toLowerCase().includes("milli")) return "Milli Edebiyat";
    return "Cumhuriyet";
}

// Helper to get random subset of fallback data
const getFallbackData = (count: number): AuthorWorkPair[] => {
  const shuffled = [...FALLBACK_DATA].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(item => ({
      ...item,
      clue: "📚 Klasik Eser" // Fallback clue
  }));
};