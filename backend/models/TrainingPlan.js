import mongoose from 'mongoose';

const TrainingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },          // e.g. "STRENGTH SPLITS"
  daysPerWeek: { type: Number, required: true },
  level: { type: String, enum: ['base', 'intermediate', 'advanced'], default: 'base' },
  category: { type: String },          // e.g. "strength", "cardio", "yoga"
  description: { type: String },
  duration: { type: String },          // e.g. "30 days"
  equipment: { type: String, default: 'No Equipment' },
  tags: [String],
  workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  imageColor: { type: String, default: '#1e1e2e' }, // gradient color for card
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('TrainingPlan', TrainingPlanSchema);
