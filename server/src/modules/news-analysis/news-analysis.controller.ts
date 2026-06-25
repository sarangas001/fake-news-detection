import { Request, Response } from 'express';
import { newsAnalysisService } from './news-analysis.service';
import { CreateAnalysisDTO } from './news-analysis.dto';

export class NewsAnalysisController {
  async createAnalysis(req: Request, res: Response): Promise<void> {
    try {
      // User ID should be attached to req.user by auth middleware
      const userId = (req as any).user?._id || (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized access' });
        return;
      }

      const data: CreateAnalysisDTO = req.body;
      const result = await newsAnalysisService.createAnalysis(userId, data);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  async getAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const analysis = await newsAnalysisService.getAnalysis(id as string);
      
      if (!analysis) {
        res.status(404).json({ success: false, message: 'Analysis not found' });
        return;
      }

      // Optional: Check if user owns the analysis
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (analysis.userId.toString() !== userId?.toString()) {
        res.status(403).json({ success: false, message: 'Forbidden access' });
        return;
      }

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized access' });
        return;
      }

      const history = await newsAnalysisService.getUserHistory(userId);
      
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  async deleteAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const analysis = await newsAnalysisService.getAnalysis(id as string);
      
      if (!analysis) {
        res.status(404).json({ success: false, message: 'Analysis not found' });
        return;
      }

      // Check ownership
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (analysis.userId.toString() !== userId?.toString()) {
        res.status(403).json({ success: false, message: 'Forbidden access' });
        return;
      }

      await newsAnalysisService.deleteAnalysis(id as string);
      
      res.status(200).json({
        success: true,
        data: { message: 'Analysis deleted successfully' },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

export const newsAnalysisController = new NewsAnalysisController();
