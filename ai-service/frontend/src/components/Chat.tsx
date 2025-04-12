import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
  Badge,
  useToast,
  type StackProps,
} from '@chakra-ui/react';
import { io, Socket as SocketIOClient } from 'socket.io-client';
import axios from 'axios';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages.tsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotionScore?: number;
  riskLevel?: string;
}

interface ChatResponse {
  chatId: string;
  anonymousId: string;
  sessionToken: string;
  message: string;
  emotionScore: number;
  riskLevel: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const socketRef = useRef<SocketIOClient | null>(null);
  const toast = useToast();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await axios.post<ChatResponse>(`${API_URL}/api/chat/start`);
        const { chatId, anonymousId, sessionToken } = response.data;
        
        setChatId(chatId);
        setAnonymousId(anonymousId);
        setSessionToken(sessionToken);
        
        // WebSocket 연결
        socketRef.current = io(SOCKET_URL, {
          query: {
            chatId,
            anonymousId,
            sessionToken
          }
        });

        socketRef.current.on('connect', () => {
          console.log('WebSocket connected');
        });

        socketRef.current.on('message', (message: Message) => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: message.content,
            sender: message.role === 'user' ? 'user' : 'bot',
            timestamp: message.timestamp
          }]);
        });

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
        };
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast({
          title: '연결 오류',
          description: '채팅 초기화에 실패했습니다. 다시 시도해주세요.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // TODO: Add API call here
    const botResponse = {
      id: (Date.now() + 1).toString(),
      text: '안녕하세요! 어떤 도움이 필요하신가요? 😊',
      sender: 'bot' as const,
      timestamp: new Date()
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <VStack h="70vh" spacing={4}>
      <Box 
        flex={1} 
        w="100%" 
        overflowY="auto" 
        borderRadius="lg"
        bg="white"
        p={4}
        boxShadow="base"
      >
        <ChatMessages messages={messages} />
      </Box>
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </VStack>
  );
};

export default Chat; 