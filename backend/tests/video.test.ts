import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { s3Client } from '../src/config/s3.js';
import { MAX_VIDEO_BYTES } from '../src/schemas/video.schema.js';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

// Le SDK S3 signe les URLs localement (pas d'appel réseau) mais DeleteObject en ferait un ;
// on le mocke pour garder les tests rapides, déterministes et sans dépendance réseau.
vi.spyOn(s3Client, 'send').mockResolvedValue({} as never);

const ONE_MB = 1024 * 1024;

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
      .send({ contentType: 'video/mp4', fileSize: ONE_MB });
    expect(res.status).toBe(403);
  });

  it('rejects an unsupported content type', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'application/pdf', fileSize: ONE_MB });
    expect(res.status).toBe(400);
  });

  it('rejects a presign request missing fileSize', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4' });
    expect(res.status).toBe(400);
  });

  it('rejects a zero or negative fileSize', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4', fileSize: 0 });
    expect(res.status).toBe(400);
  });

  it('rejects a fileSize above the 100 Mo limit', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4', fileSize: MAX_VIDEO_BYTES + 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/100 Mo/);
  });

  it('generates a presigned URL scoped to the chapter', async () => {
    const { token, chapterId } = await setupChapter();
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4', fileSize: ONE_MB });
    expect(res.status).toBe(200);
    expect(res.body.videoKey).toMatch(new RegExp(`^videos/${chapterId}/.+\\.mp4$`));
    expect(res.body.uploadUrl).toContain(res.body.videoKey);
  });

  it('signs the upload URL with Content-Length pinned to fileSize', async () => {
    const { token, chapterId } = await setupChapter();
    const fileSize = 42 * ONE_MB;
    const res = await request(app)
      .post(`/api/chapters/${chapterId}/video/presign`)
      .set(...authHeader(token))
      .send({ contentType: 'video/mp4', fileSize });
    expect(res.status).toBe(200);

    // Content-Length n'est pas un en-tête "x-amz-*" : il n'est jamais hissé dans la query
    // string (voir @smithy/signature-v4 moveHeadersToQuery), donc il reste un en-tête
    // classique signé. Un PUT avec un Content-Length différent casse la signature côté S3.
    const signedHeaders = new URL(res.body.uploadUrl).searchParams.get('X-Amz-SignedHeaders');
    expect(signedHeaders).toContain('content-length');
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
      .send({ contentType: 'video/mp4', fileSize: ONE_MB });

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
