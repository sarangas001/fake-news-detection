import { Router } from 'express';
import { imageAnalysisController } from './image-analysis.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { upload } from '../../shared/upload/multer.config';

const router = Router();

// Protect all routes with auth
router.use(authMiddleware);

// POST /analyze — upload and queue for OCR
router.post(
  '/analyze',
  upload.single('image'),
  imageAnalysisController.uploadImage
);

// GET /history/me — must be before /:id to avoid route conflict
router.get('/history/me', imageAnalysisController.getHistory);

// GET /:id — get result by ID
router.get('/:id', imageAnalysisController.getResult);

// DELETE /:id — delete image analysis and file from storage
router.delete('/:id', imageAnalysisController.delete);

export const imageAnalysisRoutes = router;
