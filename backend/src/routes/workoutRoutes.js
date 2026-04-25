import { Router } from 'express';
import {
  getWorkouts,
  createWorkout,
  getWorkoutById,
  deleteWorkout,
} from '../controllers/workoutController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getWorkouts);
router.post('/', authMiddleware, createWorkout);
router.get('/:id', getWorkoutById);
router.delete('/:id', authMiddleware, deleteWorkout);

export default router;
