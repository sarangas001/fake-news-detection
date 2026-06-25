import { chatRepository, ChatRepository } from '../chat.repository';
import { newsAnalysisRepository, NewsAnalysisRepository } from '../../news-analysis/news-analysis.repository';
import { factCheckRepository, FactCheckRepository } from '../../fact-check/fact-check.repository';
import { IChatMessageDocument } from '../chat-message.model';
import { INewsAnalysisDocument } from '../../news-analysis/news-analysis.types';
import { IFactCheckReportDocument } from '../../fact-check/fact-check-report.model';

export interface ConversationContext {
  messages: IChatMessageDocument[];
  analysis: INewsAnalysisDocument | null;
  factChecks: IFactCheckReportDocument[];
  bias: Record<string, any>;
  credibility: Record<string, any>;
}

export class ContextBuilderService {
  constructor(
    private readonly chatRepo: ChatRepository = chatRepository,
    private readonly newsAnalysisRepo: NewsAnalysisRepository = newsAnalysisRepository,
    private readonly factCheckRepo: FactCheckRepository = factCheckRepository
  ) {}

  async buildContext(sessionId: string): Promise<ConversationContext> {
    // Load chat session to find the linked analysis
    const session = await this.chatRepo.findSession(sessionId);

    if (!session) {
      throw new Error(`Chat session not found: ${sessionId}`);
    }

    // Load chat history (chronological)
    const messages = await this.chatRepo.getMessages(sessionId);

    // Load linked news analysis if one exists on the session
    let analysis: INewsAnalysisDocument | null = null;
    let factChecks: IFactCheckReportDocument[] = [];
    let bias: Record<string, any> = {};
    let credibility: Record<string, any> = {};

    if (session.linkedAnalysisId) {
      const analysisId = String(session.linkedAnalysisId);

      // Load news analysis
      analysis = await this.newsAnalysisRepo.findById(analysisId);

      if (analysis) {
        // Load fact check reports for this analysis
        factChecks = await this.factCheckRepo.findByAnalysisId(analysisId);

        // Extract bias data from analysis record fields
        bias = {
          riskLevel: analysis.riskLevel ?? null,
          credibilityScore: analysis.credibilityScore ?? null,
          confidenceScore: analysis.confidenceScore ?? null,
        };

        // Extract credibility data
        credibility = {
          credibilityScore: analysis.credibilityScore ?? null,
          riskLevel: analysis.riskLevel ?? null,
          classification: analysis.classification ?? null,
          processingStatus: analysis.processingStatus,
        };
      }
    }

    return {
      messages,
      analysis,
      factChecks,
      bias,
      credibility,
    };
  }
}

export const contextBuilderService = new ContextBuilderService();
