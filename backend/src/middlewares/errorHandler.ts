import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express reconnaît un middleware d'erreur à son arité (4 paramètres)
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  const message = err instanceof Error ? err.message : 'Erreur interne';
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : message,
  });
}
