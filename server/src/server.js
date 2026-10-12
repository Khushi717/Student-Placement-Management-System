import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  try {
    await connectDB();
    console.log('MongoDB connected');
    app.listen(env.port, () => console.log(`SPMS API listening on http://localhost:${env.port} (${env.nodeEnv})`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}
start();
