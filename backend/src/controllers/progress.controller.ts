import type { Request, Response } from 'express';
import { submitQuizSchema, updateProgressSchema } from '../schemas/progress.schema.js';
import * as progressService from '../services/progress.service.js';
import { AppError } from '../utils/AppError.js';
import { requireParam } from '../utils/params.js';

export async function updateProgress(req: Request, res: Response): Promise<void> {
  const parsed = updateProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const progress = await progressService.setChapterCompleted(
    requireParam(req, 'chapterId'),
    req.user!.id,
    parsed.data.completed,
  );
  res.json(progress);
}

export async function submitQuiz(req: Request, res: Response): Promise<void> {
  const parsed = submitQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const result = await progressService.submitQuiz(
    requireParam(req, 'chapterId'),
    req.user!.id,
    parsed.data,
  );
  res.json(result);
}
