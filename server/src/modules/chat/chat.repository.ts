import { Model, Types } from 'mongoose';
import { ChatSession, IChatSession, IChatSessionDocument } from './chat-session.model';
import { ChatMessage, IChatMessage, IChatMessageDocument } from './chat-message.model';

export class ChatRepository {
  private readonly sessionModel: Model<IChatSessionDocument>;
  private readonly messageModel: Model<IChatMessageDocument>;

  constructor(
    sessionModel: Model<IChatSessionDocument> = ChatSession,
    messageModel: Model<IChatMessageDocument> = ChatMessage
  ) {
    this.sessionModel = sessionModel;
    this.messageModel = messageModel;
  }

  async createSession(data: Partial<IChatSession>): Promise<IChatSessionDocument> {
    const session = new this.sessionModel(data);
    return await session.save();
  }

  async findSession(sessionId: string | Types.ObjectId): Promise<IChatSessionDocument | null> {
    return await this.sessionModel.findById(sessionId).exec();
  }

  async saveMessage(data: Partial<IChatMessage>): Promise<IChatMessageDocument> {
    if (!data.sessionId) {
      throw new Error('Session ID is required to save a message.');
    }

    const dbSession = await this.sessionModel.db.startSession();
    try {
      let savedMessage: IChatMessageDocument | null = null;
      
      await dbSession.withTransaction(async () => {
        // Validate session first
        const sessionExists = await this.sessionModel
          .findById(data.sessionId)
          .session(dbSession)
          .exec();

        if (!sessionExists) {
          throw new Error(`Parent chat session not found: ${data.sessionId}`);
        }

        // Perform message insert
        const message = new this.messageModel(data);
        savedMessage = await message.save({ session: dbSession });

        // Update lastMessageAt on parent session
        await this.sessionModel.findByIdAndUpdate(
          data.sessionId,
          { lastMessageAt: new Date() },
          { session: dbSession }
        ).exec();
      });

      if (!savedMessage) {
        throw new Error('Failed to save message within transaction.');
      }

      return savedMessage;
    } finally {
      await dbSession.endSession();
    }
  }

  async getMessages(sessionId: string | Types.ObjectId): Promise<IChatMessageDocument[]> {
    return await this.messageModel
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getUserSessions(userId: string | Types.ObjectId): Promise<IChatSessionDocument[]> {
    return await this.sessionModel
      .find({ userId })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async deleteSession(sessionId: string | Types.ObjectId): Promise<boolean> {
    const dbSession = await this.sessionModel.db.startSession();
    try {
      let isDeleted = false;
      await dbSession.withTransaction(async () => {
        // Delete all messages belonging to the session first
        await this.messageModel.deleteMany({ sessionId }).session(dbSession).exec();

        const result = await this.sessionModel.findByIdAndDelete(sessionId).session(dbSession).exec();
        isDeleted = result !== null;
      });
      return isDeleted;
    } finally {
      await dbSession.endSession();
    }
  }
}

export const chatRepository = new ChatRepository();
