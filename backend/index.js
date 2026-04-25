import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import workoutsRouter from './routes/workouts.js';
import nutritionRouter from './routes/nutrition.js';
import communityRouter from './routes/community.js';
import pricingRouter from './routes/pricing.js';
import authRouter from './routes/auth.js';
import plannerRouter from './routes/planner.js';
import userRouter from './routes/user.js';
import aiRouter from './routes/ai.js';
import challengesRouter from './routes/challenges.js';
import poseRouter from './routes/pose.js';
import progressRouter from './routes/progress.js';
import trackerRouter from './routes/tracker.js';
import workoutLogRouter from './routes/workoutLog.js';
import mealLogRouter from './routes/mealLog.js';
import aiMealRouter from './routes/aiMealPlan.js';
import adminRouter from './routes/admin.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aurafit';
const DB_NAME = process.env.DB_NAME || 'aurafit';

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://aurafit-frontend.onrender.com',
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
  ],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection?.readyState;
  res.json({
    ok: true,
    service: 'aurafit-api',
    time: new Date().toISOString(),
    mongo: {
      state: mongoState,
      host: mongoose.connection?.host || null,
      name: mongoose.connection?.name || null,
    },
  });
});

// Temporary seed route - remove after seeding
app.get('/api/seed-now', async (req, res) => {
  try {
    const { seedDatabase } = await import('./seed/seedData.js');
    await seedDatabase();
    res.json({ ok: true, message: 'Seeded successfully!' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/nutrition', nutritionRouter);
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
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
console.log('✅ User Profile API ready — routes: /api/user/:id/profile-image, /api/user/:id/update-profile');
console.log('✅ AI Workout Generator ready — routes: /api/ai/workout/generate');
console.log('✅ Challenges & Gamification ready — routes: /api/challenges');
console.log('✅ Pose Detection ready — routes: /api/pose/log');
console.log('✅ Progress Analytics ready — routes: /api/progress/:userId, /api/progress/:userId/detailed');
console.log('✅ Tracker API ready — routes: /api/tracker/:userId');
console.log('✅ Workout Log API ready — routes: /api/workout/log, /api/workout/log/:userId');
console.log('✅ Meal Log API ready — routes: /api/meal/log, /api/meal/log/:userId');
console.log('✅ AI Meal Planner ready — routes: /api/nutrition/ai-meal-plan');
console.log('✅ Admin Panel ready — routes: /api/admin/users, /api/admin/user/:id/logs');
console.log('✅ Notifications ready — routes: /api/notifications/send, /api/notifications/daily/:userId');

async function connectMongo() {
  if ((MONGO_URI || '').includes('<db_password>')) {
    console.warn('[WARN] MONGODB_URI contains the <db_password> placeholder. Skipping DB connect until it is replaced.');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('[ERROR] MongoDB connection failed:', err?.message || err);
    console.warn('[WARN] API will continue to run without a database connection. Update backend/.env and save to retry.');
    setTimeout(() => {
      console.log('[INFO] Retrying MongoDB connection...');
      connectMongo();
    }, 7000);
  }
}

const server = app.listen(PORT, () => {
  console.log("========================================");
  console.log(`✅ AuraFit API Server Running!`);
  console.log(`📍 Listening on http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log("========================================");
  connectMongo();
});

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`[ERROR] Cannot start server: port ${PORT} is already in use.`);
    console.error('[HINT] Stop the process using this port or change PORT in backend/.env, then restart.');
  } else {
    console.error('[ERROR] Server failed to start:', err);
  }
  process.exit(1);
});