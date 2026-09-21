import { Router } from 'express';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);

// Prochaines routes (auth, courses, chapters, enrollments...) ajoutées aux étapes suivantes.
