import { INewsAnalysis, INewsAnalysisDocument, ProcessingStatus } from './news-analysis.types';
import { NewsAnalysis } from './news-analysis.model';

export class NewsAnalysisRepository {
  async create(data: Partial<INewsAnalysis>): Promise<INewsAnalysisDocument> {
    const analysis = new NewsAnalysis(data);
    return await analysis.save();
  }

  async findById(id: string): Promise<INewsAnalysisDocument | null> {
    return await NewsAnalysis.findById(id).exec();
  }

  async update(id: string, data: Partial<INewsAnalysis>): Promise<INewsAnalysisDocument | null> {
    return await NewsAnalysis.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStatus(id: string, status: ProcessingStatus, errorMessage?: string): Promise<INewsAnalysisDocument | null> {
    const updateData: any = { processingStatus: status };
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    if (status === 'PROCESSING') {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date();
    }
    
    return await NewsAnalysis.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async getUserHistory(userId: string): Promise<INewsAnalysisDocument[]> {
    return await NewsAnalysis.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await NewsAnalysis.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const newsAnalysisRepository = new NewsAnalysisRepository();
