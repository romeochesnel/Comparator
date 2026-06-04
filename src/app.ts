import express from 'express';
import path from 'path';
import { trackersRouter } from './api/routes/trackers';
import { historyRouter } from './api/routes/history';
import { errorHandler } from './api/middleware/errorHandler';
import { authMiddleware } from './api/middleware/auth';
import { globalLimiter, writeLimiter } from './api/middleware/rateLimit';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api', globalLimiter);
  app.post('/api/*', writeLimiter);
  app.patch('/api/*', writeLimiter);
  app.delete('/api/*', writeLimiter);
  app.use('/api', authMiddleware);
  app.use('/api/trackers', trackersRouter);
  app.use('/api/history', historyRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  app.use(errorHandler);

  return app;
}
