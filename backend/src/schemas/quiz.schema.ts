import { z } from 'zod';

const optionInputSchema = z.object({
  text: z.string().trim().min(1, "Le texte de l'option est requis").max(500),
  isCorrect: z.boolean().default(false),
});

export const questionInputSchema = z
  .object({
    text: z.string().trim().min(1, 'Le texte de la question est requis').max(1000),
    options: z.array(optionInputSchema).min(2, 'Au moins 2 options sont requises').max(8),
  })
  .refine((data) => data.options.filter((option) => option.isCorrect).length === 1, {
    message: 'Une question à choix unique doit avoir exactement une bonne réponse',
    path: ['options'],
  });

export type QuestionInput = z.infer<typeof questionInputSchema>;
