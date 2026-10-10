import { z } from 'zod';

const VIDEO_CONTENT_TYPE_LIST = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const VIDEO_CONTENT_TYPES: Record<(typeof VIDEO_CONTENT_TYPE_LIST)[number], string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_VIDEO_MB = MAX_VIDEO_BYTES / (1024 * 1024);

export const presignVideoSchema = z.object({
  contentType: z.enum(VIDEO_CONTENT_TYPE_LIST),
  // Taille réelle du fichier (octets), signée comme ContentLength sur l'URL S3 : voir
  // video.service.ts, c'est elle qui fait refuser par S3 tout upload d'une autre taille.
  fileSize: z
    .number()
    .int('fileSize doit être un entier')
    .positive('fileSize doit être positif')
    .max(MAX_VIDEO_BYTES, `La vidéo dépasse la taille maximale autorisée (${MAX_VIDEO_MB} Mo)`),
});

export const confirmVideoSchema = z.object({
  videoKey: z.string().min(1, 'videoKey est requis'),
});

export type PresignVideoInput = z.infer<typeof presignVideoSchema>;
export type ConfirmVideoInput = z.infer<typeof confirmVideoSchema>;
