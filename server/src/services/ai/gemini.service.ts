import { GoogleGenerativeAI } from '@google/generative-ai';
import { IGeminiAnalysisResult } from '../../modules/news-analysis/news-analysis.types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async analyzeNews(content: string): Promise<IGeminiAnalysisResult> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
Analyze the following news content.
Determine:
1. Classification
2. Confidence Score
3. Credibility Score
4. Risk Level
5. Summary
6. Detailed Explanation

Return JSON only.
Expected JSON:
{
 "classification":"FAKE",
 "confidenceScore":90,
 "credibilityScore":20,
 "riskLevel":"HIGH",
 "summary":"...",
 "explanation":"..."
}

News Content:
${content}
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();
      
      // Clean markdown formatting if Gemini returns json wrapped in markdown block
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/\`\`\`json/, '').replace(/\`\`\`$/, '');
      } else if (text.startsWith('\`\`\`')) {
        text = text.replace(/\`\`\`/, '').replace(/\`\`\`$/, '');
      }

      const parsedResponse = JSON.parse(text) as IGeminiAnalysisResult;
      
      return parsedResponse;
    } catch (error: any) {
      console.error('Error in Gemini API analysis:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();
