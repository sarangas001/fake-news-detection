export interface CreateNewsAnalysisDTO {

  content: string;

  sourceType:
    | "TEXT"
    | "ARTICLE"
    | "IMAGE"
    | "CHAT";
}

export interface AnalysisResponseDTO {

  analysisId: string;

  status: string;
}