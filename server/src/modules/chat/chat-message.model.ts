import mongoose, { Document, Schema, Types, Model } from 'mongoose';

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export interface IChatMessage {
  sessionId: Types.ObjectId;
  role: MessageRole;
  content: string;
  tokenUsage?: number;
  aiProvider?: string;
  responseTimeMs?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessageDocument extends IChatMessage, Document {}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: [true, 'Session ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MessageRole),
      required: [true, 'Message role is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    tokenUsage: {
      type: Number,
      min: 0,
    },
    aiProvider: {
      type: String,
      trim: true,
    },
    responseTimeMs: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'chat_messages',
  }
);

// Compound index — fetch all messages for a session ordered chronologically
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessage: Model<IChatMessageDocument> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessageDocument>('ChatMessage', ChatMessageSchema);
