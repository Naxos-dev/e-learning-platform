import { Router } from 'express';
import { listMyEnrollments } from '../controllers/enrollment.controller.js';
import { authenticate } from '../middlewares/auth.js';

export const enrollmentRouter = Router();

enrollmentRouter.get('/me', authenticate, listMyEnrollments);
