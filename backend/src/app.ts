import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { generalApiLimiter } from './middlewares/rateLimit.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Derrière le proxy de Render : sans ça, express-rate-limit compterait toutes les
  // requêtes sous l'IP du proxy au lieu de celle du client.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  app.use('/api', generalApiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
