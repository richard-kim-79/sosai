import app from './app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { initializeSocket } from './services/socketService';

dotenv.config();

const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosai';

// MongoDB 연결
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((error) => console.error('MongoDB 연결 실패:', error));

// HTTP 서버 생성
const httpServer = createServer(app);

// WebSocket 서버 초기화
const io = initializeSocket(httpServer);

// 서버 시작
httpServer.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

