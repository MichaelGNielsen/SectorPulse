import os
import sys
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any

# Add shared utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from shared.ai_utils.ai_base import AIBase

app = FastAPI(title="SectorPulse API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai = AIBase(agent_name="SectorPulse")

class AnalysisRequest(BaseModel):
    prompt: Optional[str] = None
    system_instruction: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "agent": "SectorPulse"}

@app.get("/latest")
def get_latest_results():
    """Henter de nyeste resultater fra scanner-logs."""
    log_dir = os.path.join(os.path.dirname(__file__), "logs", "market")
    if not os.path.exists(log_dir):
        return {"results": []}
    
    files = [f for f in os.listdir(log_dir) if f.endswith(".json")]
    if not files:
        return {"results": []}
    
    # Tag den nyeste fil
    latest_file = max([os.path.join(log_dir, f) for f in files], key=os.path.getmtime)
    with open(latest_file, "r") as f:
        return json.load(f)

@app.post("/analyze")
def analyze(request: AnalysisRequest):
    """Proxy til lokal AI (Ollama/Gemini)."""
    system_prompt = request.system_instruction or "Du er en Global Market Strategist."
    user_prompt = request.prompt or "Analyser de seneste makro-økonomiske tendenser."
    
    res = ai.ask(user_prompt, system_instruction=system_prompt, force_json=True, prefer_local=True)
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
