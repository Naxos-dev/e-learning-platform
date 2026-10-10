import type { Request, Response } from 'express';
import { confirmVideoSchema, presignVideoSchema } from '../schemas/video.schema.js';
import * as videoService from '../services/video.service.js';
import { AppError } from '../utils/AppError.js';
import { requireParam } from '../utils/params.js';

export async function presignVideoUpload(req: Request, res: Response): Promise<void> {
  const parsed = presignVideoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const result = await videoService.createUploadUrl(
    requireParam(req, 'chapterId'),
    req.user!.id,
    parsed.data.contentType,
    parsed.data.fileSize,
  );
  res.json(result);
}

export async function confirmVideoUpload(req: Request, res: Response): Promise<void> {
  const parsed = confirmVideoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const chapter = await videoService.confirmUpload(
    requireParam(req, 'chapterId'),
    req.user!.id,
    parsed.data.videoKey,
  );
  res.json(chapter);
}

export async function deleteVideo(req: Request, res: Response): Promise<void> {
  const chapter = await videoService.deleteVideo(requireParam(req, 'chapterId'), req.user!.id);
  res.json(chapter);
}
