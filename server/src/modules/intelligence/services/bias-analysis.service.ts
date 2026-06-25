import { z } from 'zod';
import { GeminiService, geminiService } from '../../../services/ai/gemini.service';

export const biasAnalysisSchema = z.object({
  politicalBias: z.string(),
  emotionalScore: z.number().min(0).max(100),
  clickbaitScore: z.number().min(0).max(100),
  propagandaScore: z.number().min(0).max(100),
  explanation: z.string(),
});

export type BiasAnalysisResult = z.infer<typeof biasAnalysisSchema>;

export class BiasAnalysisService {
  private readonly aiService: GeminiService;

  constructor(aiService: GeminiService = geminiService) {
    this.aiService = aiService;
  }

  async analyzeBias(content: string): Promise<BiasAnalysisResult> {
    if (!content || content.trim() === '') {
      throw new Error('Content is required for bias analysis.');
    }

    const prompt = `
Analyze the following article content for various forms of bias.
Determine the political bias (e.g., "LEFT", "RIGHT", "CENTER", "NONE"), emotional score (0-100), clickbait score (0-100), and propaganda score (0-100).
Provide a brief explanation for your analysis.

Return JSON only in the exact following format:
{
  "politicalBias": "CENTER",
  "emotionalScore": 50,
  "clickbaitScore": 20,
  "propagandaScore": 10,
  "explanation": "Detailed explanation of the findings..."
}

Content:
${content}
    `;

    try {
      // Assuming GeminiService exposes the genAI property for generic access.
      const model = (this.aiService as any).genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      
      let text = result.response.text().trim();
      
      // Clean up markdown wrapping if present
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
      }

      const parsedData = JSON.parse(text);

      // Validate the response against the schema
      const validatedData = biasAnalysisSchema.parse(parsedData);

      return validatedData;
    } catch (error: any) {
      console.error('Bias analysis error:', error);
      throw new Error(`Failed to analyze bias: ${error.message}`);
    }
  }
}

export const biasAnalysisService = new BiasAnalysisService();
