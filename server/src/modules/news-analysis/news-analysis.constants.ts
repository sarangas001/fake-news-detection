export const NewsAnalysisConstants = {
  CONTENT_TYPES: {
    TEXT: 'TEXT',
    URL: 'URL',
    OCR: 'OCR',
  },
  CLASSIFICATION: {
    REAL: 'REAL',
    FAKE: 'FAKE',
    MISLEADING: 'MISLEADING',
    UNVERIFIED: 'UNVERIFIED',
  },
  RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
  },
  PROCESSING_STATUS: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },
  AI_PROVIDER: 'GEMINI',
} as const;
