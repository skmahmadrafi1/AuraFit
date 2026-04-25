import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workout from '../models/Workout.js';

dotenv.config();

const workouts = [
  // ─── STRENGTH ───
  {
    title: 'Back Builder',
    type: 'strength',
    durationMin: 45,
    difficulty: 'hard',
    bodyParts: ['back', 'arms'],
    equipment: 'barbell',
    caloriesPerMin: 7,
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 6 },
      { name: 'Barbell Row', sets: 4, reps: 8 },
      { name: 'Pull-Ups', sets: 3, reps: 10 },
      { name: 'Face Pulls', sets: 3, reps: 15 },
    ],
  },
  {
    title: 'Chest & Shoulders Blast',
    type: 'strength',
    durationMin: 40,
    difficulty: 'medium',
    bodyParts: ['chest', 'shoulders'],
    equipment: 'dumbbells',
    caloriesPerMin: 6,
    exercises: [
      { name: 'Incline Dumbbell Press', sets: 4, reps: 10 },
      { name: 'Lateral Raises', sets: 3, reps: 15 },
      { name: 'Arnold Press', sets: 3, reps: 12 },
      { name: 'Cable Flyes', sets: 3, reps: 15 },
    ],
  },
  {
    title: 'Leg Day Destroyer',
    type: 'strength',
    durationMin: 50,
    difficulty: 'hard',
    bodyParts: ['legs', 'glutes'],
    equipment: 'barbell',
    caloriesPerMin: 8,
    exercises: [
      { name: 'Barbell Squat', sets: 5, reps: 5 },
      { name: 'Romanian Deadlift', sets: 4, reps: 8 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Walking Lunges', sets: 3, reps: 20 },
    ],
  },
  {
    title: 'Upper Body Power',
    type: 'strength',
    durationMin: 35,
    difficulty: 'medium',
    bodyParts: ['chest', 'back', 'arms'],
    equipment: 'dumbbells',
    caloriesPerMin: 6,
    exercises: [
      { name: 'Dumbbell Bench Press', sets: 4, reps: 10 },
      { name: 'One-Arm Row', sets: 3, reps: 12 },
      { name: 'Hammer Curls', sets: 3, reps: 12 },
      { name: 'Tricep Dips', sets: 3, reps: 15 },
    ],
  },
  {
    title: 'Arm Sculptor',
    type: 'strength',
    durationMin: 30,
    difficulty: 'easy',
    bodyParts: ['arms'],
    equipment: 'dumbbells',
    caloriesPerMin: 5,
    exercises: [
      { name: 'Bicep Curl', sets: 4, reps: 12 },
      { name: 'Skull Crusher', sets: 3, reps: 12 },
      { name: 'Preacher Curl', sets: 3, reps: 10 },
      { name: 'Overhead Tricep Extension', sets: 3, reps: 15 },
    ],
  },
  {
    title: 'Glute Grind',
    type: 'strength',
    durationMin: 35,
    difficulty: 'medium',
    bodyParts: ['glutes', 'legs'],
    equipment: 'resistance-bands',
    caloriesPerMin: 5,
    exercises: [
      { name: 'Hip Thrust', sets: 4, reps: 15 },
      { name: 'Banded Clamshells', sets: 3, reps: 20 },
      { name: 'Sumo Squat', sets: 3, reps: 15 },
      { name: 'Donkey Kicks', sets: 3, reps: 20 },
    ],
  },

  // ─── HIIT ───
  {
    title: 'All In',
    type: 'hiit',
    durationMin: 20,
    difficulty: 'hard',
    bodyParts: ['fullbody'],
    equipment: 'bodyweight',
    caloriesPerMin: 12,
    exercises: [
      { name: 'Jump Squats', sets: 3, reps: 15 },
      { name: 'Burpees', sets: 3, reps: 10 },
      { name: 'Mountain Climbers', sets: 3, reps: 20 },
      { name: 'High Knees', sets: 3, reps: 30 },
    ],
  },
  {
    title: 'Grind House',
    type: 'hiit',
    durationMin: 25,
    difficulty: 'hard',
    bodyParts: ['fullbody'],
    equipment: 'bodyweight',
    caloriesPerMin: 13,
    exercises: [
      { name: 'Sprint in Place', sets: 5, reps: 30 },
      { name: 'Box Jumps', sets: 4, reps: 10 },
      { name: 'Plyo Push-Ups', sets: 3, reps: 10 },
      { name: 'Broad Jumps', sets: 3, reps: 8 },
    ],
  },
  {
    title: 'I Regret Nothing',
    type: 'hiit',
    durationMin: 30,
    difficulty: 'hard',
    bodyParts: ['fullbody', 'cardio'],
    equipment: 'bodyweight',
    caloriesPerMin: 14,
    exercises: [
      { name: 'Tabata Sprints', sets: 8, reps: 20 },
      { name: 'Battle Rope Slams', sets: 4, reps: 15 },
      { name: 'Burpee Pull-Ups', sets: 3, reps: 8 },
    ],
  },
  {
    title: 'Fat Burner Express',
    type: 'hiit',
    durationMin: 15,
    difficulty: 'medium',
    bodyParts: ['fullbody'],
    equipment: 'bodyweight',
    caloriesPerMin: 11,
    exercises: [
      { name: 'Jump Rope', sets: 5, reps: 60 },
      { name: 'Jumping Jacks', sets: 4, reps: 30 },
      { name: 'Speed Skaters', sets: 4, reps: 20 },
    ],
  },

  // ─── CARDIO ───
  {
    title: 'Endurance Run',
    type: 'cardio',
    durationMin: 30,
    difficulty: 'medium',
    bodyParts: ['cardio', 'legs'],
    equipment: 'none',
    caloriesPerMin: 9,
    exercises: [
      { name: 'Warm-up Walk', sets: 1, reps: 5 },
      { name: 'Steady Jog', sets: 1, reps: 20 },
      { name: 'Cool-down Walk', sets: 1, reps: 5 },
    ],
  },
  {
    title: 'Stairway to Shred',
    type: 'cardio',
    durationMin: 20,
    difficulty: 'medium',
    bodyParts: ['legs', 'cardio'],
    equipment: 'none',
    caloriesPerMin: 10,
    exercises: [
      { name: 'Stair Climbs', sets: 6, reps: 3 },
      { name: 'Step Downs', sets: 6, reps: 3 },
    ],
  },
  {
    title: 'Bike Blitz',
    type: 'cardio',
    durationMin: 40,
    difficulty: 'easy',
    bodyParts: ['cardio', 'legs'],
    equipment: 'machine',
    caloriesPerMin: 7,
    exercises: [
      { name: 'Warm-up Cycling', sets: 1, reps: 5 },
      { name: 'Moderate Pace', sets: 1, reps: 25 },
      { name: 'Sprint Intervals', sets: 5, reps: 2 },
    ],
  },

  // ─── YOGA ───
  {
    title: 'Walking Yoga',
    type: 'yoga',
    durationMin: 40,
    difficulty: 'easy',
    bodyParts: ['fullbody'],
    equipment: 'none',
    caloriesPerMin: 3,
    exercises: [
      { name: 'Standing Forward Fold', sets: 3, reps: 5 },
      { name: 'Warrior I', sets: 2, reps: 10 },
      { name: 'Tree Pose', sets: 2, reps: 8 },
      { name: 'Downward Dog Walk', sets: 3, reps: 5 },
    ],
  },
  {
    title: 'Morning Flow',
    type: 'yoga',
    durationMin: 25,
    difficulty: 'easy',
    bodyParts: ['fullbody', 'back'],
    equipment: 'none',
    caloriesPerMin: 3,
    exercises: [
      { name: 'Sun Salutation A', sets: 5, reps: 1 },
      { name: 'Cat-Cow Stretch', sets: 3, reps: 10 },
      { name: 'Childs Pose', sets: 2, reps: 30 },
    ],
  },
  {
    title: 'Deep Stretch Yoga',
    type: 'yoga',
    durationMin: 45,
    difficulty: 'easy',
    bodyParts: ['fullbody'],
    equipment: 'none',
    caloriesPerMin: 2,
    exercises: [
      { name: 'Pigeon Pose', sets: 2, reps: 60 },
      { name: 'Seated Forward Fold', sets: 3, reps: 30 },
      { name: 'Supine Twist', sets: 2, reps: 30 },
      { name: 'Legs Up the Wall', sets: 1, reps: 120 },
    ],
  },

  // ─── MOBILITY ───
  {
    title: 'Durability +1',
    type: 'mobility',
    durationMin: 30,
    difficulty: 'easy',
    bodyParts: ['fullbody'],
    equipment: 'none',
    caloriesPerMin: 3,
    exercises: [
      { name: '20-Count Holds', sets: 5, reps: 1 },
      { name: 'Hip Circles', sets: 3, reps: 15 },
      { name: 'Shoulder Dislocates', sets: 3, reps: 10 },
      { name: 'Deep Squat Hold', sets: 3, reps: 30 },
    ],
  },
  {
    title: 'Desk Worker Reset',
    type: 'mobility',
    durationMin: 15,
    difficulty: 'easy',
    bodyParts: ['back', 'shoulders', 'chest'],
    equipment: 'none',
    caloriesPerMin: 2,
    exercises: [
      { name: 'Neck Rolls', sets: 3, reps: 10 },
      { name: 'Chest Opener', sets: 3, reps: 10 },
      { name: 'Thoracic Rotation', sets: 2, reps: 15 },
      { name: 'Hip Flexor Stretch', sets: 3, reps: 30 },
    ],
  },
  {
    title: 'Joint Mobility Protocol',
    type: 'mobility',
    durationMin: 20,
    difficulty: 'easy',
    bodyParts: ['fullbody'],
    equipment: 'none',
    caloriesPerMin: 2,
    exercises: [
      { name: 'Ankle Circles', sets: 3, reps: 20 },
      { name: 'Wrist Rolls', sets: 3, reps: 20 },
      { name: 'Shoulder CARs', sets: 3, reps: 10 },
      { name: 'Hip CARs', sets: 3, reps: 8 },
    ],
  },

  // ─── WARMUP ───
  {
    title: 'Dynamic Warm-Up',
    type: 'warmup',
    durationMin: 10,
    difficulty: 'easy',
    bodyParts: ['fullbody'],
    equipment: 'none',
    caloriesPerMin: 4,
    exercises: [
      { name: 'Arm Swings', sets: 2, reps: 20 },
      { name: 'Leg Swings', sets: 2, reps: 20 },
      { name: 'High Knees', sets: 2, reps: 30 },
      { name: 'Hip Circles', sets: 2, reps: 15 },
    ],
  },
  {
    title: 'Pre-Lift Activation',
    type: 'warmup',
    durationMin: 12,
    difficulty: 'easy',
    bodyParts: ['fullbody'],
    equipment: 'resistance-bands',
    caloriesPerMin: 4,
    exercises: [
      { name: 'Band Pull-Aparts', sets: 3, reps: 15 },
      { name: 'Glute Bridges', sets: 3, reps: 15 },
      { name: 'Monster Walks', sets: 2, reps: 20 },
    ],
  },

  // ─── CROSSFIT ───
  {
    title: 'CrossFit Inferno',
    type: 'crossfit',
    durationMin: 30,
    difficulty: 'hard',
    bodyParts: ['fullbody'],
    equipment: 'kettlebells',
    caloriesPerMin: 13,
    exercises: [
      { name: 'Kettlebell Swings', sets: 5, reps: 20 },
      { name: 'Box Jumps', sets: 5, reps: 10 },
      { name: 'Thrusters', sets: 4, reps: 12 },
      { name: 'Double-Unders', sets: 4, reps: 50 },
    ],
  },
  {
    title: 'WOD: Fran',
    type: 'crossfit',
    durationMin: 20,
    difficulty: 'hard',
    bodyParts: ['fullbody', 'arms'],
    equipment: 'barbell',
    caloriesPerMin: 12,
    exercises: [
      { name: 'Thrusters 21', sets: 1, reps: 21 },
      { name: 'Pull-Ups 21', sets: 1, reps: 21 },
      { name: 'Thrusters 15', sets: 1, reps: 15 },
      { name: 'Pull-Ups 15', sets: 1, reps: 15 },
    ],
  },

  // ─── CALISTHENICS ───
  {
    title: 'Street Strength',
    type: 'calisthenics',
    durationMin: 40,
    difficulty: 'hard',
    bodyParts: ['upperbody', 'abs'],
    equipment: 'bodyweight',
    caloriesPerMin: 8,
    exercises: [
      { name: 'Muscle-Ups', sets: 5, reps: 5 },
      { name: 'Full Planche Push-Ups', sets: 3, reps: 5 },
      { name: 'L-Sit Hold', sets: 5, reps: 15 },
      { name: 'Pistol Squats', sets: 4, reps: 8 },
    ],
  },
  {
    title: 'Push Pull Legs BWF',
    type: 'calisthenics',
    durationMin: 35,
    difficulty: 'medium',
    bodyParts: ['chest', 'back', 'legs'],
    equipment: 'bodyweight',
    caloriesPerMin: 7,
    exercises: [
      { name: 'Push-Ups', sets: 4, reps: 15 },
      { name: 'Inverted Rows', sets: 4, reps: 12 },
      { name: 'Pistol Squat Negatives', sets: 3, reps: 8 },
      { name: 'Dips', sets: 3, reps: 15 },
    ],
  },
  {
    title: 'Core Calisthenics',
    type: 'calisthenics',
    durationMin: 25,
    difficulty: 'medium',
    bodyParts: ['abs', 'fullbody'],
    equipment: 'bodyweight',
    caloriesPerMin: 6,
    exercises: [
      { name: 'Hollow Body Hold', sets: 4, reps: 30 },
      { name: 'Dragon Flag', sets: 3, reps: 5 },
      { name: 'Tuck Planche', sets: 4, reps: 15 },
      { name: 'Hanging Leg Raises', sets: 4, reps: 12 },
    ],
  },

  // ─── PILATES ───
  {
    title: 'Pilates Core Fusion',
    type: 'pilates',
    durationMin: 40,
    difficulty: 'medium',
    bodyParts: ['abs', 'back'],
    equipment: 'none',
    caloriesPerMin: 4,
    exercises: [
      { name: 'The Hundred', sets: 3, reps: 10 },
      { name: 'Roll-Up', sets: 3, reps: 10 },
      { name: 'Single Leg Circles', sets: 2, reps: 10 },
      { name: 'Teaser', sets: 3, reps: 8 },
    ],
  },
  {
    title: 'Pilates for Athletes',
    type: 'pilates',
    durationMin: 35,
    difficulty: 'medium',
    bodyParts: ['abs', 'glutes', 'back'],
    equipment: 'none',
    caloriesPerMin: 4,
    exercises: [
      { name: 'Swan Dive', sets: 3, reps: 8 },
      { name: 'Side-Lying Leg Series', sets: 3, reps: 15 },
      { name: 'Criss-Cross', sets: 3, reps: 20 },
      { name: 'Balance Point', sets: 3, reps: 10 },
    ],
  },
];

const seed = async () => {
  try {
    const uri = (process.env.MONGODB_URI || '').replace('mongodb.net/', 'mongodb.net/aurafit').replace('mongodb.net/aurafit?', 'mongodb.net/aurafit?');
    if (!uri) throw new Error('MONGODB_URI not defined in .env');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    await Workout.deleteMany({});
    console.log('🗑️  Cleared existing workouts');
    const inserted = await Workout.insertMany(workouts);
    console.log(`🌱 Seeded ${inserted.length} workouts successfully!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
