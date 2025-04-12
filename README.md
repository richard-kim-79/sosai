# SOSAI - 익명 기반 위기 대응 AI 웹앱 서비스

## 프로젝트 개요
SOSAI는 익명성을 보장하며 AI와 전문가의 협력을 통해 위기 상황에 놓인 사용자에게 즉각적이고 안전한 도움을 제공하는 서비스입니다.

## 주요 기능
- 익명 AI 챗봇 상담
- 실시간 감정/위험 분석
- 전문가 연계 시스템
- 개인정보 보호 (Zero Trust 모델)
- 24시간 위기 대응

## 기술 스택
### 프론트엔드
- React
- TypeScript
- TailwindCSS
- WebSocket

### 백엔드
- Node.js
- Express
- MongoDB
- Redis

### AI 서비스
- Python
- FastAPI
- Transformers
- NLP 모델

## 보안
- AES-256 암호화
- Zero Trust 아키텍처
- 개인정보 최소화
- 전문가 접근 제어

## 설치 및 실행
```bash
# 프론트엔드
cd frontend
npm install
npm start

# 백엔드
cd backend
npm install
npm start

# AI 서비스
cd ai-service
pip install -r requirements.txt
python main.py
```

## 라이센스
MIT License 