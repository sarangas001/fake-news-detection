import { Router } from 'express';
import { newsAnalysisController } from './news-analysis.controller';
import { createAnalysisSchema } from './news-analysis.validators';

// Assuming an auth middleware exists in the project
// If the exact path is different, this should be updated.
// import { requireAuth } from '../../middlewares/auth.middleware';
// import { validateRequest } from '../../middlewares/validate.middleware';

const router = Router();

// Mock auth middleware for demonstration if none exists, replace with actual import
const mockRequireAuth = (req: any, res: any, next: any) => {
  // Mocking an authenticated user
  if (!req.user) req.user = { id: 'dummy-user-id' }; 
  next();
};

const validateRequest = (schema: any) => (req: any, res: any, next: any) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.errors });
  }
};

router.use(mockRequireAuth);

router.post('/', validateRequest(createAnalysisSchema), newsAnalysisController.createAnalysis);
router.get('/history/me', newsAnalysisController.getHistory);
router.get('/:id', newsAnalysisController.getAnalysis);
router.delete('/:id', newsAnalysisController.deleteAnalysis);

export const newsAnalysisRoutes = router;
