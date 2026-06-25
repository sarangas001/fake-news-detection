import { Router } from 'express';
import { intelligenceController } from './intelligence.controller';
// Adjust the path to authMiddleware based on your actual project structure
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Protect all routes with authMiddleware
router.use(authMiddleware);

// GET /:analysisId
router.get('/:analysisId', intelligenceController.getReport);

// POST /:analysisId/reanalyze
router.post('/:analysisId/reanalyze', intelligenceController.reAnalyze);

export const intelligenceRoutes = router;
