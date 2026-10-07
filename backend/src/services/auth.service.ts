import type { Role, User } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { notifyNewRegistration } from './email.service.js';

export interface SafeUser {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

function toSafeUser(user: User): SafeUser {
  return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
}

export async function registerUser(email: string, password: string): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Un compte existe déjà avec cet email');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  await notifyNewRegistration(user.email, user.role);

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: toSafeUser(user), token };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError(401, 'Identifiants invalides');
  }

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: toSafeUser(user), token };
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toSafeUser(user) : null;
}
