import { Types } from 'mongoose';
import { claimExtractionService, ClaimExtractionService } from '../fact-check/services/claim-extraction.service';
import { factCheckService, FactCheckService } from '../fact-check/services/fact-check.service';
import { biasAnalysisService, BiasAnalysisService } from './services/bias-analysis.service';
import { credibilityEngineService, CredibilityEngineService } from './services/credibility-engine.service';
import { factCheckRepository, FactCheckRepository } from '../fact-check/fact-check.repository';
import { newsAnalysisRepository, NewsAnalysisRepository } from '../news-analysis/news-analysis.repository';

// Mocked SourceAnalysisService for Step 4 until implemented
export class SourceAnalysisService {
  async analyzeSource(url?: string): Promise<{ sourceScore: number }> {
    // Basic mock implementation
    return { sourceScore: 70 };
  }
}

const defaultSourceAnalysisService = new SourceAnalysisService();

export class IntelligenceService {
  constructor(
    private readonly newsAnalysisRepo: NewsAnalysisRepository = newsAnalysisRepository,
    private readonly claimExtractor: ClaimExtractionService = claimExtractionService,
    private readonly factChecker: FactCheckService = factCheckService,
    private readonly biasAnalyzer: BiasAnalysisService = biasAnalysisService,
    private readonly sourceAnalyzer: SourceAnalysisService = defaultSourceAnalysisService,
    private readonly credibilityEngine: CredibilityEngineService = credibilityEngineService,
    private readonly factCheckRepo: FactCheckRepository = factCheckRepository
  ) {}

  async generateReport(analysisId: string): Promise<any> {
    try {
      // Fetch the original news content
      const analysisRecord = await this.newsAnalysisRepo.findById(analysisId);
      
      if (!analysisRecord) {
        throw new Error(`Analysis record not found for id: ${analysisId}`);
      }
      
      const content = analysisRecord.originalContent || analysisRecord.extractedContent;
      if (!content) {
        throw new Error('No content available for analysis');
      }

      // Step 1: Extract Claims
      const claims = await this.claimExtractor.extractClaims(content);

      // Step 2: Fact Check Claims
      const factCheckPromises = claims.map(async (claim) => {
        const result = await this.factChecker.checkClaim(claim);
        return { claim, result };
      });
      const factCheckResults = await Promise.all(factCheckPromises);

      // Step 3: Bias Analysis
      const biasAnalysis = await this.biasAnalyzer.analyzeBias(content);

      // Step 4: Source Analysis
      const sourceAnalysis = await this.sourceAnalyzer.analyzeSource(analysisRecord.sourceUrl);

      // Calculate aggregate scores for the Credibility Engine
      const validFactScores = factCheckResults
        .filter((fc) => fc.result.confidenceScore > 0)
        .map((fc) => fc.result.confidenceScore);
        
      const avgFactScore = validFactScores.length > 0
        ? validFactScores.reduce((acc, score) => acc + score, 0) / validFactScores.length
        : 50; // Fallback if no verified facts

      // Derive aiScore from lack of propaganda and clickbait
      const aiScore = 100 - ((biasAnalysis.propagandaScore + biasAnalysis.clickbaitScore) / 2);

      // Derive biasScore metric (higher emotionality = lower bias score)
      const biasScoreMetric = 100 - biasAnalysis.emotionalScore;

      // Step 5: Credibility Calculation
      const credibilityResult = this.credibilityEngine.calculateScore({
        aiScore: aiScore,
        factScore: avgFactScore,
        sourceScore: sourceAnalysis.sourceScore,
        biasScore: biasScoreMetric
      });

      // Step 6: Save Reports
      // 6a. Save individual fact check reports
      const objectId = new Types.ObjectId(analysisId);
      for (const fc of factCheckResults) {
        await this.factCheckRepo.create({
          analysisId: objectId,
          claim: fc.claim,
          verdict: fc.result.verdict,
          confidenceScore: fc.result.confidenceScore,
          explanation: fc.result.explanation,
          sourceUrl: fc.result.sourceUrl,
          publisher: fc.result.publisher
        });
      }

      // Return the consolidated intelligence report
      return {
        analysisId,
        credibilityResult,
        biasAnalysis,
        factCheckResults,
        claimsExtracted: claims.length
      };

    } catch (error: any) {
      console.error('Error generating intelligence report:', error);
      throw new Error(`Intelligence generation failed: ${error.message}`);
    }
  }
}

export const intelligenceService = new IntelligenceService();
