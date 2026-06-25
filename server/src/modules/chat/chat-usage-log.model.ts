import mongoose, { Document, Schema, Types, Model } from 'mongoose';

export interface IChatUsageLog {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  provider: string;
  tokens: number;
  cost: number;
  durationMs: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatUsageLogDocument extends IChatUsageLog, Document {}

const ChatUsageLogSchema = new Schema<IChatUsageLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: [true, 'Session ID is required'],
      index: true,
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      trim: true,
      index: true,
    },
    tokens: {
      type: Number,
      required: [true, 'Tokens count is required'],
      min: 0,
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: 0,
    },
    durationMs: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'chat_usage_logs',
  }
);

// Indexes for optimization
ChatUsageLogSchema.index({ userId: 1, createdAt: -1 });
ChatUsageLogSchema.index({ sessionId: 1, createdAt: -1 });

export const ChatUsageLog: Model<IChatUsageLogDocument> =
  mongoose.models.ChatUsageLog ||
  mongoose.model<IChatUsageLogDocument>('ChatUsageLog', ChatUsageLogSchema);
