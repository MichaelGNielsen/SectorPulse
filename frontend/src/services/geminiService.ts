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
    const response = await fetch("http://localhost:8002/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: "Search for the most recent influential social media posts or statements from Donald Trump, Elon Musk, or Jerome Powell.",
        system_instruction: "Return a list of MarketEvent objects (id, author, content, timestamp, sentiment, impactScore, affectedAssets, analysis) in JSON format."
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.events || []);
  } catch (error) {
    console.error("Error scanning for market events:", error);
    // Returner mock data hvis backenden er nede
    return [
      {
        id: "mock-1",
        author: "Elon Musk",
        content: "Buying more $DOGE and $TSLA soon.",
        timestamp: "Just now",
        sentiment: "bullish",
        impactScore: 85,
        affectedAssets: ["DOGE", "TSLA"],
        analysis: "Musk confirms further purchases."
      }
    ];
  }
}
