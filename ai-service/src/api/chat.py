from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from ..models.emotionModel import EmotionAnalyzer

router = APIRouter()
emotion_analyzer = EmotionAnalyzer()

class Message(BaseModel):
    role: str
    content: str
    timestamp: str
    emotionScore: Optional[Dict[str, float]] = None
    riskLevel: Optional[str] = None

class AnalyzeRequest(BaseModel):
    message: str
    chatHistory: List[Message]

class AnalyzeResponse(BaseModel):
    response: str
    emotionScore: Dict[str, float]
    riskLevel: str

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_message(request: AnalyzeRequest):
    try:
        # 감정 분석
        emotion_scores = emotion_analyzer.analyze_emotion(request.message)
        
        # 위험도 평가
        risk_level = emotion_analyzer.evaluate_risk_level(request.message, emotion_scores)
        
        # 응답 생성
        response = emotion_analyzer.generate_response(
            request.message,
            risk_level,
            emotion_scores
        )
        
        return AnalyzeResponse(
            response=response,
            emotionScore=emotion_scores,
            riskLevel=risk_level
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 