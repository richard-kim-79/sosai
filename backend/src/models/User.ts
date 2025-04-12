import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  anonymousId: string;
  sessionToken?: string;
  riskLevel: 'LOW' | 'MID' | 'HIGH';
  personalInfo?: {
    name?: string;
    contact?: string;
    location?: string;
    emergencyContact?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  compareSessionToken(candidateToken: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    unique: true
  },
  sessionToken: {
    type: String
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MID', 'HIGH'],
    default: 'LOW'
  },
  personalInfo: {
    name: String,
    contact: String,
    location: String,
    emergencyContact: String
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('sessionToken')) {
    const salt = await bcrypt.genSalt(10);
    this.sessionToken = await bcrypt.hash(this.sessionToken as string, salt);
  }
  next();
});

userSchema.methods.compareSessionToken = async function(candidateToken: string): Promise<boolean> {
  return bcrypt.compare(candidateToken, this.sessionToken);
};

export const User = mongoose.model<IUser>('User', userSchema); 