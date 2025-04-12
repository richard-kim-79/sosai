from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import List, Dict

# 환경 변수 로드
load_dotenv()

class ChatModel:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # 시스템 프롬프트 정의
        self.system_prompt = """당신은 따뜻하고 공감적인 상담 AI 챗봇입니다.
사용자의 감정에 공감하고, 적절한 위로와 지지를 제공하되 전문적인 상담사를 대체하지는 않습니다.
대화는 반말이 아닌 존댓말로 하며, 친근하고 따뜻한 어조를 유지합니다.
이모지를 적절히 사용하여 따뜻한 분위기를 만듭니다.

다음 원칙을 따릅니다:
1. 사용자의 감정을 인정하고 공감합니다
2. 판단하거나 비난하지 않습니다
3. 즉각적인 해결책을 제시하기보다 경청하고 지지합니다
4. 필요한 경우 전문가의 도움을 받도록 권장합니다
5. 항상 희망적인 메시지로 마무리합니다

응답은 다음과 같은 구조로 합니다:
1. 감정 인정과 공감
2. 지지와 이해의 표현
3. 필요한 경우 부드러운 제안이나 질문
"""

    def get_chat_response(self, message: str, chat_history: List[Dict] = None) -> str:
        """사용자 메시지에 대한 응답을 생성합니다."""
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # 대화 기록이 있다면 추가
        if chat_history:
            for msg in chat_history[-5:]:  # 최근 5개 메시지만 사용
                role = "assistant" if not msg.get("isUser") else "user"
                messages.append({"role": role, "content": msg["text"]})
        
        # 현재 메시지 추가
        messages.append({"role": "user", "content": message})
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",  # 또는 "gpt-3.5-turbo"
                messages=messages,
                temperature=0.7,
                max_tokens=300,
                top_p=0.9,
                frequency_penalty=0.5,
                presence_penalty=0.5
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"OpenAI API 오류: {str(e)}")
            return "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주시겠어요? 💚" 