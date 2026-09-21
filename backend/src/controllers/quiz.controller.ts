import type { Request, Response } from 'express';
import { questionInputSchema } from '../schemas/quiz.schema.js';
import * as quizService from '../services/quiz.service.js';
import { AppError } from '../utils/AppError.js';
import { requireParam } from '../utils/params.js';

export async function getChapterQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizService.getQuizForChapter(requireParam(req, 'chapterId'), req.user!.id);
  res.json(quiz);
}

export async function createQuestion(req: Request, res: Response): Promise<void> {
  const parsed = questionInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const question = await quizService.createQuestion(
    requireParam(req, 'chapterId'),
    req.user!.id,
    parsed.data,
  );
  res.status(201).json(question);
}

export async function updateQuestion(req: Request, res: Response): Promise<void> {
  const parsed = questionInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const question = await quizService.updateQuestion(
    requireParam(req, 'questionId'),
    req.user!.id,
    parsed.data,
  );
  res.json(question);
}

export async function deleteQuestion(req: Request, res: Response): Promise<void> {
  await quizService.deleteQuestion(requireParam(req, 'questionId'), req.user!.id);
  res.status(204).send();
}
