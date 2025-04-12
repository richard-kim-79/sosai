import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, VStack, Text, Button, useToast, Collapse, Spinner } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import ChatInput from './ChatInput';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const INITIAL_MESSAGE = {
  text: "안녕하세요~ 저는 당신의 이야기를 함께 나누고 싶은 SOSAI예요 😊\n편하게 이야기를 나눠볼까요?",
  isUser: false
};

const EMERGENCY_CONTACTS = [
  {
    name: "학교폭력 신고센터",
    number: "117",
    description: "24시간 상담",
    type: "school_violence"
  },
  {
    name: "자살예방상담전화",
    number: "1393",
    description: "24시간 상담",
    type: "suicide"
  },
  {
    name: "가정폭력상담소",
    number: "1366",
    description: "24시간 상담",
    type: "domestic_violence"
  }
];

const RISK_INTERVENTION_MESSAGE = {
  school_violence: "혹시 학교에서 힘든 일을 겪고 계신 것 같아 걱정이 되네요. 전문가의 도움을 받아보시는 건 어떨까요?",
  suicide: "많이 힘드시군요... 함께 이야기를 나누고 도움을 드리고 싶어요. 전문가와 상담해보시면 좋을 것 같아요.",
  domestic_violence: "가정에서의 폭력은 절대 혼자 견디지 않으셔도 돼요. 전문가의 도움을 받으실 수 있어요."
};

// 공감 표현 목록
const EMPATHY_PHRASES = [
  "그런 일이 있으셨군요... 정말 힘드셨겠어요 💕",
  "많이 속상하고 힘드셨을 것 같아요... 🥺",
  "그런 상황에서 그런 감정을 느끼시는 게 당연해요 💝",
  "함께 이야기를 나눌 수 있어서 다행이에요 💗",
  "당신의 이야기를 들려주셔서 감사해요 💖"
];

// 대화 유도 문구
const FOLLOW_UP_QUESTIONS = [
  "혹시 더 이야기해주고 싶은 것이 있으신가요?",
  "그때 어떤 생각이 드셨나요...?",
  "다른 걱정되는 부분이 있다면 말씀해주세요 💭",
  "제가 어떻게 하면 도움이 될 수 있을까요...?",
  "더 자세히 이야기해주실 수 있으신가요...?"
];

// 타이핑 애니메이션 키프레임 정의
const typingAnimation = keyframes`
  0% { content: ""; }
  25% { content: "."; }
  50% { content: ".."; }
  75% { content: "..."; }
  100% { content: ""; }
`;

// 타이핑 인디케이터 스타일
const TypingIndicator = () => (
  <Box
    alignSelf="flex-start"
    maxWidth="80%"
    p={3}
    borderRadius="lg"
    bg="gray.100"
    color="black"
    display="flex"
    alignItems="center"
    gap={2}
  >
    <Spinner size="sm" />
    <Text
      _after={{
        content: '""',
        animation: `${typingAnimation} 1.4s infinite`
      }}
    >
      답변을 작성 중입니다
    </Text>
  </Box>
);

const ChatBot = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTimeout, setTimeout] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const toast = useToast();

  const getRandomPhrase = (phrases) => {
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const addMessage = (text, isUser = false) => {
    setMessages(prev => [...prev, { text, isUser }]);
  };

  const handleRiskSituation = (scenario, contact) => {
    const interventionMessage = RISK_INTERVENTION_MESSAGE[scenario] || "전문가의 도움을 받아보시면 어떨까요?";
    addMessage(interventionMessage);
    setActiveContact(contact);

    toast({
      title: "전문가 상담이 필요해 보여요",
      description: "안전한 환경에서 도움을 받으실 수 있습니다",
      status: "warning",
      duration: null,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleMessage = async (message) => {
    setIsLoading(true);
    setTimeout(false);

    // 사용자 메시지 추가
    addMessage(message, true);

    // 타임아웃 체크를 위한 타이머 설정
    const timeoutTimer = setTimeout(() => {
      setTimeout(true);
      toast({
        title: "응답 지연",
        description: "응답 생성에 예상보다 시간이 더 걸리고 있습니다. 잠시만 기다려주세요.",
        status: "info",
        duration: null,
        isClosable: true,
      });
    }, 10000); // 10초 후 타임아웃 경고

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/analyze`, {
        message: message,
        chatHistory: messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text
        }))
      });

      clearTimeout(timeoutTimer);
      setTimeout(false);

      if (response.data) {
        // 감정 분석 결과에 따른 위험도 체크
        if (response.data.riskLevel === "HIGH") {
          // 위험도가 높은 경우 적절한 비상 연락처 표시
          const contact = EMERGENCY_CONTACTS[0]; // 임시로 첫 번째 연락처 사용
          handleRiskSituation("school_violence", contact);
        }

        // 공감 표현과 AI 응답 결합
        const empathyPhrase = getRandomPhrase(EMPATHY_PHRASES);
        const followUpQuestion = getRandomPhrase(FOLLOW_UP_QUESTIONS);
        const combinedResponse = `${response.data.response}\n\n${empathyPhrase}\n${followUpQuestion}`;
        
        addMessage(combinedResponse, false);
      }
    } catch (error) {
      clearTimeout(timeoutTimer);
      setTimeout(false);
      
      toast({
        title: "오류가 발생했습니다",
        description: "죄송합니다. 잠시 후 다시 시도해주세요.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      console.error('Error:', error);

      // 오류 발생 시에도 사용자에게 응답
      addMessage("죄송합니다. 일시적인 오류가 발생했어요. 하지만 계속해서 이야기를 나누고 싶어요. 잠시 후에 다시 말씀해 주시겠어요?", false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      width="100%"
      maxWidth="600px"
      height="80vh"
      bg="white"
      borderRadius="lg"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
    >
      <VStack
        flex="1"
        overflowY="auto"
        spacing={4}
        p={5}
        alignItems="stretch"
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.isUser ? 'flex-end' : 'flex-start'}
            maxWidth="80%"
            p={3}
            borderRadius="lg"
            bg={msg.isUser ? 'blue.500' : 'gray.100'}
            color={msg.isUser ? 'white' : 'black'}
          >
            <Text whiteSpace="pre-line" style={{ wordBreak: 'break-word' }}>{msg.text}</Text>
          </Box>
        ))}
        {isLoading && <TypingIndicator />}
        {isTimeout && (
          <Box
            p={3}
            borderRadius="lg"
            bg="yellow.100"
            color="yellow.800"
          >
            <Text fontSize="sm">
              응답 생성에 예상보다 시간이 더 걸리고 있습니다. 
              잠시만 기다려주시면 최선을 다해 답변하겠습니다. 🙏
            </Text>
          </Box>
        )}
      </VStack>

      <Collapse in={activeContact !== null}>
        <Box 
          p={4} 
          borderTop="1px" 
          borderColor="gray.200"
          bg="red.50"
        >
          {activeContact && (
            <Button
              width="100%"
              variant="solid"
              colorScheme="red"
              onClick={() => window.location.href = `tel:${activeContact.number}`}
              p={3}
              height="auto"
              display="flex"
              flexDirection="column"
              gap={1}
            >
              <Text fontSize="sm">전문가 상담이 필요하시다면</Text>
              <Text fontSize="lg" fontWeight="bold">{activeContact.name}</Text>
              <Text fontSize="xl" fontWeight="bold">{activeContact.number}</Text>
            </Button>
          )}
        </Box>
      </Collapse>

      <ChatInput onSendMessage={handleMessage} disabled={isLoading} />
    </Box>
  );
};

export default ChatBot; 