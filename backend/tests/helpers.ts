import { Role } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { signAccessToken } from '../src/utils/jwt.js';

export const app: Express = createApp();

interface AuthResponse {
  user: { id: string; email: string; role: Role; createdAt: string };
  token: string;
}

let counter = 0;
export function uniqueEmail(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}@example.com`;
}

// L'inscription publique (POST /api/auth/register) crée toujours un APPRENANT : il n'y a
// plus de champ `role` dans son contrat. Pour les tests qui ont besoin d'un FORMATEUR, on
// promeut directement en base après coup (ce qu'un vrai octroi de rôle ferait) et on
// resigne un token à jour, puisque le rôle du token initial resterait APPRENANT sinon.
export async function registerUser(
  email: string,
  role: Role = Role.APPRENANT,
  password = 'password123',
): Promise<AuthResponse> {
  const res = await request(app).post('/api/auth/register').send({ email, password });
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const body = res.body as AuthResponse;

  if (role === Role.APPRENANT) {
    return body;
  }

  const user = await prisma.user.update({ where: { id: body.user.id }, data: { role } });
  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: { ...body.user, role: user.role }, token };
}

export function authHeader(token: string): [string, string] {
  return ['Authorization', `Bearer ${token}`];
}
