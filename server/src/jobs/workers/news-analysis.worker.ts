import { Worker, Job } from 'bullmq';
import { NewsAnalysisConstants } from '../../modules/news-analysis/news-analysis.constants';
import { IQueuePayload } from '../../modules/news-analysis/news-analysis.types';
import { newsAnalysisRepository } from '../../modules/news-analysis/news-analysis.repository';
import { geminiService } from '../../services/ai/gemini.service';
import { intelligenceService } from '../../modules/intelligence/intelligence.service';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const newsAnalysisWorker = new Worker<IQueuePayload>(
  NewsAnalysisConstants.QUEUE_NAME,
  async (job: Job<IQueuePayload>) => {
    const { analysisId } = job.data;

    try {
      // 1. Load analysis
      const analysis = await newsAnalysisRepository.findById(analysisId);
      if (!analysis) {
        throw new Error(`Analysis record not found for id: ${analysisId}`);
      }

      // 2. Update status PROCESSING
      await newsAnalysisRepository.updateStatus(analysisId, NewsAnalysisConstants.PROCESSING_STATUS.PROCESSING);

      // Determine content to analyze
      let contentToAnalyze = analysis.originalContent;
      if (analysis.contentType === 'URL') {
        // Fallback if scraping isn't fully implemented
        contentToAnalyze = analysis.sourceUrl || analysis.originalContent; 
      }

      if (!contentToAnalyze) {
        throw new Error('No content available to analyze');
      }

      // 3. Gemini Analysis (Base Analysis)
      const aiResult = await geminiService.analyzeNews(contentToAnalyze);

      // 4. Intelligence Service
      // This internally handles: Fact Checking -> Bias Analysis -> Credibility Engine
      const intelResult = await intelligenceService.generateReport(analysisId);

      // 5. Save Final Report
      await newsAnalysisRepository.update(analysisId, {
        classification: aiResult.classification,
        summary: aiResult.summary,
        explanation: aiResult.explanation,
        // Override the basic Gemini scores with our robust Credibility Engine scores
        confidenceScore: intelResult.credibilityResult.credibilityScore,
        credibilityScore: intelResult.credibilityResult.credibilityScore,
        riskLevel: intelResult.credibilityResult.riskLevel,
      });

      // 6. Mark COMPLETED
      await newsAnalysisRepository.updateStatus(analysisId, NewsAnalysisConstants.PROCESSING_STATUS.COMPLETED);

    } catch (error: any) {
      console.error(`Error processing news analysis job ${job.id}:`, error);
      
      // Mark FAILED
      await newsAnalysisRepository.updateStatus(
        analysisId, 
        NewsAnalysisConstants.PROCESSING_STATUS.FAILED, 
        error.message
      );
      
      throw error;
    }
  },
  {
    connection: redisConfig,
  }
);

newsAnalysisWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

newsAnalysisWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with ${err.message}`);
});
