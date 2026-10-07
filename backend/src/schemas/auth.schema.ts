import { z } from 'zod';

// Pas de champ `role` ici : l'inscription publique crée toujours un APPRENANT.
// Le rôle FORMATEUR est accordé à part (base de données), pour éviter que n'importe
// quel inscrit ne puisse créer des cours non désirés sur la plateforme.
export const registerSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
});

export const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
