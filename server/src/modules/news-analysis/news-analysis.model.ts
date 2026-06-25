import { Schema, model } from 'mongoose';
import { INewsAnalysisDocument } from './news-analysis.types';
import { NewsAnalysisConstants } from './news-analysis.constants';

const newsAnalysisSchema = new Schema<INewsAnalysisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    contentType: {
      type: String,
      enum: Object.values(NewsAnalysisConstants.CONTENT_TYPES),
      required: true,
    },
    originalContent: {
      type: String,
    },
    extractedContent: {
      type: String,
    },
    sourceUrl: {
      type: String,
    },
    classification: {
      type: String,
      enum: Object.values(NewsAnalysisConstants.CLASSIFICATION),
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    credibilityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: Object.values(NewsAnalysisConstants.RISK_LEVELS),
    },
    summary: {
      type: String,
    },
    explanation: {
      type: String,
    },
    aiProvider: {
      type: String,
      default: NewsAnalysisConstants.AI_PROVIDER,
    },
    processingStatus: {
      type: String,
      enum: Object.values(NewsAnalysisConstants.PROCESSING_STATUS),
      default: NewsAnalysisConstants.PROCESSING_STATUS.PENDING,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
newsAnalysisSchema.index({ userId: 1, createdAt: -1 });
newsAnalysisSchema.index({ processingStatus: 1 });

export const NewsAnalysis = model<INewsAnalysisDocument>('NewsAnalysis', newsAnalysisSchema);
