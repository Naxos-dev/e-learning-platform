import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

async function setupCourseWithTwoChapters() {
  const { token: formateurToken } = await registerUser(uniqueEmail('formateur'), 'FORMATEUR');
  const course = await request(app)
    .post('/api/courses')
    .set(...authHeader(formateurToken))
    .send({ title: 'Cours' });
  const chapter1 = await request(app)
    .post(`/api/courses/${course.body.id}/chapters`)
    .set(...authHeader(formateurToken))
    .send({ title: 'Ch1', content: 'Contenu 1' });
  const chapter2 = await request(app)
    .post(`/api/courses/${course.body.id}/chapters`)
    .set(...authHeader(formateurToken))
    .send({ title: 'Ch2', content: 'Contenu 2' });

  return {
    formateurToken,
    courseId: course.body.id as string,
    chapter1Id: chapter1.body.id as string,
    chapter2Id: chapter2.body.id as string,
  };
}

describe('Chapter access (free preview & enrollment gating)', () => {
  it('serves the first chapter in full to a logged-in, non-enrolled apprenant', async () => {
    const { chapter1Id } = await setupCourseWithTwoChapters();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');

    const res = await request(app)
      .get(`/api/chapters/${chapter1Id}`)
      .set(...authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(false);
    expect(res.body.content).toBe('Contenu 1');
  });

  it('locks a non-first chapter for a non-enrolled apprenant, without a content leak', async () => {
    const { chapter2Id } = await setupCourseWithTwoChapters();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');

    const res = await request(app)
      .get(`/api/chapters/${chapter2Id}`)
      .set(...authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(true);
    expect(res.body.content).toBeNull();
  });

  it('unlocks the non-first chapter once the apprenant enrolls', async () => {
    const { courseId, chapter2Id } = await setupCourseWithTwoChapters();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');

    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(token));

    const res = await request(app)
      .get(`/api/chapters/${chapter2Id}`)
      .set(...authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(false);
    expect(res.body.content).toBe('Contenu 2');
  });

  it('always gives the course author full access, enrolled or not', async () => {
    const { formateurToken, chapter2Id } = await setupCourseWithTwoChapters();

    const res = await request(app)
      .get(`/api/chapters/${chapter2Id}`)
      .set(...authHeader(formateurToken));
    expect(res.status).toBe(200);
    expect(res.body.locked).toBe(false);
    expect(res.body.content).toBe('Contenu 2');
  });

  it('requires authentication regardless of free-preview status', async () => {
    const { chapter1Id } = await setupCourseWithTwoChapters();
    const res = await request(app).get(`/api/chapters/${chapter1Id}`);
    expect(res.status).toBe(401);
  });
});
