import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import { getUserById, loginUser, registerUser } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }

  const { email, password, role } = parsed.data;
  const result = await registerUser(email, password, role);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }

  const { email, password } = parsed.data;
  const result = await loginUser(email, password);
  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await getUserById(req.user!.id);
  if (!user) {
    throw new AppError(404, 'Utilisateur introuvable');
  }
  res.json({ user });
}
