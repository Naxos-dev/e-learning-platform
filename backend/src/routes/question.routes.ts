import { Role } from '@prisma/client';
import { Router } from 'express';
import { deleteQuestion, updateQuestion } from '../controllers/quiz.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

export const questionRouter = Router();

questionRouter.patch('/:questionId', authenticate, authorize(Role.FORMATEUR), updateQuestion);
questionRouter.delete('/:questionId', authenticate, authorize(Role.FORMATEUR), deleteQuestion);
