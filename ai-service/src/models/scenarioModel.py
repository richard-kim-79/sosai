from transformers import pipeline
import os
from dotenv import load_dotenv
from typing import List, Dict, Tuple

# 환경 변수 로드
load_dotenv()

class ScenarioClassifier:
    def __init__(self):
        # 상황 분류 모델 초기화
        self.classifier = pipeline(
            "text-classification",
            model="bert-base-multilingual-uncased",
            token=os.getenv("HUGGINGFACE_API_TOKEN")
        )
        
        # 상황별 키워드 정의
        self.scenario_keywords = {
            'school_violence': [
                '학교', '선배', '괴롭힘', '학교폭력', '왕따',
                '집단따돌림', '학교폭행', '폭력', '때려',
                '괴롭혀', '협박', '아이들이', '친구들이',
                '학생', '반에서', '교실', '학교에서',
                '따돌림', '무시', '놀림', '욕', '협박',
                '때리', '맞', '폭행', '괴롭'
            ],
            'domestic_violence': [
                '아빠가 때려', '엄마가 때려', '부모가 때려',
                '가정폭력', '가정폭행', '가정학대',
                '집에서 폭력', '집에서 때려', '집에서 학대',
                '아빠가 술', '엄마가 술', '부모가 술',
                '아빠가 폭력', '엄마가 폭력', '부모가 폭력',
                '가정에서 폭력', '가정에서 때려', '가정에서 학대'
            ],
            'suicide': [
                '자살', '죽고 싶다', '끝내고 싶다',
                '죽을래', '죽어버리고 싶다', '죽어야겠다',
                '목매달', '목매', '목매달아', '죽고',
                '살기 싫어', '살고 싶지 않아', '다 끝내고',
                '사라지고', '없어지고', '죽음'
            ]
        }
        
        # 상황별 연락처 정보
        self.scenario_contacts = {
            '학교폭력': {
                '기관': '교육부 / 시도교육청',
                '전화': '117 (학교폭력 신고센터)',
                '링크': 'https://www.schoolsafe.kr/'
            },
            '가정폭력': {
                '기관': '여성가족부',
                '전화': '1366 (여성긴급전화, 24시간 운영)',
                '링크': 'https://www.women1366.kr/'
            },
            '자살위험': {
                '기관': '보건복지부 / 중앙자살예방센터',
                '전화': '1393 (자살예방 상담전화)',
                '링크': 'https://www.spc.go.kr/'
            },
            '기타': {
                '기관': '보건복지부 상담센터',
                '전화': '129 (보건복지 상담센터)',
                '링크': 'http://www.129.go.kr/'
            }
        }
    
    def classify_scenario(self, text: str) -> List[str]:
        """입력 텍스트의 상황을 분류합니다."""
        detected_scenarios = []
        text_lower = text.lower()
        
        # 키워드 매칭
        for scenario, keywords in self.scenario_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    detected_scenarios.append(scenario)
                    break
        
        # 키워드 매칭이 실패했을 때만 모델 기반 분류 사용
        if not detected_scenarios:
            try:
                result = self.classifier(text)[0]
                if result['score'] > 0.6:  # 신뢰도 임계값 설정
                    detected_scenarios.append('기타')
            except Exception as e:
                print(f"모델 분류 중 오류 발생: {str(e)}")
                detected_scenarios.append('기타')
        
        return list(set(detected_scenarios))  # 중복 제거
        
    def get_contact_info(self, scenario: str) -> Dict[str, str]:
        """상황별 연락처 정보를 반환합니다."""
        return self.scenario_contacts.get(scenario, self.scenario_contacts['기타'])

    def generate_scenario_response(self, scenarios: List[str], risk_level: str) -> str:
        """상황별 응답을 생성합니다."""
        if not scenarios:
            return "현재 상황을 파악하기 어렵습니다. 더 자세한 설명을 해주시면 도움을 드릴 수 있습니다."
        
        response = []
        for scenario in scenarios:
            contacts = self.get_contact_info(scenario)
            
            if risk_level == 'HIGH':
                response.append(f"""🚨 {scenario} 상황이 의심됩니다. 너무 힘들고 두려운 상황이었을 것 같아요.

당신은 혼자가 아니에요. 지금 당장 도움을 드릴 수 있도록 담당자와 연결해드릴게요.

📩 가능하시다면 이름과 연락 가능한 번호를 입력해주세요.
전문가가 직접 연락드릴 수 있도록 하겠습니다.
(개인정보는 암호화되어 안전하게 처리됩니다)

{contacts['기관']}에서도 24시간 긴급 지원을 제공하고 있습니다.
전화: {contacts['전화']}
웹사이트: {contacts['링크']}""")
            
            elif risk_level == 'MID':
                response.append(f"""⚠️ {scenario} 상황이 의심됩니다. 힘든 상황이었을 것 같아요.

혼자서 견디지 마세요. 도움을 요청하는 것은 용기 있는 행동입니다.

📩 필요하시다면 이름과 연락 가능한 번호를 입력해주세요.
담당자가 직접 연락드려 도움을 제공해드리겠습니다.
(개인정보는 암호화되어 안전하게 처리됩니다)

{contacts['기관']}에서 전문적인 상담을 제공하고 있습니다.
전화: {contacts['전화']}
웹사이트: {contacts['링크']}""")
            
            else:
                response.append(f"""ℹ️ {scenario} 관련 도움이 필요하신가요?

지금의 기분을 잘 표현해주셨네요. 감정을 표현하는 것은 건강한 일입니다.

📩 필요하시다면 이름과 연락 가능한 번호를 입력해주세요.
담당자가 연락드려 도움을 제공해드리겠습니다.
(개인정보는 암호화되어 안전하게 처리됩니다)

{contacts['기관']}에서 관련 정보와 상담을 제공하고 있습니다.
전화: {contacts['전화']}
웹사이트: {contacts['링크']}""")

        return "\n\n".join(response) 