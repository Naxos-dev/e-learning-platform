import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { s3Client } from '../config/s3.js';
import { VIDEO_CONTENT_TYPES, type PresignVideoInput } from '../schemas/video.schema.js';
import { AppError } from '../utils/AppError.js';
import { assertChapterOwner } from './chapter.service.js';

const UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;

function buildVideoUrl(key: string): string {
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

async function deleteObjectSafe(key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }));
  } catch (err) {
    console.error(`Échec de la suppression S3 pour la clé ${key}`, err);
  }
}

export async function createUploadUrl(
  chapterId: string,
  userId: string,
  contentType: PresignVideoInput['contentType'],
) {
  await assertChapterOwner(chapterId, userId);

  const extension = VIDEO_CONTENT_TYPES[contentType];
  const videoKey = `videos/${chapterId}/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: videoKey,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });

  return { uploadUrl, videoKey };
}

export async function confirmUpload(chapterId: string, userId: string, videoKey: string) {
  const chapter = await assertChapterOwner(chapterId, userId);

  if (!videoKey.startsWith(`videos/${chapterId}/`)) {
    throw new AppError(400, 'videoKey ne correspond pas à ce chapitre');
  }

  const previousKey = chapter.videoKey;
  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: { videoKey, videoUrl: buildVideoUrl(videoKey) },
  });

  if (previousKey && previousKey !== videoKey) {
    await deleteObjectSafe(previousKey);
  }

  return updated;
}

export async function deleteVideo(chapterId: string, userId: string) {
  const chapter = await assertChapterOwner(chapterId, userId);

  if (chapter.videoKey) {
    await deleteObjectSafe(chapter.videoKey);
  }

  return prisma.chapter.update({
    where: { id: chapterId },
    data: { videoKey: null, videoUrl: null },
  });
}
