import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it } from 'vitest';
import { env } from '../src/config/env.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

function createMockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res;
}

const req = {} as Request;
const next = (() => {}) as NextFunction;

describe('errorHandler', () => {
  it('turns a body-parser JSON SyntaxError into 400 with no internal parser detail', () => {
    const parseError = Object.assign(new SyntaxError('Unexpected token b in JSON at position 1'), {
      status: 400,
      statusCode: 400,
      type: 'entity.parse.failed',
    });
    const res = createMockRes();

    errorHandler(parseError, req, res as unknown as Response, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Corps de requête JSON invalide' });
  });

  it('never leaks the internal message or a stack trace for an unexpected 500 in production', () => {
    const original = env.NODE_ENV;
    env.NODE_ENV = 'production';
    try {
      const res = createMockRes();
      errorHandler(new Error('mot de passe incorrect pour user@internal.example'), req, res as unknown as Response, next);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Erreur interne du serveur' });
      expect(JSON.stringify(res.body)).not.toContain('user@internal.example');
      expect(JSON.stringify(res.body)).not.toContain('at ');
    } finally {
      env.NODE_ENV = original;
    }
  });

  it('still shows the real message outside production, for local debugging', () => {
    const res = createMockRes();

    errorHandler(new Error('boom'), req, res as unknown as Response, next);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'boom' });
  });
});
