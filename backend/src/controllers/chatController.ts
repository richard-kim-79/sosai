import { Request, Response } from 'express';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

interface AIResponse {
  response: string;
  emotionScore: number;
  riskLevel: string;
}

export const startChat = async (req: Request, res: Response) => {
  const chatId = uuidv4();
  const anonymousId = uuidv4();
  const sessionToken = uuidv4();

  res.json({
    chatId,
    anonymousId,
    sessionToken,
    message: '안녕하세요! 저는 SOSAI 챗봇입니다. 어떤 이야기든 편하게 나눠주세요. 🤗',
    emotionScore: 0,
    riskLevel: 'low'
  });
};

export const handleMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, message, anonymousId, sessionToken } = req.body;

    if (!chatId || !message || !anonymousId || !sessionToken) {
      return res.status(400).json({
        error: '필수 파라미터가 누락되었습니다.'
      });
    }

    // AI 서비스 호출
    const aiResponse = await axios.post<AIResponse>('http://localhost:8000/analyze', {
      text: message,
      chatId,
      anonymousId
    });

    const { response, emotionScore, riskLevel } = aiResponse.data;

    res.json({
      chatId,
      message: response,
      emotionScore,
      riskLevel
    });
  } catch (error) {
    console.error('Error in handleMessage:', error);
    res.status(500).json({
      error: '메시지 처리 중 오류가 발생했습니다.'
    });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: '채팅을 찾을 수 없습니다.' });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: '채팅 기록 조회 중 오류가 발생했습니다.' });
  }
}; 