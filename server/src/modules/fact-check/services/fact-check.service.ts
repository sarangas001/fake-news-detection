import { FactCheckVerdict } from '../fact-check-report.model';

export interface FactCheckResult {
  verdict: FactCheckVerdict;
  confidenceScore: number;
  explanation: string;
  publisher: string;
  sourceUrl: string;
}

export interface FactCheckProvider {
  checkClaim(claim: string): Promise<FactCheckResult>;
}

export class GoogleFactCheckProvider implements FactCheckProvider {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY || '';
  }

  async checkClaim(claim: string): Promise<FactCheckResult> {
    if (!this.apiKey) {
      console.warn('GOOGLE_FACT_CHECK_API_KEY is missing. Returning UNVERIFIED.');
      return this.getUnverifiedFallback('API Key missing, unable to verify claim.');
    }

    try {
      const url = new URL('https://factchecktools.googleapis.com/v1alpha1/claims:search');
      url.searchParams.append('query', claim);
      url.searchParams.append('key', this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Fact Check API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.claims || data.claims.length === 0) {
        return this.getUnverifiedFallback('No fact-check results found for this claim.');
      }

      const topClaim = data.claims[0];
      const review = topClaim.claimReview && topClaim.claimReview[0];

      if (!review) {
        return this.getUnverifiedFallback('Claim found but no review attached.');
      }

      const textualRating = review.textualRating ? review.textualRating.toLowerCase() : '';
      let verdict = FactCheckVerdict.UNVERIFIED;
      let score = 50;

      if (textualRating.includes('true') && !textualRating.includes('mostly') && !textualRating.includes('half') && !textualRating.includes('partly')) {
        verdict = FactCheckVerdict.TRUE;
        score = 90;
      } else if (textualRating.includes('false') || textualRating.includes('pants on fire')) {
        verdict = FactCheckVerdict.FALSE;
        score = 90;
      } else if (textualRating.includes('partly') || textualRating.includes('mostly') || textualRating.includes('half')) {
        verdict = FactCheckVerdict.PARTIALLY_TRUE;
        score = 70;
      } else if (textualRating.includes('misleading')) {
        verdict = FactCheckVerdict.MISLEADING;
        score = 80;
      }

      return {
        verdict,
        confidenceScore: score,
        explanation: review.title || textualRating || 'Fact check review found.',
        publisher: review.publisher?.name || 'Unknown',
        sourceUrl: review.url || '',
      };
    } catch (error: any) {
      console.error('Error in GoogleFactCheckProvider:', error.message);
      return this.getUnverifiedFallback(`Error checking claim: ${error.message}`);
    }
  }

  private getUnverifiedFallback(explanation: string): FactCheckResult {
    return {
      verdict: FactCheckVerdict.UNVERIFIED,
      confidenceScore: 0,
      explanation,
      publisher: 'System',
      sourceUrl: '',
    };
  }
}

export class FactCheckService {
  private readonly provider: FactCheckProvider;

  constructor(provider: FactCheckProvider = new GoogleFactCheckProvider()) {
    this.provider = provider;
  }

  async checkClaim(claim: string): Promise<FactCheckResult> {
    if (!claim || claim.trim() === '') {
      throw new Error('Claim string cannot be empty.');
    }
    
    return await this.provider.checkClaim(claim);
  }
}

export const factCheckService = new FactCheckService();
