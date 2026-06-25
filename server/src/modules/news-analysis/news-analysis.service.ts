import { newsAnalysisRepository } from './news-analysis.repository';
import { CreateAnalysisDTO, AnalysisResponseDTO } from './news-analysis.dto';
import { newsAnalysisQueue } from '../../queue/news-analysis.queue';
import { NewsAnalysisConstants } from './news-analysis.constants';
import { INewsAnalysisDocument } from './news-analysis.types';

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

    // 3. Add BullMQ job
    await newsAnalysisQueue.add('analyze', {
      analysisId: String(analysisRecord._id),
    });

    // 4. Return analysisId
    return {
      analysisId: String(analysisRecord._id),
      processingStatus: analysisRecord.processingStatus,
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
