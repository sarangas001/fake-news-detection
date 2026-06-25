import { ContentType } from './news-analysis.types';

export interface CreateAnalysisDTO {
  contentType: ContentType;
  content: string;
}

export interface AnalysisResponseDTO {
  analysisId: string;
  processingStatus: string;
}
