import mongoose, { Document, Schema, Types, Model } from 'mongoose';

export enum FactCheckVerdict {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  PARTIALLY_TRUE = 'PARTIALLY_TRUE',
  MISLEADING = 'MISLEADING',
  UNVERIFIED = 'UNVERIFIED',
}

export interface IFactCheckReport {
  analysisId: Types.ObjectId;
  claim: string;
  verdict: FactCheckVerdict;
  confidenceScore?: number;
  explanation?: string;
  sourceUrl?: string;
  publisher?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFactCheckReportDocument extends IFactCheckReport, Document {}

const FactCheckReportSchema = new Schema<IFactCheckReportDocument>(
  {
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: 'NewsAnalysis',
      required: [true, 'Analysis ID is required'],
      index: true,
    },
    claim: {
      type: String,
      required: [true, 'Claim is required'],
      trim: true,
      index: true,
    },
    verdict: {
      type: String,
      enum: Object.values(FactCheckVerdict),
      required: [true, 'Verdict is required'],
      index: true,
    },
    confidenceScore: {
      type: Number,
      min: [0, 'Confidence score cannot be less than 0'],
      max: [100, 'Confidence score cannot be more than 100'],
    },
    explanation: {
      type: String,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'fact_check_reports',
  }
);

// Compound index for efficient querying by verdict and score
FactCheckReportSchema.index({ verdict: 1, confidenceScore: -1 });

export const FactCheckReport: Model<IFactCheckReportDocument> = 
  mongoose.models.FactCheckReport || 
  mongoose.model<IFactCheckReportDocument>('FactCheckReport', FactCheckReportSchema);
