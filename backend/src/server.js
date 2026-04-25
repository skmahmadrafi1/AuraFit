import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') });

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log('========================================');
      console.log('✅ AuraFit API Server Running! v2.0');
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
      console.log('========================================');
    });

    server.on('error', (err) => {
      if (err?.code === 'EADDRINUSE') {
        console.error(`[ERROR] Port ${PORT} already in use. Change PORT in backend/.env`);
      } else {
        console.error('[ERROR] Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
