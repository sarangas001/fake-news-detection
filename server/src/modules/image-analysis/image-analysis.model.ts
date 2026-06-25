import mongoose, { Document, Schema, Model } from 'mongoose';

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IImageAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl?: string;
  storageKey?: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  extractedText?: string;
  ocrConfidence?: number;
  linkedAnalysisId?: mongoose.Types.ObjectId;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageAnalysisSchema = new Schema<IImageAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
    },
    storageKey: {
      type: String,
    },
    originalFileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    extractedText: {
      type: String,
    },
    ocrConfidence: {
      type: Number,
    },
    linkedAnalysisId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    processingStatus: {
      type: String,
      enum: Object.values(ProcessingStatus),
      default: ProcessingStatus.PENDING,
      required: true,
      index: true,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common query pattern (fetching recent analyses for a user)
ImageAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ImageAnalysis: Model<IImageAnalysis> = mongoose.model<IImageAnalysis>(
  'ImageAnalysis',
  ImageAnalysisSchema
);
