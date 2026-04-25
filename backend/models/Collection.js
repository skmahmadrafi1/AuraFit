import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },   // e.g. "Chest"
  slug: { type: String, required: true, unique: true }, // e.g. "chest"
  type: { type: String, enum: ['body-part', 'goal', 'lifestyle', 'sport', 'misc'], default: 'body-part' },
  description: { type: String },
  workoutCount: { type: Number, default: 0 },
  tags: [String],
  imageColor: { type: String, default: '#2d2d3f' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Collection', CollectionSchema);
