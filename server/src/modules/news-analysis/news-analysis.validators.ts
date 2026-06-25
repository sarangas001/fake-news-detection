import { z } from 'zod';
import { NewsAnalysisConstants } from './news-analysis.constants';

export const createAnalysisSchema = z.object({
  body: z.object({
    contentType: z.enum([
      NewsAnalysisConstants.CONTENT_TYPES.TEXT,
      NewsAnalysisConstants.CONTENT_TYPES.URL,
      NewsAnalysisConstants.CONTENT_TYPES.OCR,
    ]),
    content: z
      .string()
      .min(20, 'Content must be at least 20 characters long')
      .max(50000, 'Content cannot exceed 50000 characters'),
  }),
});
