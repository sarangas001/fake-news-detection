import { Request, Response } from 'express';
import { imageAnalysisService } from './image-analysis.service';

export class ImageAnalysisController {
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

      const result = await imageAnalysisService.uploadAndAnalyze(String(userId), file);

      res.status(201).json({
        success: true,
        message: 'Image uploaded and processed successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  async getResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const record = await imageAnalysisService.getResult(id as string);

      if (!record) {
        res.status(404).json({ success: false, message: 'Image analysis record not found' });
        return;
      }

      const userId = (req as any).user?._id || (req as any).user?.id;
      if (String(record.userId) !== String(userId)) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      res.status(200).json({
        success: true,
        data: record,
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
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const history = await imageAnalysisService.getHistory(String(userId));

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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const record = await imageAnalysisService.getResult(id as string);

      if (!record) {
        res.status(404).json({ success: false, message: 'Image analysis record not found' });
        return;
      }

      const userId = (req as any).user?._id || (req as any).user?.id;
      if (String(record.userId) !== String(userId)) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      await imageAnalysisService.delete(id as string);

      res.status(200).json({
        success: true,
        message: 'Image analysis deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

export const imageAnalysisController = new ImageAnalysisController();
