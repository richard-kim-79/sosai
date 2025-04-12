from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI 감정 분석 서비스",
    description="감정 분석을 위한 REST API 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class AnalyzeRequest(BaseModel):
    message: str
    chatHistory: List[Dict[str, str]] = []

# Response models
class AnalyzeResponse(BaseModel):
    emotionScore: Dict[str, float]
    riskLevel: str
    response: str

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI 감정 분석 서비스가 실행 중입니다."}

@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_emotion(request: AnalyzeRequest):
    try:
        # 임시 응답 (실제 구현 필요)
        return {
            "emotionScore": {
                "행복": 0.8,
                "슬픔": 0.1,
                "분노": 0.1
            },
            "riskLevel": "LOW",
            "response": "감정 분석 결과입니다. 현재 매우 긍정적인 감정 상태를 보이고 있습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) 