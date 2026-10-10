// Pas de champ "name" sur User (aucun formulaire ne permet d'en saisir un) : on dérive un
// nom d'affichage de la partie locale de l'email, jamais du domaine, pour ne jamais exposer
// l'email lui-même dans les réponses publiques (ex. author.email sur GET /api/courses).
export function emailToDisplayName(email: string): string {
  return email.split('@')[0]!;
}
