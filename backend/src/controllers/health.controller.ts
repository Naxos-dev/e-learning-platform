import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const database = await checkDatabase();
  res.json({ status: 'ok', database, timestamp: new Date().toISOString() });
}

async function checkDatabase(): Promise<'up' | 'down'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'up';
  } catch {
    return 'down';
  }
}
