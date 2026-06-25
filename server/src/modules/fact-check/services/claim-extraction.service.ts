import { z } from 'zod';
import { GeminiService, geminiService } from '../../../services/ai/gemini.service';

export class ClaimExtractionService {
  private readonly aiService: GeminiService;

  constructor(aiService: GeminiService = geminiService) {
    this.aiService = aiService;
  }

  async extractClaims(content: string): Promise<string[]> {
    if (!content || content.trim() === '') {
      throw new Error('Content is required for claim extraction.');
    }

    const prompt = `
Extract factual claims from the following article content.
Return JSON array only.

Example:
Input:
"Scientists discovered a cure for cancer."
Output:
[
  "Scientists discovered a cure for cancer"
]

Content:
${content}
    `;

    try {
      // Accessing the underlying genAI instance from the injected GeminiService
      const model = (this.aiService as any).genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      
      let text = result.response.text().trim();
      
      // Clean markdown code blocks if the model wrapped the JSON
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
      }

      const parsedData = JSON.parse(text);

      // Validate the JSON structure
      const claimsSchema = z.array(z.string().min(1));
      const validatedClaims = claimsSchema.parse(parsedData);

      return validatedClaims;
    } catch (error: any) {
      console.error('Claim extraction error:', error);
      throw new Error(`Failed to extract claims: ${error.message}`);
    }
  }
}

export const claimExtractionService = new ClaimExtractionService();
