import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser tools (no Origin header) and the configured client origins only.
      if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '100kb' }));
if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), db: dbStates[mongoose.connection.readyState] ?? 'unknown' } });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
