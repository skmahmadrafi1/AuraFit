import Collection from '../models/Collection.js';

export const getCollections = async (req, res) => {
  try {
    const { type, q } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const collections = await Collection.find(filter).sort({ featured: -1, name: 1 });
    const total = await Collection.countDocuments({});
    res.json({ total, collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug });
    if (!collection) return res.status(404).json({ error: 'Collection not found.' });
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
