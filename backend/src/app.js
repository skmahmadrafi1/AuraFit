import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// src/routes (new clean routes)
import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import trainingPlanRoutes from './routes/trainingPlanRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';

// legacy routes (all other features kept working)
import communityRouter from '../routes/community.js';
import pricingRouter from '../routes/pricing.js';
import plannerRouter from '../routes/planner.js';
import userRouter from '../routes/user.js';
import aiRouter from '../routes/ai.js';
import challengesRouter from '../routes/challenges.js';
import poseRouter from '../routes/pose.js';
import progressRouter from '../routes/progress.js';
import trackerRouter from '../routes/tracker.js';
import workoutLogRouter from '../routes/workoutLog.js';
import mealLogRouter from '../routes/mealLog.js';
import aiMealRouter from '../routes/aiMealPlan.js';
import legacyNutritionRouter from '../routes/nutrition.js';
import adminRouter from '../routes/admin.js';
import notificationsRouter from '../routes/notifications.js';

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:8080',
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'aurafit-api',
    version: '2.0.0',
    time: new Date().toISOString(),
    mongo: {
      state: mongoose.connection?.readyState,
      host: mongoose.connection?.host || null,
      name: mongoose.connection?.name || null,
    },
  });
});

// ─── Routes (new controllers) ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/training-plans', trainingPlanRoutes);
app.use('/api/collections', collectionRoutes);

// ─── Routes (legacy — all kept working) ─────────────────────────────────────
app.use('/api/community', communityRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/user', userRouter);
app.use('/api/ai', aiRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/pose', poseRouter);
app.use('/api/progress', progressRouter);
app.use('/api/tracker', trackerRouter);
app.use('/api/workout', workoutLogRouter);
app.use('/api/meal', mealLogRouter);
app.use('/api/nutrition', aiMealRouter);
app.use('/api/nutrition', legacyNutritionRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
