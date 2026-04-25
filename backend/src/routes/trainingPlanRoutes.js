import { Router } from 'express';
import { getTrainingPlans, getTrainingPlanById } from '../controllers/trainingPlanController.js';

const router = Router();

router.get('/', getTrainingPlans);
router.get('/:id', getTrainingPlanById);

export default router;
