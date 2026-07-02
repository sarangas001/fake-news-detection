import { Document, Types } from 'mongoose';
import { NewsAnalysisConstants } from './news-analysis.constants';

export type ContentType = keyof typeof NewsAnalysisConstants.CONTENT_TYPES;
export type ClassificationType = keyof typeof NewsAnalysisConstants.CLASSIFICATION;
export type RiskLevel = keyof typeof NewsAnalysisConstants.RISK_LEVELS;
export type ProcessingStatus = keyof typeof NewsAnalysisConstants.PROCESSING_STATUS;

export interface INewsAnalysis {
  userId: Types.ObjectId | string;
  contentType: ContentType;
  originalContent?: string;
  extractedContent?: string;
  sourceUrl?: string;
  classification?: ClassificationType;
  confidenceScore?: number;
  credibilityScore?: number;
  riskLevel?: RiskLevel;
  summary?: string;
  explanation?: string;
  aiProvider?: string;
  processingStatus: ProcessingStatus;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INewsAnalysisDocument extends INewsAnalysis, Document {}

export interface IGeminiAnalysisResult {
  classification: ClassificationType;
  confidenceScore: number;
  credibilityScore: number;
  riskLevel: RiskLevel;
  summary: string;
  explanation: string;
}
