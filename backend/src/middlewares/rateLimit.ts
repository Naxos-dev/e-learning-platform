import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// Désactivés en test : la suite vitest fait des dizaines de requêtes par fichier, bien
// au-delà de ces seuils, et tourne contre une base dédiée, pas en conditions réelles d'abus.
function skipInTest(): boolean {
  return env.NODE_ENV === 'test';
}

function jsonRateLimitHandler(message: string) {
  return (_req: Request, res: Response): void => {
    res.status(429).json({ error: message });
  };
}

export const generalApiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => skipInTest() || req.path === '/health',
  handler: jsonRateLimitHandler('Trop de requêtes, réessayez dans quelques minutes.'),
});

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: jsonRateLimitHandler('Trop de tentatives, réessayez dans 15 minutes.'),
});

export const presignVideoLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: jsonRateLimitHandler("Trop de demandes d'upload vidéo, réessayez dans 15 minutes."),
});
