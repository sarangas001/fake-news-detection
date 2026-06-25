import { Queue } from 'bullmq';

export const IMAGE_ANALYSIS_QUEUE_NAME = 'image-analysis';

export interface IImageAnalysisQueuePayload {
  imageAnalysisId: string;
}

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const imageAnalysisQueue = new Queue<IImageAnalysisQueuePayload>(
  IMAGE_ANALYSIS_QUEUE_NAME,
  {
    connection: redisConfig,
  }
);
