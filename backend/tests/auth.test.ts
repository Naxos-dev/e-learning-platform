import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

describe('Auth', () => {
  it('always registers as APPRENANT, even if the client sends a role', async () => {
    const email = uniqueEmail('formateur');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123', role: 'FORMATEUR' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('APPRENANT');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects a duplicate email with 409', async () => {
    const email = uniqueEmail('dup');
    await registerUser(email);
    const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid payloads with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const email = uniqueEmail('login');
    await registerUser(email);
    const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects login with a wrong password with 401', async () => {
    const email = uniqueEmail('badpass');
    await registerUser(email);
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with the same generic 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail('unknown'), password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user on /me with a valid token', async () => {
    const email = uniqueEmail('me');
    const { token } = await registerUser(email);
    const res = await request(app).get('/api/auth/me').set(...authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });
});
