import { Router } from 'express';
import {
  getNutritionItems,
  getGoalPlan,
  logMeal,
  getMealLogs,
} from '../controllers/nutritionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/items', getNutritionItems);
router.get('/goal/:goal', getGoalPlan);
router.post('/meal/log', authMiddleware, logMeal);
router.get('/meal/log/:userId', getMealLogs);

export default router;
