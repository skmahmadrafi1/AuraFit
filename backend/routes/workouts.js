import { Router } from 'express';
import Workout from '../models/Workout.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { type, difficulty, equipment, bodyPart, q } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (equipment && equipment !== 'all') filter.equipment = equipment;
    if (bodyPart && bodyPart !== 'all') filter.bodyParts = bodyPart;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const items = await Workout.find(filter).sort({ createdAt: -1 }).limit(200);
    const total = await Workout.countDocuments({});
    res.json({ total, workouts: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Workout.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
