import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import TrainingPlan from '../models/TrainingPlan.js';
import Collection from '../models/Collection.js';

// ── Connect ──────────────────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'aurafit' });
console.log('✅ MongoDB connected for seeding');

// ── Training Plans Data ───────────────────────────────────────────────────────
const TRAINING_PLANS = [
  {
    name: 'APEX',
    subtitle: 'Strength Splits',
    daysPerWeek: 5,
    level: 'intermediate',
    category: 'strength',
    description: 'A high-frequency 5-day strength split for building serious muscle mass. Combines compound lifts with targeted isolation work for each major muscle group.',
    duration: '30 days',
    equipment: 'Gym Equipment',
    tags: ['strength', 'muscle', 'splits'],
    imageColor: '#1a1a2e',
    featured: true,
  },
  {
    name: 'POWER HOUSE',
    subtitle: 'Lower Body Strength',
    daysPerWeek: 4,
    level: 'intermediate',
    category: 'strength',
    description: 'Build powerful legs and a strong posterior chain with 4 focused days of lower body domination. Squats, deadlifts, lunges, and more.',
    duration: '30 days',
    equipment: 'Gym Equipment',
    tags: ['lower body', 'legs', 'glutes', 'strength'],
    imageColor: '#16213e',
    featured: true,
  },
  {
    name: 'SAGE',
    subtitle: 'Mindful Strength',
    daysPerWeek: 3,
    level: 'base',
    category: 'yoga',
    description: 'A 3-day mindful strength program blending yoga, mobility, and bodyweight training. Perfect for stress relief, flexibility, and functional fitness.',
    duration: '30 days',
    equipment: 'No Equipment',
    tags: ['yoga', 'mindfulness', 'flexibility', 'beginners'],
    imageColor: '#1b2838',
    featured: false,
  },
  {
    name: 'CENTAUR',
    subtitle: 'Power & Speed',
    daysPerWeek: 4,
    level: 'advanced',
    category: 'hiit',
    description: 'An advanced 4-day athletic program combining explosive power, speed drills, and HIIT. Built for athletes who want to move faster and hit harder.',
    duration: '30 days',
    equipment: 'Minimal Equipment',
    tags: ['athletic', 'speed', 'power', 'advanced'],
    imageColor: '#0d1117',
    featured: false,
  },
  {
    name: 'NOVA',
    subtitle: 'Full Body Cardio',
    daysPerWeek: 5,
    level: 'base',
    category: 'cardio',
    description: 'A beginner-friendly 5-day full body cardio blast. No equipment needed — just your body and the will to move. Great for fat loss and endurance.',
    duration: '30 days',
    equipment: 'No Equipment',
    tags: ['cardio', 'fat-loss', 'endurance', 'beginner'],
    imageColor: '#141414',
    featured: false,
  },
  {
    name: 'IRON WILL',
    subtitle: 'Upper Body Push & Pull',
    daysPerWeek: 4,
    level: 'advanced',
    category: 'strength',
    description: 'Four days of intense push/pull upper body training. Build a wide back, thick chest, and sculpted arms with this advanced split.',
    duration: '30 days',
    equipment: 'Gym Equipment',
    tags: ['upper body', 'push pull', 'strength', 'advanced'],
    imageColor: '#1e1e2e',
    featured: false,
  },
  {
    name: 'BALANCE',
    subtitle: 'Core & Flexibility',
    daysPerWeek: 3,
    level: 'base',
    category: 'yoga',
    description: 'Three focused days on core stability, balance, and full-body flexibility. Ideal for recovery, posture improvement, and active rest weeks.',
    duration: '21 days',
    equipment: 'No Equipment',
    tags: ['core', 'flexibility', 'balance', 'recovery'],
    imageColor: '#1a2332',
    featured: false,
  },
  {
    name: 'WILDFIRE',
    subtitle: 'HIIT Circuit',
    daysPerWeek: 4,
    level: 'intermediate',
    category: 'hiit',
    description: 'Four days of intense HIIT circuits designed to burn fat, spike your metabolism, and build lean muscle — in under 45 minutes per session.',
    duration: '30 days',
    equipment: 'No Equipment',
    tags: ['hiit', 'fat-loss', 'circuit', 'intermediate'],
    imageColor: '#1f1107',
    featured: false,
  },
];

// ── Collections Data ──────────────────────────────────────────────────────────
const COLLECTIONS = [
  { name: 'Chest', slug: 'chest', type: 'body-part', description: 'All chest workouts — push-ups, flyes, press variations, and more.', workoutCount: 24, tags: ['chest', 'push', 'upper body'], imageColor: '#1a1a2e', featured: true },
  { name: 'Shoulder', slug: 'shoulder', type: 'body-part', description: 'Build round, defined shoulders with targeted overhead and lateral exercises.', workoutCount: 18, tags: ['shoulder', 'deltoids', 'upper body'], imageColor: '#16213e', featured: true },
  { name: 'Firefighters', slug: 'firefighters', type: 'lifestyle', description: 'Functional fitness programs inspired by firefighter training — strength meets endurance.', workoutCount: 12, tags: ['functional', 'endurance', 'strength'], imageColor: '#1f1107', featured: true },
  { name: 'For Running & Walking', slug: 'running-walking', type: 'sport', description: 'Workouts designed to complement your running and walking routine — speed, endurance, and leg strength.', workoutCount: 20, tags: ['running', 'cardio', 'endurance'], imageColor: '#0d1f0d', featured: true },
  { name: 'Core, Balance & Stability', slug: 'core-balance-stability', type: 'goal', description: 'Build a rock-solid core with balance and stability exercises for everyday movement and sports performance.', workoutCount: 30, tags: ['core', 'balance', 'stability', 'abs'], imageColor: '#1a1a35', featured: true },
  { name: 'Low-Impact Fat Loss', slug: 'low-impact-fat-loss', type: 'goal', description: 'Burn fat without high joint stress. Perfect for beginners, recovery periods, or anyone wanting gentle but effective workouts.', workoutCount: 22, tags: ['fat-loss', 'low-impact', 'beginner'], imageColor: '#1f1a00', featured: true },
  { name: 'Back & Spine', slug: 'back-spine', type: 'body-part', description: 'Strengthen your back and protect your spine with targeted rows, pulls, and extension exercises.', workoutCount: 21, tags: ['back', 'spine', 'posture'], imageColor: '#1a2030', featured: false },
  { name: 'Arms & Biceps', slug: 'arms-biceps', type: 'body-part', description: 'Sculpt bigger, stronger arms with curls, hammer variations, and compound pulling movements.', workoutCount: 16, tags: ['arms', 'biceps', 'upper body'], imageColor: '#1e1a30', featured: false },
  { name: 'Legs & Glutes', slug: 'legs-glutes', type: 'body-part', description: 'Build powerful legs and a lifted posterior chain — squats, lunges, hip thrusts, and more.', workoutCount: 28, tags: ['legs', 'glutes', 'lower body'], imageColor: '#1e1014', featured: false },
  { name: 'Abs & Core', slug: 'abs-core', type: 'body-part', description: 'Targeted abdominal training — planks, crunches, leg raises, and rotational exercises.', workoutCount: 26, tags: ['abs', 'core', 'stomach'], imageColor: '#141e1e', featured: false },
  { name: 'Full Body', slug: 'full-body', type: 'goal', description: 'Efficient full-body workouts that hit every major muscle group in a single session.', workoutCount: 35, tags: ['full body', 'efficient', 'total'], imageColor: '#1a1a1a', featured: false },
  { name: 'Martial Arts', slug: 'martial-arts', type: 'sport', description: 'MMA-inspired conditioning — strikes, kicks, footwork drills, and combat fitness.', workoutCount: 14, tags: ['martial arts', 'mma', 'combat', 'sport'], imageColor: '#1f1010', featured: false },
  { name: 'Yoga & Stretch', slug: 'yoga-stretch', type: 'lifestyle', description: 'Flexibility-focused yoga flows and deep stretch routines for mobility, recovery, and mindfulness.', workoutCount: 19, tags: ['yoga', 'stretch', 'flexibility', 'mindfulness'], imageColor: '#0d1f1a', featured: false },
  { name: 'Seniors & Beginners', slug: 'seniors-beginners', type: 'lifestyle', description: 'Gentle, beginner-friendly routines for older adults and those just starting their fitness journey.', workoutCount: 17, tags: ['beginner', 'seniors', 'low-impact', 'gentle'], imageColor: '#1a1f14', featured: false },
  { name: 'HIIT & Cardio', slug: 'hiit-cardio', type: 'goal', description: 'High-intensity interval training and cardio circuits for maximum calorie burn in minimum time.', workoutCount: 32, tags: ['hiit', 'cardio', 'fat-loss', 'intensity'], imageColor: '#1f1000', featured: false },
  { name: 'Pregnancy & Postnatal', slug: 'pregnancy-postnatal', type: 'lifestyle', description: 'Safe, effective exercises for pregnancy and postnatal recovery — nurturing movement for every stage.', workoutCount: 11, tags: ['pregnancy', 'postnatal', 'safe', 'gentle'], imageColor: '#1f1520', featured: false },
];

// ── Seed ──────────────────────────────────────────────────────────────────────
const seed = async () => {
  // Training Plans
  const existingPlans = await TrainingPlan.countDocuments();
  if (existingPlans > 0) {
    console.log(`⏭  Training plans already seeded (${existingPlans} found). Skipping.`);
  } else {
    await TrainingPlan.insertMany(TRAINING_PLANS);
    console.log(`✅ Seeded ${TRAINING_PLANS.length} training plans`);
  }

  // Collections
  const existingCols = await Collection.countDocuments();
  if (existingCols > 0) {
    console.log(`⏭  Collections already seeded (${existingCols} found). Skipping.`);
  } else {
    await Collection.insertMany(COLLECTIONS);
    console.log(`✅ Seeded ${COLLECTIONS.length} collections`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
