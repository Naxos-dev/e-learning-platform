import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { chapterRouter } from './chapter.routes.js';
import { courseRouter } from './course.routes.js';
import { healthRouter } from './health.routes.js';
import { questionRouter } from './question.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/courses', courseRouter);
apiRouter.use('/chapters', chapterRouter);
apiRouter.use('/questions', questionRouter);

// Prochaines routes (enrollments, progress...) ajoutées aux étapes suivantes.
