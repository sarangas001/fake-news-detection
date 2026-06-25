import { GeminiService, geminiService } from '../../../services/ai/gemini.service';

export interface ChatResponse {
  response: string;
  tokenUsage: number;
}

export class ChatProviderService {
  private readonly aiService: GeminiService;
  private readonly modelName = 'gemini-1.5-pro';
  private readonly requestTimeoutMs = 30000; // 30 seconds timeout for Gemini API requests

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const model = (this.aiService as any).genAI.getGenerativeModel({ model: this.modelName });
      
      const result = await model.generateContent(prompt, {
        signal: controller.signal,
        requestOptions: { signal: controller.signal },
      } as any);

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
      if (error.name === 'AbortError') {
        console.error(`[Gemini Timeout] sendMessage request exceeded ${this.requestTimeoutMs}ms limit.`);
        throw new Error(`Gemini request timed out after ${this.requestTimeoutMs / 1000} seconds.`);
      }
      console.error('Error in ChatProviderService.sendMessage:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const model = (this.aiService as any).genAI.getGenerativeModel({ model: this.modelName });
      
      const result = await model.generateContentStream(prompt, {
        signal: controller.signal,
        requestOptions: { signal: controller.signal },
      } as any);
      
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
      if (error.name === 'AbortError') {
        console.error(`[Gemini Timeout] streamMessage request exceeded ${this.requestTimeoutMs}ms limit.`);
        throw new Error(`Gemini streaming request timed out after ${this.requestTimeoutMs / 1000} seconds.`);
      }
      console.error('Error in ChatProviderService.streamMessage:', error);
      throw new Error(`Failed to stream message: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const chatProviderService = new ChatProviderService();
