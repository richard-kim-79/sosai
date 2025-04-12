from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from src.models.emotionModel import EmotionAnalyzer
from src.models.scenarioModel import ScenarioClassifier
from src.models.chatModel import ChatModel
import uvicorn
from dotenv import load_dotenv
import os

# 환경 변수 로드
load_dotenv()

app = FastAPI(
    title="SOSAI API",
    description="익명 기반 위기 대응 AI 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서만 사용. 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 초기화
emotion_analyzer = EmotionAnalyzer()
scenario_classifier = ScenarioClassifier()
chat_model = ChatModel()

class Message(BaseModel):
    text: str
    isUser: bool

class ChatRequest(BaseModel):
    message: str
    chatHistory: Optional[List[Message]] = None

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    scenario: str
    riskLevel: str
    response: str

class ChatResponse(BaseModel):
    response: str

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # GPT 응답 생성
        response = chat_model.get_chat_response(
            request.message,
            request.chatHistory
        )
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    try:
        # 상황 분류
        detected_scenarios = scenario_classifier.classify_scenario(request.text)
        
        # 감정 분석
        emotion_scores = emotion_analyzer.analyze_emotion(request.text)
        
        # 위험도 평가
        risk_level = emotion_analyzer.evaluate_risk_level(request.text, emotion_scores)
        
        # 시나리오 매핑
        scenario_mapping = {
            'school_violence': '학교폭력',
            'domestic_violence': '가정폭력',
            'suicide': '자살위험',
            '기타': '기타'
        }
        
        # 감지된 시나리오가 있으면 첫 번째 시나리오 사용, 없으면 '기타'
        scenario = scenario_mapping.get(detected_scenarios[0], '기타') if detected_scenarios else '기타'
        
        # 위험도 매핑
        risk_level = 'high' if (
            risk_level == 'HIGH' or 
            any(s in ['school_violence', 'domestic_violence', 'suicide'] for s in detected_scenarios)
        ) else 'low'
        
        return AnalyzeResponse(
            scenario=scenario,
            riskLevel=risk_level,
            response=""  # 응답은 chat 엔드포인트에서 처리
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "AI 서비스 API 서버가 실행 중입니다."}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
