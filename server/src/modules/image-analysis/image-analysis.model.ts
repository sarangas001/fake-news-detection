import { Schema, model } from "mongoose";

const imageAnalysisSchema =
new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  imageUrl: {
    type: String,
    required: true
  },

  storageKey: {
    type: String,
    required: true
  },

  originalFileName: {
    type: String
  },

  fileSize: {
    type: Number
  },

  mimeType: {
    type: String
  },

  extractedText: {
    type: String
  },

  ocrConfidence: {
    type: Number
  },

  linkedAnalysisId: {
    type: Schema.Types.ObjectId,
    ref: "NewsAnalysis"
  },

  processingStatus: {
    type: String,
    enum: [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED"
    ],
    default: "PENDING"
  },

  errorMessage: String
},
{
 timestamps: true
});

imageAnalysisSchema.index({
 userId: 1,
 createdAt: -1
});