import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aurafit';
  const dbName = process.env.DB_NAME || 'aurafit';

  if (uri.includes('<db_password>')) {
    console.warn('[WARN] MONGODB_URI contains placeholder. Skipping DB connect.');
    return;
  }

  try {
    await mongoose.connect(uri, { dbName });
    console.log(`[DB] MongoDB connected → ${mongoose.connection.host}/${dbName}`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    console.warn('[WARN] Running without DB. Fix MONGODB_URI in .env and restart.');
    setTimeout(connectDB, 7000);
  }
};

export default connectDB;
