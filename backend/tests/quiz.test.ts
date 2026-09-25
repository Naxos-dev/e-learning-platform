import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

async function setupChapter() {
  const { token } = await registerUser(uniqueEmail('formateur'), 'FORMATEUR');
  const course = await request(app)
    .post('/api/courses')
    .set(...authHeader(token))
    .send({ title: 'Cours' });
  const chapter = await request(app)
    .post(`/api/courses/${course.body.id}/chapters`)
    .set(...authHeader(token))
    .send({ title: 'Ch' });
  return { token, chapterId: chapter.body.id as string };
}

describe('Quiz questions', () => {
  it('rejects a question with zero correct options', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/questions`)
      .set(...authHeader(token))
      .send({
        text: 'Q?',
        options: [
          { text: 'A', isCorrect: false },
          { text: 'B', isCorrect: false },
        ],
      });
    expect(res.status).toBe(400);
  });

  it('rejects a question with two correct options', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/questions`)
      .set(...authHeader(token))
      .send({
        text: 'Q?',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
        ],
      });
    expect(res.status).toBe(400);
  });

  it('rejects a question with fewer than 2 options', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/questions`)
      .set(...authHeader(token))
      .send({ text: 'Q?', options: [{ text: 'A', isCorrect: true }] });
    expect(res.status).toBe(400);
  });

  it('requires authentication to view a quiz', async () => {
    const { chapterId } = await setupChapter();
    const res = await request(app).get(`/api/chapters/${chapterId}/quiz`);
    expect(res.status).toBe(401);
  });

  it('hides isCorrect from a non-owner and reveals it to the owner', async () => {
    const { token, chapterId } = await setupChapter();
    await request(app)
      .post(`/api/chapters/${chapterId}/questions`)
      .set(...authHeader(token))
      .send({
        text: 'Q?',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      });

    const { token: otherToken } = await registerUser(uniqueEmail('other'), 'APPRENANT');
    const asOther = await request(app)
      .get(`/api/chapters/${chapterId}/quiz`)
      .set(...authHeader(otherToken));
    expect(asOther.status).toBe(200);
    expect(asOther.body.questions[0].options[0].isCorrect).toBeUndefined();

    const asOwner = await request(app)
      .get(`/api/chapters/${chapterId}/quiz`)
      .set(...authHeader(token));
    expect(asOwner.body.questions[0].options[0].isCorrect).toEqual(expect.any(Boolean));
  });

  it('replaces options transactionally on question update', async () => {
    const { token, chapterId } = await setupChapter();
    const created = await request(app)
      .post(`/api/chapters/${chapterId}/questions`)
      .set(...authHeader(token))
      .send({
        text: 'Q?',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      });

    const updated = await request(app)
      .patch(`/api/questions/${created.body.id}`)
      .set(...authHeader(token))
      .send({
        text: 'Q2?',
        options: [
          { text: 'C', isCorrect: false },
          { text: 'D', isCorrect: true },
        ],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.text).toBe('Q2?');
    expect(updated.body.options).toHaveLength(2);
    expect(updated.body.options.map((o: { text: string }) => o.text).sort()).toEqual(['C', 'D']);
  });
});
