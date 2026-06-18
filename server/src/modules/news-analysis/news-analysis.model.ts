import { Schema, model } from "mongoose";

const newsAnalysisSchema = new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String,
    required: true
  },

  sourceType: {
    type: String,
    enum: [
      "TEXT",
      "ARTICLE",
      "IMAGE",
      "CHAT"
    ],
    default: "TEXT"
  },

  status: {
    type: String,
    enum: [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED"
    ],
    default: "PENDING"
  },

  classification: {
    type: String,
    enum: [
      "REAL",
      "FAKE",
      "MISLEADING",
      "UNVERIFIED"
    ]
  },

  confidenceScore: Number,

  credibilityScore: Number,

  riskLevel: {
    type: String,
    enum: [
      "LOW",
      "MEDIUM",
      "HIGH"
    ]
  },

  summary: String,

  explanation: String,

  aiProvider: String,

  completedAt: Date
},
{
  timestamps: true
});

newsAnalysisSchema.index({
  userId: 1,
  createdAt: -1
});