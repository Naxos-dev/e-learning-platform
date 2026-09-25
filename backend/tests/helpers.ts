import type { Role } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app.js';

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

export async function registerUser(
  email: string,
  role?: Role,
  password = 'password123',
): Promise<AuthResponse> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password, ...(role ? { role } : {}) });
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body as AuthResponse;
}

export function authHeader(token: string): [string, string] {
  return ['Authorization', `Bearer ${token}`];
}
