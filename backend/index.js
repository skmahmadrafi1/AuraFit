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
import TrainingPlan from './models/TrainingPlan.js';
import Collection from './models/Collection.js';

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

// Temporary seed route
app.get('/api/seed-plans', async (req, res) => {
  try {
    const TRAINING_PLANS = [
      { name: 'APEX', subtitle: 'Strength Splits', daysPerWeek: 5, level: 'intermediate', category: 'strength', description: 'A high-frequency 5-day strength split for building serious muscle mass.', duration: '30 days', equipment: 'Gym Equipment', tags: ['strength', 'muscle', 'splits'], imageColor: '#1a1a2e', featured: true },
      { name: 'POWER HOUSE', subtitle: 'Lower Body Strength', daysPerWeek: 4, level: 'intermediate', category: 'strength', description: 'Build powerful legs and a strong posterior chain.', duration: '30 days', equipment: 'Gym Equipment', tags: ['lower body', 'legs', 'glutes', 'strength'], imageColor: '#16213e', featured: true },
      { name: 'SAGE', subtitle: 'Mindful Strength', daysPerWeek: 3, level: 'base', category: 'yoga', description: 'A 3-day mindful strength program blending yoga, mobility, and bodyweight training.', duration: '30 days', equipment: 'No Equipment', tags: ['yoga', 'mindfulness', 'flexibility', 'beginners'], imageColor: '#1b2838', featured: false },
      { name: 'CENTAUR', subtitle: 'Power & Speed', daysPerWeek: 4, level: 'advanced', category: 'hiit', description: 'An advanced 4-day athletic program combining explosive power and speed drills.', duration: '30 days', equipment: 'Minimal Equipment', tags: ['athletic', 'speed', 'power', 'advanced'], imageColor: '#0d1117', featured: false },
      { name: 'NOVA', subtitle: 'Full Body Cardio', daysPerWeek: 5, level: 'base', category: 'cardio', description: 'A beginner-friendly 5-day full body cardio blast.', duration: '30 days', equipment: 'No Equipment', tags: ['cardio', 'fat-loss', 'endurance', 'beginner'], imageColor: '#141414', featured: false },
      { name: 'IRON WILL', subtitle: 'Upper Body Push & Pull', daysPerWeek: 4, level: 'advanced', category: 'strength', description: 'Four days of intense push/pull upper body training.', duration: '30 days', equipment: 'Gym Equipment', tags: ['upper body', 'push pull', 'strength', 'advanced'], imageColor: '#1e1e2e', featured: false },
      { name: 'BALANCE', subtitle: 'Core & Flexibility', daysPerWeek: 3, level: 'base', category: 'yoga', description: 'Three focused days on core stability, balance, and full-body flexibility.', duration: '21 days', equipment: 'No Equipment', tags: ['core', 'flexibility', 'balance', 'recovery'], imageColor: '#1a2332', featured: false },
      { name: 'WILDFIRE', subtitle: 'HIIT Circuit', daysPerWeek: 4, level: 'intermediate', category: 'hiit', description: 'Four days of intense HIIT circuits designed to burn fat and build lean muscle.', duration: '30 days', equipment: 'No Equipment', tags: ['hiit', 'fat-loss', 'circuit', 'intermediate'], imageColor: '#1f1107', featured: false },
    ];

    const COLLECTIONS = [
      { name: 'Chest', slug: 'chest', type: 'body-part', description: 'All chest workouts.', workoutCount: 24, tags: ['chest', 'push', 'upper body'], imageColor: '#1a1a2e', featured: true },
      { name: 'Shoulder', slug: 'shoulder', type: 'body-part', description: 'Build round, defined shoulders.', workoutCount: 18, tags: ['shoulder', 'deltoids', 'upper body'], imageColor: '#16213e', featured: true },
      { name: 'Firefighters', slug: 'firefighters', type: 'lifestyle', description: 'Functional fitness programs inspired by firefighter training.', workoutCount: 12, tags: ['functional', 'endurance', 'strength'], imageColor: '#1f1107', featured: true },
      { name: 'For Running & Walking', slug: 'running-walking', type: 'sport', description: 'Workouts designed to complement your running and walking routine.', workoutCount: 20, tags: ['running', 'cardio', 'endurance'], imageColor: '#0d1f0d', featured: true },
      { name: 'Core, Balance & Stability', slug: 'core-balance-stability', type: 'goal', description: 'Build a rock-solid core.', workoutCount: 30, tags: ['core', 'balance', 'stability', 'abs'], imageColor: '#1a1a35', featured: true },
      { name: 'Low-Impact Fat Loss', slug: 'low-impact-fat-loss', type: 'goal', description: 'Burn fat without high joint stress.', workoutCount: 22, tags: ['fat-loss', 'low-impact', 'beginner'], imageColor: '#1f1a00', featured: true },
      { name: 'Back & Spine', slug: 'back-spine', type: 'body-part', description: 'Strengthen your back and protect your spine.', workoutCount: 21, tags: ['back', 'spine', 'posture'], imageColor: '#1a2030', featured: false },
      { name: 'Arms & Biceps', slug: 'arms-biceps', type: 'body-part', description: 'Sculpt bigger, stronger arms.', workoutCount: 16, tags: ['arms', 'biceps', 'upper body'], imageColor: '#1e1a30', featured: false },
      { name: 'Legs & Glutes', slug: 'legs-glutes', type: 'body-part', description: 'Build powerful legs and a lifted posterior chain.', workoutCount: 28, tags: ['legs', 'glutes', 'lower body'], imageColor: '#1e1014', featured: false },
      { name: 'Abs & Core', slug: 'abs-core', type: 'body-part', description: 'Targeted abdominal training.', workoutCount: 26, tags: ['abs', 'core', 'stomach'], imageColor: '#141e1e', featured: false },
      { name: 'Full Body', slug: 'full-body', type: 'goal', description: 'Efficient full-body workouts.', workoutCount: 35, tags: ['full body', 'efficient', 'total'], imageColor: '#1a1a1a', featured: false },
      { name: 'HIIT & Cardio', slug: 'hiit-cardio', type: 'goal', description: 'High-intensity interval training and cardio circuits.', workoutCount: 32, tags: ['hiit', 'cardio', 'fat-loss', 'intensity'], imageColor: '#1f1000', featured: false },
    ];

    const existingPlans = await TrainingPlan.countDocuments();
    if (existingPlans === 0) {
      await TrainingPlan.insertMany(TRAINING_PLANS);
    }

    const existingCols = await Collection.countDocuments();
    if (existingCols === 0) {
      await Collection.insertMany(COLLECTIONS);
    }

    res.json({ ok: true, message: `Seeded ${TRAINING_PLANS.length} plans and ${COLLECTIONS.length} collections!` });
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