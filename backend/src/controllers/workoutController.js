import Workout from '../../models/Workout.js';

export const getWorkouts = async (req, res) => {
  try {
    const { type, difficulty, equipment, bodyPart, q } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (equipment && equipment !== 'all') filter.equipment = equipment;
    if (bodyPart && bodyPart !== 'all') filter.bodyParts = bodyPart;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const workouts = await Workout.find(filter).sort({ createdAt: -1 }).limit(200);
    const total = await Workout.countDocuments({});
    res.json({ total, workouts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found.' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
