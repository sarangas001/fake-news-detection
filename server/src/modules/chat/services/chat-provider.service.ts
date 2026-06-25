import { GeminiService, geminiService } from '../../../services/ai/gemini.service';

export interface ChatResponse {
  response: string;
  tokenUsage: number;
}

export class ChatProviderService {
  private readonly aiService: GeminiService;
  private readonly modelName = 'gemini-1.5-pro';

  constructor(aiService: GeminiService = geminiService) {
    this.aiService = aiService;
  }

  /**
   * Sends a chat message to Gemini and returns the complete response and token usage.
   * @param prompt The message or prompt to send.
   */
  async sendMessage(prompt: string): Promise<ChatResponse> {
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required.');
    }

    try {
      const model = (this.aiService as any).genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      let tokenUsage = response.usageMetadata?.totalTokenCount;
      if (tokenUsage === undefined) {
        // Fallback token counting
        const inputCount = await model.countTokens(prompt);
        const outputCount = await model.countTokens(text);
        tokenUsage = (inputCount.totalTokens || 0) + (outputCount.totalTokens || 0);
      }

      return {
        response: text,
        tokenUsage,
      };
    } catch (error: any) {
      console.error('Error in ChatProviderService.sendMessage:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Streams a chat message from Gemini, calling the optional onChunk callback as pieces arrive,
   * and returns the complete response and token usage once finished.
   * @param prompt The message or prompt to send.
   * @param onChunk Optional callback function to receive response chunks.
   */
  async streamMessage(prompt: string, onChunk?: (chunk: string) => void): Promise<ChatResponse> {
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt is required.');
    }

    try {
      const model = (this.aiService as any).genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContentStream(prompt);
      
      let responseText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        responseText += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }

      const response = await result.response;
      let tokenUsage = response.usageMetadata?.totalTokenCount;
      if (tokenUsage === undefined) {
        // Fallback token counting
        const inputCount = await model.countTokens(prompt);
        const outputCount = await model.countTokens(responseText);
        tokenUsage = (inputCount.totalTokens || 0) + (outputCount.totalTokens || 0);
      }

      return {
        response: responseText,
        tokenUsage,
      };
    } catch (error: any) {
      console.error('Error in ChatProviderService.streamMessage:', error);
      throw new Error(`Failed to stream message: ${error.message}`);
    }
  }
}

export const chatProviderService = new ChatProviderService();
