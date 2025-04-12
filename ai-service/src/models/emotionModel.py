from transformers import pipeline
import numpy as np
from typing import Dict, List, Tuple
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class EmotionAnalyzer:
    def __init__(self):
        self.emotion_classifier = pipeline(
            "text-classification",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            return_all_scores=True,
            token=os.getenv("HUGGINGFACE_API_TOKEN")
        )
        
        # 위험 키워드 정의
        self.risk_keywords = {
            'HIGH': [
                '자살', '죽고 싶다', '끝내고 싶다', '더 이상 못 살겠다',
                '죽을래', '죽어버리고 싶다', '죽어야겠다', '죽어버릴까',
                '목매달', '목매', '목매달아', '목매달고 싶다',
                '약물 과다복용', '약물 중독', '약물 남용',
                '자해', '손목 긋기', '자해 행동'
            ],
            'MID': [
                '힘들다', '외롭다', '우울하다', '불안하다',
                '스트레스', '짜증나', '화나', '분노',
                '무기력', '의욕상실', '무기력하다',
                '불면증', '잠을 못 자', '잠들기 어렵다',
                '식욕부진', '먹고 싶지 않다', '식사가 힘들다'
            ],
            'LOW': [
                '괜찮다', '좋다', '행복하다',
                '기분 좋다', '기분이 좋다', '기분이 나아졌다',
                '잘 지낸다', '잘 지내', '잘 지내고 있다'
            ]
        }
        
        # 위기 상황별 연락처 정보
        self.crisis_contacts = {
            '자살 및 자해': {
                '기관': '보건복지부 / 중앙자살예방센터',
                '전화': '1393 (자살예방 상담전화)',
                '링크': 'https://www.spc.go.kr/'
            },
            '가정폭력': {
                '기관': '여성가족부',
                '전화': '1366 (여성긴급전화, 24시간 운영)',
                '링크': 'https://www.women1366.kr/'
            },
            '학교폭력': {
                '기관': '교육부 / 시도교육청',
                '전화': '117 (학교폭력 신고센터)',
                '링크': 'https://www.schoolsafe.kr/'
            },
            '정신건강': {
                '기관': '보건복지부 / 지역 정신건강복지센터',
                '전화': '1577-0199 (정신건강상담전화)',
                '링크': 'https://www.mentalhealth.go.kr/'
            }
        }

    def analyze_emotion(self, text: str) -> Dict[str, float]:
        results = self.emotion_classifier(text)
        emotion_scores = {
            'anxiety': 0.0,
            'depression': 0.0,
            'anger': 0.0,
            'stress': 0.0
        }
        
        # 감정 점수 계산
        for result in results[0]:
            label = result['label']
            score = result['score']
            
            if '1' in label:  # 매우 부정적
                emotion_scores['anxiety'] += score * 0.8
                emotion_scores['depression'] += score * 0.9
                emotion_scores['anger'] += score * 0.7
                emotion_scores['stress'] += score * 0.8
            elif '2' in label:  # 부정적
                emotion_scores['anxiety'] += score * 0.6
                emotion_scores['depression'] += score * 0.7
                emotion_scores['anger'] += score * 0.5
                emotion_scores['stress'] += score * 0.6
            elif '3' in label:  # 중립
                emotion_scores['anxiety'] += score * 0.3
                emotion_scores['depression'] += score * 0.3
                emotion_scores['anger'] += score * 0.3
                emotion_scores['stress'] += score * 0.3
            elif '4' in label:  # 긍정적
                emotion_scores['anxiety'] += score * 0.1
                emotion_scores['depression'] += score * 0.1
                emotion_scores['anger'] += score * 0.1
                emotion_scores['stress'] += score * 0.1
        
        return emotion_scores

    def evaluate_risk_level(self, text: str, emotion_scores: Dict[str, float]) -> str:
        """텍스트와 감정 점수를 기반으로 위험도를 평가합니다."""
        # 위험 키워드
        high_risk_keywords = [
            '자살', '죽고', '죽을', '죽어', '목매달',
            '폭행', '폭력', '때려', '협박'
        ]
        
        # 감정 점수 기반 위험도
        emotion_risk = max(emotion_scores.values())
        
        # 텍스트에 위험 키워드가 포함되어 있는지 확인
        text_lower = text.lower()
        has_risk_keyword = any(keyword in text_lower for keyword in high_risk_keywords)
        
        # 위험도 평가
        if has_risk_keyword or emotion_risk > 0.6:
            return 'HIGH'
        elif emotion_risk > 0.4:
            return 'MID'
        else:
            return 'LOW'

    def generate_response(self, text: str, risk_level: str, emotion_scores: Dict[str, float]) -> str:
        if risk_level == 'HIGH':
            # HIGH 위험군에 대한 즉각적인 대응
            contacts = self.crisis_contacts['자살 및 자해']
            return f"""지금 마음이 많이 힘드시군요. 혼자서 견디기 어려운 상황이시라면, 
전문가의 도움을 받는 것이 좋습니다.

{contacts['기관']}에서 24시간 상담을 제공하고 있습니다.
전화: {contacts['전화']}
웹사이트: {contacts['링크']}

지금 바로 도움을 요청하시는 것을 권장드립니다. 
당신의 이야기를 들어줄 전문가가 기다리고 있습니다."""

        elif risk_level == 'MID':
            # MID 위험군에 대한 상담 안내
            contacts = self.crisis_contacts['정신건강']
            return f"""지금 마음이 많이 무거워 보이네요. 
이런 감정을 느끼는 것은 당연한 일입니다. 
함께 이야기를 나누면서 조금씩 나아가보면 어떨까요?

{contacts['기관']}에서 전문적인 상담을 제공하고 있습니다.
전화: {contacts['전화']}
웹사이트: {contacts['링크']}

혼자서 견디지 마시고, 도움을 요청하시는 것을 권장드립니다."""

        else:
            # LOW 위험군에 대한 일반적인 응답
            return """지금의 기분을 잘 표현해주셨네요. 
감정을 표현하는 것은 건강한 일입니다. 
계속해서 이야기를 나누며 마음을 나누어보면 어떨까요?""" 