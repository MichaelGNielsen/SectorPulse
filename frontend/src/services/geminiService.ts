import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MarketEvent {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impactScore: number; // 0-100
  affectedAssets: string[];
  analysis: string;
  sourceUrl?: string;
}

export async function scanForMarketEvents(): Promise<MarketEvent[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the most recent (last 24-48 hours) influential social media posts or public statements from Donald Trump, Elon Musk, and other major market movers (like Jerome Powell or Vitalik Buterin). 
      Focus on statements that could impact stocks (e.g., TSLA, DJT, SPY) or crypto.
      Return a list of events with sentiment analysis and potential market impact.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              author: { type: "STRING" },
              content: { type: "STRING" },
              timestamp: { type: "STRING" },
              sentiment: { type: "STRING", enum: ["bullish", "bearish", "neutral"] },
              impactScore: { type: "NUMBER" },
              affectedAssets: { type: "ARRAY", items: { type: "STRING" } },
              analysis: { type: "STRING" },
              sourceUrl: { type: "STRING" }
            },
            required: ["id", "author", "content", "timestamp", "sentiment", "impactScore", "affectedAssets", "analysis"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error scanning for events:", error);
    return [];
  }
}
