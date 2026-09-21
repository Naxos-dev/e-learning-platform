import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requise (connexion directe PostgreSQL)'),
  DATABASE_URL_POOLED: z
    .string()
    .min(1, 'DATABASE_URL_POOLED est requise (connexion poolée PostgreSQL)'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables d\'environnement invalides :', z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
