import streamlit as st
import requests
import json
from typing import Dict, List

# 페이지 설정
st.set_page_config(
    page_title="AI 감정 분석 서비스",
    page_icon="🤖",
    layout="wide"
)

# 타이틀
st.title("🤖 AI 감정 분석 서비스")
st.markdown("---")

# 사이드바
st.sidebar.title("설정")
api_url = st.sidebar.text_input("API URL", "http://localhost:8001/api/v1/analyze")

# 메인 컨텐츠
st.header("감정 분석")
user_input = st.text_area("당신의 기분을 입력해주세요", height=150)

if st.button("분석하기"):
    if user_input:
        try:
            # API 요청
            response = requests.post(
                api_url,
                json={
                    "message": user_input,
                    "chatHistory": []
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # 감정 점수 시각화
                st.subheader("감정 분석 결과")
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write("감정 점수")
                    for emotion, score in result["emotionScore"].items():
                        st.progress(score, text=f"{emotion}: {score:.2f}")
                
                with col2:
                    st.write("위험도")
                    risk_color = {
                        "LOW": "🟢",
                        "MID": "🟡",
                        "HIGH": "🔴"
                    }
                    st.markdown(f"### {risk_color[result['riskLevel']]} {result['riskLevel']}")
                
                # AI 응답
                st.subheader("AI 응답")
                st.info(result["response"])
                
            else:
                st.error(f"API 요청 실패: {response.status_code}")
                
        except Exception as e:
            st.error(f"오류 발생: {str(e)}")
    else:
        st.warning("텍스트를 입력해주세요")

# 푸터
st.markdown("---")
st.markdown("© 2024 AI 감정 분석 서비스") 