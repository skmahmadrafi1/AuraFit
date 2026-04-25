import TrainingPlan from '../models/TrainingPlan.js';

export const getTrainingPlans = async (req, res) => {
  try {
    const { category, level, q } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (level && level !== 'all') filter.level = level;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const plans = await TrainingPlan.find(filter).sort({ featured: -1, createdAt: -1 });
    const total = await TrainingPlan.countDocuments({});
    res.json({ total, plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTrainingPlanById = async (req, res) => {
  try {
    const plan = await TrainingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
