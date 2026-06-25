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
    const message = new this.messageModel(data);
    const saved = await message.save();

    // Update lastMessageAt on the parent session
    await this.sessionModel.findByIdAndUpdate(data.sessionId, {
      lastMessageAt: new Date(),
    });

    return saved;
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
    // Delete all messages belonging to the session first
    await this.messageModel.deleteMany({ sessionId }).exec();

    const result = await this.sessionModel.findByIdAndDelete(sessionId).exec();
    return result !== null;
  }
}

export const chatRepository = new ChatRepository();
