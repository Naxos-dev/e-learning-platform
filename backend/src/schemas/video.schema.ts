import { z } from 'zod';

const VIDEO_CONTENT_TYPE_LIST = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const VIDEO_CONTENT_TYPES: Record<(typeof VIDEO_CONTENT_TYPE_LIST)[number], string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export const presignVideoSchema = z.object({
  contentType: z.enum(VIDEO_CONTENT_TYPE_LIST),
});

export const confirmVideoSchema = z.object({
  videoKey: z.string().min(1, 'videoKey est requis'),
});

export type PresignVideoInput = z.infer<typeof presignVideoSchema>;
export type ConfirmVideoInput = z.infer<typeof confirmVideoSchema>;
