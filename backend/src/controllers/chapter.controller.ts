import type { Request, Response } from 'express';
import { createChapterSchema, updateChapterSchema } from '../schemas/chapter.schema.js';
import * as chapterService from '../services/chapter.service.js';
import { AppError } from '../utils/AppError.js';
import { requireParam } from '../utils/params.js';

export async function createChapter(req: Request, res: Response): Promise<void> {
  const parsed = createChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const chapter = await chapterService.createChapter(
    requireParam(req, 'courseId'),
    req.user!.id,
    parsed.data,
  );
  res.status(201).json(chapter);
}

export async function listChapters(req: Request, res: Response): Promise<void> {
  const chapters = await chapterService.listChapters(requireParam(req, 'courseId'));
  res.json(chapters);
}

export async function getChapter(req: Request, res: Response): Promise<void> {
  const chapter = await chapterService.getChapterDetail(requireParam(req, 'chapterId'));
  res.json(chapter);
}

export async function updateChapter(req: Request, res: Response): Promise<void> {
  const parsed = updateChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const chapter = await chapterService.updateChapter(
    requireParam(req, 'chapterId'),
    req.user!.id,
    parsed.data,
  );
  res.json(chapter);
}

export async function deleteChapter(req: Request, res: Response): Promise<void> {
  await chapterService.deleteChapter(requireParam(req, 'chapterId'), req.user!.id);
  res.status(204).send();
}
