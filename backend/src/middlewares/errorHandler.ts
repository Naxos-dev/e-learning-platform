import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// body-parser (express.json()) lève une SyntaxError décorée de status/statusCode 400 et
// type "entity.parse.failed" sur un JSON malformé : sans ce cas, elle finissait dans la
// branche 500 générique ci-dessous et exposait le message interne du parseur au client.
function isJsonParseError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) {
    return false;
  }
  const withMeta = err as SyntaxError & { status?: unknown; statusCode?: unknown; type?: unknown };
  return withMeta.type === 'entity.parse.failed' || withMeta.status === 400 || withMeta.statusCode === 400;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express reconnaît un middleware d'erreur à son arité (4 paramètres)
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (isJsonParseError(err)) {
    res.status(400).json({ error: 'Corps de requête JSON invalide' });
    return;
  }

  console.error(err);
  const message = err instanceof Error ? err.message : 'Erreur interne';
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : message,
  });
}
