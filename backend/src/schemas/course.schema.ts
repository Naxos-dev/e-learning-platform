import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Le titre doit faire au moins 3 caractères').max(200),
  description: z.string().trim().max(2000).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
