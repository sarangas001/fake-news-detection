export interface CredibilityInputs {
  aiScore: number;
  factScore: number;
  sourceScore: number;
  biasScore: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CredibilityResult {
  credibilityScore: number;
  riskLevel: RiskLevel;
}

export class CredibilityEngineService {
  private readonly WEIGHTS = {
    AI_ANALYSIS: 0.40,
    FACT_CHECK: 0.30,
    SOURCE_SCORE: 0.20,
    BIAS_SCORE: 0.10,
  };

  calculateScore(inputs: CredibilityInputs): CredibilityResult {
    const { aiScore, factScore, sourceScore, biasScore } = inputs;

    // Calculate weighted score
    const rawScore = 
      (aiScore * this.WEIGHTS.AI_ANALYSIS) +
      (factScore * this.WEIGHTS.FACT_CHECK) +
      (sourceScore * this.WEIGHTS.SOURCE_SCORE) +
      (biasScore * this.WEIGHTS.BIAS_SCORE);

    // Round to nearest whole number to ensure score is between 0-100
    // Assuming inputs are 0-100
    const credibilityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Determine risk level based on rules
    // 0-30 HIGH
    // 31-70 MEDIUM
    // 71-100 LOW
    let riskLevel: RiskLevel;
    
    if (credibilityScore <= 30) {
      riskLevel = 'HIGH';
    } else if (credibilityScore <= 70) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      credibilityScore,
      riskLevel,
    };
  }
}

export const credibilityEngineService = new CredibilityEngineService();
