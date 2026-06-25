import { ConversationContext } from './context-builder.service';

export class PromptBuilderService {
  private readonly SYSTEM_BASE = `You are AI News Guardian, an expert AI assistant specialized in news verification and media literacy.

Your responsibilities:
- Help users understand fake news, misinformation, and propaganda techniques
- Explain credibility scores, fact-check verdicts, and bias analysis in plain language
- Guide users through the evidence behind an analysis
- Suggest how to verify claims independently

Rules you must follow:
- NEVER invent facts, statistics, or sources
- ONLY use the analysis data supplied to you in this prompt
- If you don't know something, say "I don't have enough data to answer that"
- Be objective, balanced, and educational in tone
- Keep responses concise and easy to understand`;

  buildPrompt(context: ConversationContext): string {
    const sections: string[] = [this.SYSTEM_BASE];

    // Analysis section
    if (context.analysis) {
      const a = context.analysis;
      sections.push(`
--- NEWS ANALYSIS REPORT ---
Classification  : ${a.classification ?? 'N/A'}
Credibility     : ${a.credibilityScore ?? 'N/A'} / 100
Confidence      : ${a.confidenceScore ?? 'N/A'} / 100
Risk Level      : ${a.riskLevel ?? 'N/A'}
Status          : ${a.processingStatus}
Summary         : ${a.summary ?? 'No summary available'}
Explanation     : ${a.explanation ?? 'No explanation available'}
Content Type    : ${a.contentType}`);
    } else {
      sections.push(`
--- NEWS ANALYSIS REPORT ---
No analysis data is linked to this session.`);
    }

    // Fact checks section
    if (context.factChecks.length > 0) {
      const factLines = context.factChecks.map((fc, i) =>
        `  [${i + 1}] Claim     : ${fc.claim}
       Verdict   : ${fc.verdict}
       Confidence: ${fc.confidenceScore ?? 'N/A'}%
       Publisher : ${fc.publisher ?? 'Unknown'}
       Source    : ${fc.sourceUrl || 'N/A'}
       Note      : ${fc.explanation ?? 'No explanation'}`
      );
      sections.push(`
--- FACT CHECK REPORTS (${context.factChecks.length} claims) ---
${factLines.join('\n\n')}`);
    } else {
      sections.push(`
--- FACT CHECK REPORTS ---
No fact-check results available.`);
    }

    // Bias section
    if (context.bias && Object.keys(context.bias).length > 0) {
      const b = context.bias;
      sections.push(`
--- BIAS ANALYSIS ---
Risk Level        : ${b.riskLevel ?? 'N/A'}
Credibility Score : ${b.credibilityScore ?? 'N/A'}
Confidence Score  : ${b.confidenceScore ?? 'N/A'}`);
    }

    // Credibility section
    if (context.credibility && Object.keys(context.credibility).length > 0) {
      const c = context.credibility;
      sections.push(`
--- CREDIBILITY ASSESSMENT ---
Score          : ${c.credibilityScore ?? 'N/A'} / 100
Risk Level     : ${c.riskLevel ?? 'N/A'}
Classification : ${c.classification ?? 'N/A'}
Status         : ${c.processingStatus ?? 'N/A'}`);
    }

    // Conversation history section
    if (context.messages.length > 0) {
      const historyLines = context.messages.map(
        (m) => `  [${m.role}]: ${m.content}`
      );
      sections.push(`
--- CONVERSATION HISTORY ---
${historyLines.join('\n')}`);
    }

    sections.push(`
--- INSTRUCTIONS ---
Use only the data above to respond. Do not fabricate information.
If the user asks about something not covered in the data above, say you don't have enough data.`);

    return sections.join('\n');
  }
}

export const promptBuilderService = new PromptBuilderService();
