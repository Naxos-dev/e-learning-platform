import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { s3Client } from '../src/config/s3.js';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

// Le SDK S3 signe les URLs localement (pas d'appel réseau) mais DeleteObject en ferait un ;
// on le mocke pour garder les tests rapides, déterministes et sans dépendance réseau.
vi.spyOn(s3Client, 'send').mockResolvedValue({} as never);

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

describe('Video upload', () => {
  it('rejects presign for a non-owner formateur', async () => {
    const { chapterId } = await setupChapter();
    const { token: otherToken } = await registerUser(uniqueEmail('other'), 'FORMATEUR');
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(otherToken))
      .send({ contentType: 'video/mp4' });
    expect(res.status).toBe(403);
  });

  it('rejects an unsupported content type', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'application/pdf' });
    expect(res.status).toBe(400);
  });

  it('generates a presigned URL scoped to the chapter', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4' });
    expect(res.status).toBe(200);
    expect(res.body.videoKey).toMatch(new RegExp(`^videos/${chapterId}/.+\\.mp4$`));
    expect(res.body.uploadUrl).toContain(res.body.videoKey);
  });

  it('rejects confirming a videoKey that does not belong to the chapter', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .patch(`/api/chapters/${chapterId}/video`)
      .set(...authHeader(token))
      .send({ videoKey: 'videos/some-other-chapter/file.mp4' });
    expect(res.status).toBe(400);
  });

  it('rejects a videoKey using a path segment to point outside this chapter', async () => {
    const { token, chapterId } = await setupChapter();
    const { chapterId: otherChapterId } = await setupChapter();
    const res = await request(app)
      .patch(`/api/chapters/${chapterId}/video`)
      .set(...authHeader(token))
      .send({ videoKey: `videos/${chapterId}/../${otherChapterId}/x.mp4` });
    expect(res.status).toBe(400);
  });

  it('rejects a videoKey with an unexpected extension or malformed uuid segment', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .patch(`/api/chapters/${chapterId}/video`)
      .set(...authHeader(token))
      .send({ videoKey: `videos/${chapterId}/not-a-uuid.mp4` });
    expect(res.status).toBe(400);
  });

  it('confirms an upload then clears it on delete', async () => {
    const { token, chapterId } = await setupChapter();
    const presign = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4' });

    const confirm = await request(app)
      .patch(`/api/chapters/${chapterId}/video`)
      .set(...authHeader(token))
      .send({ videoKey: presign.body.videoKey });
    expect(confirm.status).toBe(200);
    expect(confirm.body.videoUrl).toContain(presign.body.videoKey);

    const del = await request(app).delete(`/api/chapters/${chapterId}/video`).set(...authHeader(token));
    expect(del.status).toBe(200);
    expect(del.body.videoUrl).toBeNull();
    expect(del.body.videoKey).toBeNull();
    expect(s3Client.send).toHaveBeenCalled();
  });
});
