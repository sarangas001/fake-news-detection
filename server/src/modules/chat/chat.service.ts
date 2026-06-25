import { Types } from 'mongoose';
import { ChatRepository, chatRepository } from './chat.repository';
import { ContextBuilderService, contextBuilderService } from './services/context-builder.service';
import { PromptBuilderService, promptBuilderService } from './services/prompt-builder.service';
import { ChatProviderService, chatProviderService } from './services/chat-provider.service';
import { IChatSessionDocument, ChatSessionStatus } from './chat-session.model';
import { IChatMessageDocument, MessageRole } from './chat-message.model';

export class ChatService {
  constructor(
    private readonly chatRepo: ChatRepository = chatRepository,
    private readonly contextBuilder: ContextBuilderService = contextBuilderService,
    private readonly promptBuilder: PromptBuilderService = promptBuilderService,
    private readonly chatProvider: ChatProviderService = chatProviderService
  ) {}

  /**
   * Creates a new chat session for a user.
   * @param userId The ID of the user creating the session.
   * @param title An optional title for the session.
   * @param linkedAnalysisId An optional linked news analysis ID.
   */
  async createSession(
    userId: string,
    title?: string,
    linkedAnalysisId?: string
  ): Promise<IChatSessionDocument> {
    const sessionData: any = {
      userId: new Types.ObjectId(userId),
      status: ChatSessionStatus.ACTIVE,
      lastMessageAt: new Date(),
    };

    if (title) {
      sessionData.title = title;
    }

    if (linkedAnalysisId) {
      sessionData.linkedAnalysisId = new Types.ObjectId(linkedAnalysisId);
    }

    return await this.chatRepo.createSession(sessionData);
  }

  /**
   * Sends a user message, processes it through the Gemini assistant workflow,
   * stores the response, and returns the generated assistant message.
   * @param sessionId The active chat session ID.
   * @param userMessageContent The content of the user's message.
   */
  async sendMessage(sessionId: string, userMessageContent: string): Promise<IChatMessageDocument> {
    if (!userMessageContent || userMessageContent.trim() === '') {
      throw new Error('Message content cannot be empty.');
    }

    // 1. Save user message to database first
    await this.chatRepo.saveMessage({
      sessionId: new Types.ObjectId(sessionId),
      role: MessageRole.USER,
      content: userMessageContent,
    });

    // 2. Load Context (which includes the saved user message and linked analysis)
    const context = await this.contextBuilder.buildContext(sessionId);

    // 3. Build Prompt
    const prompt = this.promptBuilder.buildPrompt(context);

    // 4. Send To Gemini (measuring response time)
    const startTime = Date.now();
    const geminiResponse = await this.chatProvider.sendMessage(prompt);
    const responseTimeMs = Date.now() - startTime;

    // 5. Store Messages (Assistant response)
    const assistantMessage = await this.chatRepo.saveMessage({
      sessionId: new Types.ObjectId(sessionId),
      role: MessageRole.ASSISTANT,
      content: geminiResponse.response,
      tokenUsage: geminiResponse.tokenUsage,
      aiProvider: 'GEMINI',
      responseTimeMs,
    });

    // 6. Return Response
    return assistantMessage;
  }

  /**
   * Retrieves all messages belonging to a specific session.
   * @param sessionId The chat session ID.
   */
  /**
   * Retrieves all messages belonging to a specific session.
   * @param sessionId The chat session ID.
   */
  async getMessages(sessionId: string): Promise<IChatMessageDocument[]> {
    return await this.chatRepo.getMessages(sessionId);
  }

  /**
   * Streams a chat response token by token, invoking a callback for each chunk,
   * saving both user and assistant messages, and returning the final assistant message.
   * @param sessionId The active chat session ID.
   * @param userMessageContent The content of the user's message.
   * @param onChunk Callback function executed when a new text chunk is received.
   */
  async streamMessage(
    sessionId: string,
    userMessageContent: string,
    onChunk: (chunk: string) => void
  ): Promise<IChatMessageDocument> {
    if (!userMessageContent || userMessageContent.trim() === '') {
      throw new Error('Message content cannot be empty.');
    }

    // 1. Save user message to database first
    await this.chatRepo.saveMessage({
      sessionId: new Types.ObjectId(sessionId),
      role: MessageRole.USER,
      content: userMessageContent,
    });

    // 2. Load Context
    const context = await this.contextBuilder.buildContext(sessionId);

    // 3. Build Prompt
    const prompt = this.promptBuilder.buildPrompt(context);

    // 4. Stream from Gemini (measuring response time)
    const startTime = Date.now();
    const geminiResponse = await this.chatProvider.streamMessage(prompt, onChunk);
    const responseTimeMs = Date.now() - startTime;

    // 5. Store Assistant response message
    const assistantMessage = await this.chatRepo.saveMessage({
      sessionId: new Types.ObjectId(sessionId),
      role: MessageRole.ASSISTANT,
      content: geminiResponse.response,
      tokenUsage: geminiResponse.tokenUsage,
      aiProvider: 'GEMINI',
      responseTimeMs,
    });

    return assistantMessage;
  }

  /**
   * Retrieves all active chat sessions for a specific user.
   * @param userId The user ID.
   */
  async getUserSessions(userId: string): Promise<IChatSessionDocument[]> {
    return await this.chatRepo.getUserSessions(userId);
  }

  /**
   * Deletes a chat session and all of its associated messages.
   * @param sessionId The chat session ID.
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.chatRepo.deleteSession(sessionId);
  }
}

export const chatService = new ChatService();
