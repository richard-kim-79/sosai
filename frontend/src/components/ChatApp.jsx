import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import ChatInput from './ChatInput';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f5f5f5;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 16px;
  line-height: 1.5;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #007AFF;
    color: white;
  ` : `
    align-self: flex-start;
    background-color: white;
    color: black;
  `}
`;

const LoadingIndicator = styled.div`
  align-self: flex-start;
  padding: 12px 16px;
  background-color: white;
  border-radius: 20px;
  color: #666;
  font-size: 16px;
`;

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContactMode, setIsContactMode] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', { message });
      const aiResponse = response.data.response;
      
      setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
      
      // AI 응답에 연락처 요청이 포함되어 있는지 확인
      if (aiResponse.includes('이름과 연락처') || aiResponse.includes('연락 가능한 전화번호')) {
        setIsContactMode(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async (contactInfo) => {
    setIsContactMode(false);
    setMessages(prev => [...prev, { 
      text: `이름: ${contactInfo.name}, 연락처: ${contactInfo.phone}`, 
      isUser: true 
    }]);
    
    try {
      const response = await axios.post('/api/contact', contactInfo);
      const aiResponse = response.data.response;
      setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      console.error('Error submitting contact:', error);
      setMessages(prev => [...prev, { 
        text: '연락처 제출 중 오류가 발생했습니다. 다시 시도해주세요.', 
        isUser: false 
      }]);
    }
  };

  return (
    <Container>
      <ChatContainer ref={chatContainerRef}>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.isUser}>
            {message.text}
          </Message>
        ))}
        {isLoading && <LoadingIndicator>응답을 생성하는 중...</LoadingIndicator>}
      </ChatContainer>
      <ChatInput 
        onSendMessage={handleSendMessage}
        isContactMode={isContactMode}
        onContactSubmit={handleContactSubmit}
      />
    </Container>
  );
};

export default ChatApp; 