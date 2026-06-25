import { Request, Response } from 'express';
import { intelligenceService } from './intelligence.service';

export class IntelligenceController {
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId } = req.params;

      if (!analysisId) {
        res.status(400).json({ success: false, message: 'Analysis ID is required' });
        return;
      }

      // We delegate to the service layer. If a separate get method exists, it would be called here.
      // For now, generateReport performs the workflow and returns the report data.
      const report = await intelligenceService.generateReport(analysisId as string);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Error fetching intelligence report:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  async reAnalyze(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId } = req.params;

      if (!analysisId) {
        res.status(400).json({ success: false, message: 'Analysis ID is required' });
        return;
      }

      // Re-trigger the analysis workflow
      const report = await intelligenceService.generateReport(analysisId as string);

      res.status(200).json({
        success: true,
        message: 'Re-analysis completed successfully',
        data: report,
      });
    } catch (error: any) {
      console.error('Error during re-analysis:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

export const intelligenceController = new IntelligenceController();
