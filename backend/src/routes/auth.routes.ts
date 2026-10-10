import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authenticate, me);
