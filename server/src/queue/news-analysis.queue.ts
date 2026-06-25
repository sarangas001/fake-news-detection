import { Queue } from 'bullmq';
import { NewsAnalysisConstants } from '../modules/news-analysis/news-analysis.constants';
import { IQueuePayload } from '../modules/news-analysis/news-analysis.types';

// Assuming Redis connection details are handled via env variables or an existing config
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const newsAnalysisQueue = new Queue<IQueuePayload>(NewsAnalysisConstants.QUEUE_NAME, {
  connection: redisConfig,
});
