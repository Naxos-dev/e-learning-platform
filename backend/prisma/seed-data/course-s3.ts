import type { CourseSeed } from './types.js';

export const s3Course: CourseSeed = {
  title: 'AWS S3 & stockage de fichiers',
  description:
    'Stocker et servir des fichiers à grande échelle avec AWS S3 : buckets, permissions, URLs pré-signées et bonnes pratiques de sécurité.',
  authorEmail: 'marie.dev@example.com',
  chapters: [
    {
      title: 'Buckets, objets et permissions',
      content:
        'S3 (Simple Storage Service) organise le stockage en buckets (des conteneurs de premier niveau, au nom unique) contenant des objets (les fichiers eux-mêmes), chacun identifié par une clé (key) qui ressemble à un chemin de fichier (videos/chapitre-1/intro.mp4) mais reste en réalité un identifiant plat, sans réelle notion de dossier au niveau du stockage.\n\n' +
        'Par défaut, un bucket et ses objets sont privés : personne d’autre que le propriétaire du compte AWS n’y a accès. Rendre un bucket public nécessite deux choses distinctes : désactiver le "Block Public Access" (qui bloque toute tentative de rendre le contenu public, même par erreur) et définir une bucket policy explicite autorisant l’action s3:GetObject pour tout le monde (Principal: "*").\n\n' +
        'La gestion des accès se fait à deux niveaux complémentaires : les bucket policies (attachées au bucket, définissent qui peut faire quoi dessus) et les politiques IAM (attachées à un utilisateur ou un rôle, définissent ce que cet utilisateur peut faire sur quelles ressources AWS). Le principe du moindre privilège recommande de ne jamais donner plus de permissions que nécessaire : un utilisateur applicatif qui upload des vidéos n’a besoin que de s3:PutObject, pas d’un accès complet au compte AWS.',
      quiz: [
        {
          text: 'Que représente la "clé" (key) d’un objet S3 ?',
          options: [
            { text: 'Un identifiant unique de l’objet dans le bucket, qui ressemble à un chemin mais reste un identifiant plat', isCorrect: true },
            { text: 'Le mot de passe pour accéder au bucket', isCorrect: false },
            { text: 'La taille du fichier en octets', isCorrect: false },
            { text: 'La région AWS où est stocké le fichier', isCorrect: false },
          ],
        },
        {
          text: 'Que faut-il faire pour rendre un bucket S3 public en lecture ?',
          options: [
            { text: 'Désactiver Block Public Access ET définir une bucket policy autorisant s3:GetObject publiquement', isCorrect: true },
            { text: 'Rien, les buckets sont publics par défaut', isCorrect: false },
            { text: 'Supprimer le compte AWS', isCorrect: false },
            { text: 'Changer uniquement la région du bucket', isCorrect: false },
          ],
        },
        {
          text: 'Quel est le principe du moindre privilège appliqué à un utilisateur IAM applicatif ?',
          options: [
            {
              text: 'Ne lui donner que les permissions strictement nécessaires à sa tâche (ex : PutObject uniquement pour un service d’upload)',
              isCorrect: true,
            },
            { text: 'Toujours donner un accès administrateur complet pour simplifier', isCorrect: false },
            { text: 'Ne jamais créer d’utilisateur IAM', isCorrect: false },
            { text: 'Donner accès à tous les buckets du compte par défaut', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'URLs pré-signées : upload et lecture sécurisés',
      content:
        'Une URL pré-signée est une URL temporaire, générée côté serveur à partir des identifiants AWS, qui accorde une permission précise (par exemple, uploader un fichier à une clé donnée) pendant une durée limitée, sans jamais exposer les vraies credentials AWS au client. Le serveur signe la requête cryptographiquement ; S3 vérifie cette signature à la réception.\n\n' +
        'Ce mécanisme permet l’upload direct navigateur → S3, sans faire transiter le fichier par le serveur applicatif : le backend génère uniquement l’URL signée (une opération légère, purement locale, sans appel réseau à AWS), et le navigateur fait ensuite un PUT direct vers S3 avec le fichier. Ça évite de saturer la bande passante et la mémoire du serveur applicatif avec des fichiers volumineux.\n\n' +
        'Le même principe fonctionne pour la lecture : plutôt qu’un bucket public, on peut générer des URLs pré-signées de lecture (GET), valables quelques minutes, pour donner un accès temporaire et contrôlé à un fichier normalement privé — utile pour des documents sensibles ou des contenus réservés aux utilisateurs authentifiés et autorisés.',
      quiz: [
        {
          text: 'Quel est l’intérêt principal d’une URL pré-signée pour l’upload de fichiers ?',
          options: [
            { text: 'Permettre un upload direct navigateur → S3 sans faire transiter le fichier par le serveur applicatif', isCorrect: true },
            { text: 'Chiffrer le fichier avant l’envoi', isCorrect: false },
            { text: 'Réduire la taille du fichier uploadé', isCorrect: false },
            { text: 'Remplacer le besoin d’authentification JWT', isCorrect: false },
          ],
        },
        {
          text: 'Comment le backend génère-t-il une URL pré-signée ?',
          options: [
            { text: 'En signant localement la requête avec ses identifiants AWS, sans appel réseau à S3', isCorrect: true },
            { text: 'En envoyant d’abord le fichier complet à AWS', isCorrect: false },
            { text: 'En demandant à l’utilisateur de la créer manuellement', isCorrect: false },
            { text: 'Il ne peut pas, seul AWS peut générer ces URLs', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi générer une URL pré-signée de lecture plutôt que de rendre le bucket public ?',
          options: [
            { text: 'Pour donner un accès temporaire et contrôlé à un fichier normalement privé', isCorrect: true },
            { text: 'Parce que S3 ne permet pas les buckets publics', isCorrect: false },
            { text: 'Pour réduire les coûts de stockage', isCorrect: false },
            { text: 'Ça n’apporte aucun bénéfice par rapport à un bucket public', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'CORS et bonnes pratiques de production',
      content:
        'Un upload direct depuis le navigateur vers S3 déclenche une requête cross-origin (le domaine de l’app est différent du domaine S3), donc le bucket doit avoir une configuration CORS explicite autorisant les méthodes utilisées (PUT, GET) depuis les origines autorisées (le domaine de production, et localhost en développement) — sans quoi le navigateur bloque la requête avant même qu’elle n’atteigne S3.\n\n' +
        'Pour limiter les coûts et les risques, on valide côté serveur le type de contenu autorisé avant de générer l’URL pré-signée (une liste blanche de content-types comme video/mp4), et on structure les clés S3 de façon prévisible et namespacée (videos/{chapterId}/{uuid}.{ext}) pour faciliter le nettoyage, l’organisation et éviter les collisions entre fichiers.\n\n' +
        'En production, il est recommandé de mettre en place un cycle de vie sur le bucket (lifecycle rules) pour supprimer automatiquement les fichiers orphelins ou temporaires après un délai, et de surveiller les coûts via des alertes de facturation AWS — le stockage S3 est peu coûteux au gigaoctet, mais la facture peut grimper avec un volume de trafic sortant important et non anticipé.',
      quiz: [
        {
          text: 'Pourquoi un bucket S3 doit-il avoir une configuration CORS pour l’upload direct depuis le navigateur ?',
          options: [
            {
              text: 'Parce que c’est une requête cross-origin, bloquée par le navigateur sans autorisation CORS explicite du bucket',
              isCorrect: true,
            },
            { text: 'Pour accélérer l’upload', isCorrect: false },
            { text: 'CORS n’est pas nécessaire pour S3', isCorrect: false },
            { text: 'Pour chiffrer automatiquement les fichiers', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi valider le content-type autorisé avant de générer l’URL pré-signée ?',
          options: [
            { text: 'Pour limiter les types de fichiers uploadables à une liste blanche définie côté serveur', isCorrect: true },
            { text: 'Ça n’a aucun effet, S3 valide toujours lui-même', isCorrect: false },
            { text: 'Pour compresser automatiquement le fichier', isCorrect: false },
            { text: 'Pour accélérer la génération de l’URL', isCorrect: false },
          ],
        },
        {
          text: 'Que permettent les lifecycle rules d’un bucket S3 ?',
          options: [
            { text: 'Supprimer automatiquement des fichiers (orphelins, temporaires) après un délai défini', isCorrect: true },
            { text: 'Chiffrer automatiquement tous les objets', isCorrect: false },
            { text: 'Rendre le bucket public automatiquement', isCorrect: false },
            { text: 'Générer des URLs pré-signées automatiquement', isCorrect: false },
          ],
        },
      ],
    },
  ],
};
