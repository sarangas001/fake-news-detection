import { Worker, Job } from 'bullmq';
import { Types } from 'mongoose';
import { OCR_QUEUE_NAME, IOCRQueuePayload } from '../queues/ocr.queue';
import { imageAnalysisRepository } from '../../modules/image-analysis/image-analysis.repository';
import { ProcessingStatus } from '../../modules/image-analysis/image-analysis.model';
import { ocrProvider } from '../../services/ocr/ocr.factory';
import { newsAnalysisService } from '../../modules/news-analysis/news-analysis.service';
import { NewsAnalysisConstants } from '../../modules/news-analysis/news-analysis.constants';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const ocrWorker = new Worker<IOCRQueuePayload>(
  OCR_QUEUE_NAME,
  async (job: Job<IOCRQueuePayload>) => {
    const { imageAnalysisId } = job.data;

    try {
      // Step 1: Load image record
      const imageRecord = await imageAnalysisRepository.findById(imageAnalysisId);
      if (!imageRecord) {
        throw new Error(`Image analysis record not found: ${imageAnalysisId}`);
      }

      if (!imageRecord.imageUrl) {
        throw new Error(`No image URL found for record: ${imageAnalysisId}`);
      }

      // Step 2: Update status to PROCESSING
      await imageAnalysisRepository.updateStatus(imageAnalysisId, ProcessingStatus.PROCESSING);

      // Step 3: OCR extraction
      const ocrResult = await ocrProvider.extractText(imageRecord.imageUrl);

      if (!ocrResult.text || ocrResult.text.trim() === '') {
        throw new Error('OCR extraction returned empty text.');
      }

      // Step 4: Save extracted text and OCR confidence
      await imageAnalysisRepository.update(imageAnalysisId, {
        extractedText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
      });

      // Step 5: Create News Analysis via NewsAnalysisService.createAnalysis()
      // contentType = OCR, content = extractedText
      const analysisResponse = await newsAnalysisService.createAnalysis(
        String(imageRecord.userId),
        {
          contentType: NewsAnalysisConstants.CONTENT_TYPES.OCR,
          content: ocrResult.text,
        }
      );

      // Step 6: Save returned analysisId into linkedAnalysisId
      await imageAnalysisRepository.update(imageAnalysisId, {
        linkedAnalysisId: new Types.ObjectId(analysisResponse.analysisId),
      });

      // Step 7: Mark COMPLETED
      await imageAnalysisRepository.updateStatus(imageAnalysisId, ProcessingStatus.COMPLETED);

    } catch (error: any) {
      console.error(`[OCR Worker] Job ${job.id} failed:`, error.message);

      // Mark FAILED with error message
      await imageAnalysisRepository.updateStatus(
        imageAnalysisId,
        ProcessingStatus.FAILED,
        error.message
      );

      throw error; // Re-throw so BullMQ registers the failure and applies retry logic
    }
  },
  {
    connection: redisConfig,
  }
);

ocrWorker.on('completed', (job) => {
  console.log(`[OCR Worker] Job ${job.id} completed successfully.`);
});

ocrWorker.on('failed', (job, err) => {
  console.error(`[OCR Worker] Job ${job?.id} failed: ${err.message}`);
});
