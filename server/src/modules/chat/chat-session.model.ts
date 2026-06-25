import mongoose, { Document, Schema, Types, Model } from 'mongoose';

export enum ChatSessionStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface IChatSession {
  userId: Types.ObjectId;
  title?: string;
  linkedAnalysisId?: Types.ObjectId;
  status: ChatSessionStatus;
  lastMessageAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatSessionDocument extends IChatSession, Document {}

const ChatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    linkedAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'NewsAnalysis',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ChatSessionStatus),
      default: ChatSessionStatus.ACTIVE,
      required: true,
      index: true,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'chat_sessions',
  }
);

// Compound index — fetch active sessions for a user sorted by last activity
ChatSessionSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });

export const ChatSession: Model<IChatSessionDocument> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSessionDocument>('ChatSession', ChatSessionSchema);
