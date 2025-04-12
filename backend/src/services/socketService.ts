import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Chat } from '../models/Chat';
import { User } from '../models/User';

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const { chatId, anonymousId, sessionToken } = socket.handshake.query;

    // 인증 검증
    socket.on('authenticate', async () => {
      try {
        const user = await User.findOne({ anonymousId });
        if (!user || !(await user.compareSessionToken(sessionToken as string))) {
          socket.emit('error', { message: '인증 실패' });
          socket.disconnect();
          return;
        }
        socket.emit('authenticated');
      } catch (error) {
        socket.emit('error', { message: '인증 중 오류 발생' });
        socket.disconnect();
      }
    });

    // 채팅 메시지 전송
    socket.on('message', async (message) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: '채팅을 찾을 수 없습니다.' });
          return;
        }

        chat.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date()
        });

        await chat.save();

        // AI 서비스에 메시지 분석 요청
        const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/api/v1/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            chatHistory: chat.messages
          })
        });

        const { response, emotionScore, riskLevel } = await aiResponse.json();

        // AI 응답 저장
        chat.messages.push({
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          emotionScore,
          riskLevel
        });

        await chat.save();

        // 클라이언트에 응답 전송
        socket.emit('message', {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          emotionScore,
          riskLevel
        });

        // 위험도가 HIGH인 경우 전문가에게 알림
        if (riskLevel === 'HIGH') {
          io.emit('expertAlert', {
            chatId,
            anonymousId,
            message: response,
            emotionScore,
            riskLevel
          });
        }
      } catch (error) {
        socket.emit('error', { message: '메시지 처리 중 오류 발생' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}; 