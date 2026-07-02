import { newsAnalysisRepository } from './news-analysis.repository';
import { CreateAnalysisDTO, AnalysisResponseDTO } from './news-analysis.dto';
import { NewsAnalysisConstants } from './news-analysis.constants';
import { INewsAnalysisDocument } from './news-analysis.types';
import { geminiService } from '../../services/ai/gemini.service';
import { intelligenceService } from '../intelligence/intelligence.service';

export class NewsAnalysisService {
  async createAnalysis(userId: string, data: CreateAnalysisDTO): Promise<AnalysisResponseDTO> {
    // 1. Validate request (implicitly handled by Zod validator middleware in router)
    
    // 2. Create DB record
    let originalContent = '';
    let sourceUrl = '';
    
    if (data.contentType === NewsAnalysisConstants.CONTENT_TYPES.URL) {
      sourceUrl = data.content;
    } else {
      originalContent = data.content;
    }

    const analysisRecord = await newsAnalysisRepository.create({
      userId,
      contentType: data.contentType,
      originalContent: originalContent,
      sourceUrl: sourceUrl,
      processingStatus: NewsAnalysisConstants.PROCESSING_STATUS.PENDING,
    });

    const analysisId = String(analysisRecord._id);

    try {
      await newsAnalysisRepository.updateStatus(
        analysisId,
        NewsAnalysisConstants.PROCESSING_STATUS.PROCESSING
      );

      const contentToAnalyze = sourceUrl || originalContent;
      if (!contentToAnalyze) {
        throw new Error('No content available to analyze');
      }

      const aiResult = await geminiService.analyzeNews(contentToAnalyze);
      const intelResult = await intelligenceService.generateReport(analysisId);

      await newsAnalysisRepository.update(analysisId, {
        classification: aiResult.classification,
        summary: aiResult.summary,
        explanation: aiResult.explanation,
        confidenceScore: intelResult.credibilityResult.credibilityScore,
        credibilityScore: intelResult.credibilityResult.credibilityScore,
        riskLevel: intelResult.credibilityResult.riskLevel,
      });

      await newsAnalysisRepository.updateStatus(
        analysisId,
        NewsAnalysisConstants.PROCESSING_STATUS.COMPLETED
      );
    } catch (error: any) {
      await newsAnalysisRepository.updateStatus(
        analysisId,
        NewsAnalysisConstants.PROCESSING_STATUS.FAILED,
        error.message
      );

      throw error;
    }

    // 3. Return the created analysis
    return {
      analysisId,
      processingStatus: NewsAnalysisConstants.PROCESSING_STATUS.COMPLETED,
    };
  }

  async getAnalysis(id: string): Promise<INewsAnalysisDocument | null> {
    return await newsAnalysisRepository.findById(id);
  }

  async getUserHistory(userId: string): Promise<INewsAnalysisDocument[]> {
    return await newsAnalysisRepository.getUserHistory(userId);
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    return await newsAnalysisRepository.delete(id);
  }
}

export const newsAnalysisService = new NewsAnalysisService();
