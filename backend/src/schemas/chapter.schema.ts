import { z } from 'zod';

export const createChapterSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(200),
  content: z.string().max(20000).optional(),
  order: z.number().int().positive('order doit être un entier positif').optional(),
});

export const updateChapterSchema = createChapterSchema.partial();

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
