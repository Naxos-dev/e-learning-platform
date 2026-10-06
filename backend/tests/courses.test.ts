import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

async function setupFormateur(prefix = 'formateur') {
  return registerUser(uniqueEmail(prefix), 'FORMATEUR');
}

describe('Courses & chapters', () => {
  it('forbids an apprenant from creating a course', async () => {
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');
    const res = await request(app)
      .post('/api/courses')
      .set(...authHeader(token))
      .send({ title: 'Hack' });
    expect(res.status).toBe(403);
  });

  it('lets a formateur create a course and list it publicly without auth', async () => {
    const { token } = await setupFormateur();
    const create = await request(app)
      .post('/api/courses')
      .set(...authHeader(token))
      .send({ title: 'Vue 3', description: 'desc' });
    expect(create.status).toBe(201);

    const list = await request(app).get('/api/courses');
    expect(list.status).toBe(200);
    expect(list.body.some((c: { id: string }) => c.id === create.body.id)).toBe(true);
  });

  it('returns 404 for an unknown course', async () => {
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('rejects a title that is too short', async () => {
    const { token } = await setupFormateur();
    const res = await request(app)
      .post('/api/courses')
      .set(...authHeader(token))
      .send({ title: 'ab' });
    expect(res.status).toBe(400);
  });

  it('auto-increments chapter order and rejects an explicit conflict', async () => {
    const { token } = await setupFormateur();
    const course = await request(app)
      .post('/api/courses')
      .set(...authHeader(token))
      .send({ title: 'Cours' });
    const courseId = course.body.id as string;

    const ch1 = await request(app)
      .post(`/api/courses/${courseId}/chapters`)
      .set(...authHeader(token))
      .send({ title: 'Ch1' });
    expect(ch1.body.order).toBe(1);

    const ch2 = await request(app)
      .post(`/api/courses/${courseId}/chapters`)
      .set(...authHeader(token))
      .send({ title: 'Ch2' });
    expect(ch2.body.order).toBe(2);

    const conflict = await request(app)
      .post(`/api/courses/${courseId}/chapters`)
      .set(...authHeader(token))
      .send({ title: 'Dup', order: 1 });
    expect(conflict.status).toBe(409);
  });

  it("prevents a formateur from editing another formateur's course", async () => {
    const { token: tokenA } = await setupFormateur('a');
    const { token: tokenB } = await setupFormateur('b');
    const course = await request(app)
      .post('/api/courses')
      .set(...authHeader(tokenA))
      .send({ title: 'Owned' });

    const res = await request(app)
      .patch(`/api/courses/${course.body.id}`)
      .set(...authHeader(tokenB))
      .send({ title: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('cascades chapter deletion when the course is deleted', async () => {
    const { token } = await setupFormateur();
    const course = await request(app)
      .post('/api/courses')
      .set(...authHeader(token))
      .send({ title: 'Cours' });
    const chapter = await request(app)
      .post(`/api/courses/${course.body.id}/chapters`)
      .set(...authHeader(token))
      .send({ title: 'Ch' });

    const del = await request(app)
      .delete(`/api/courses/${course.body.id}`)
      .set(...authHeader(token));
    expect(del.status).toBe(204);

    const getChapter = await request(app)
      .get(`/api/chapters/${chapter.body.id}`)
      .set(...authHeader(token));
    expect(getChapter.status).toBe(404);
  });
});
