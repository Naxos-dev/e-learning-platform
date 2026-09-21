import { z } from 'zod';

export const updateProgressSchema = z.object({
  completed: z.boolean(),
});

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.uuid('questionId invalide'),
        optionId: z.uuid('optionId invalide'),
      }),
    )
    .min(1, 'Au moins une réponse est requise'),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
