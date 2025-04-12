import mongoose from 'mongoose';

export interface IChat extends mongoose.Document {
  userId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    emotionScore?: {
      anxiety: number;
      depression: number;
      anger: number;
      stress: number;
    };
    riskLevel?: 'LOW' | 'MID' | 'HIGH';
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    emotionScore: {
      anxiety: Number,
      depression: Number,
      anger: Number,
      stress: Number
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MID', 'HIGH']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 