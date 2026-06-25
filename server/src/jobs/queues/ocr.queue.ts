import { Queue } from 'bullmq';

export const OCR_QUEUE_NAME = 'ocr-queue';

export interface IOCRQueuePayload {
  imageAnalysisId: string;
}

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const ocrQueue = new Queue<IOCRQueuePayload>(OCR_QUEUE_NAME, {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 10s, 20s
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
      count: 500, // Hard ceiling to prevent Redis memory growth during prolonged failures
    },
  },
});
