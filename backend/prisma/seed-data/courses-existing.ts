import type { CourseSeed } from './types.js';

// URL/clé du fichier réellement uploadé sur S3 lors du test de production (voir README) :
// réattachées ici pour que le reseed reste idempotent sans perdre la vidéo de démo.
const VUE3_INTRO_VIDEO_URL =
  'https://elearning-videos-555126922388-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com/videos/7265f3c8-3edd-45ec-8a34-5b9ddc4e498b/79569b97-f41d-41e0-a94f-aa1cc12a8ba1.mp4';
const VUE3_INTRO_VIDEO_KEY = 'videos/7265f3c8-3edd-45ec-8a34-5b9ddc4e498b/79569b97-f41d-41e0-a94f-aa1cc12a8ba1.mp4';

export const existingCourses: CourseSeed[] = [
  {
    title: 'Vue 3 : les fondamentaux',
    description:
      "Apprenez à construire des interfaces réactives avec Vue 3 : Composition API, réactivité, routing et gestion d'état.",
    authorEmail: 'formateur.demo@example.com',
    chapters: [
      {
        title: 'Introduction à Vue 3',
        content:
          'Vue 3 introduit un moteur de réactivité basé sur les Proxy JavaScript, plus rapide et plus prévisible que Vue 2. ' +
          "Dans ce chapitre, on installe un projet avec Vite et on découvre la structure d'un composant single-file (.vue).",
        videoUrl: VUE3_INTRO_VIDEO_URL,
        videoKey: VUE3_INTRO_VIDEO_KEY,
      },
      {
        title: 'La Composition API en pratique',
        content:
          'ref() et reactive() sont les deux primitives de base pour créer un état réactif. computed() dérive une valeur ' +
          "en lecture seule, et watch()/watchEffect() réagissent aux changements. On construit un compteur puis un formulaire.",
        quiz: [
          {
            text: 'Quelle fonction rend une valeur primitive (string, number...) réactive ?',
            options: [
              { text: 'ref()', isCorrect: true },
              { text: 'toRef()', isCorrect: false },
              { text: 'defineProps()', isCorrect: false },
            ],
          },
          {
            text: 'Que retourne computed() ?',
            options: [
              { text: "Une valeur réactive en lecture seule, dérivée d'autres refs", isCorrect: true },
              { text: 'Une fonction à appeler manuellement à chaque rendu', isCorrect: false },
              { text: 'Un composant Vue enregistré globalement', isCorrect: false },
              { text: 'Un plugin Vue Router', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Vue Router & Pinia',
        content:
          "Vue Router gère la navigation côté client et les guards (beforeEach) pour protéger des routes selon l'authentification. " +
          'Pinia remplace Vuex pour la gestion d’état global avec une API plus simple basée sur des stores composables.',
        quiz: [
          {
            text: 'Quel hook de Vue Router permet de bloquer une navigation avant qu’elle ait lieu ?',
            options: [
              { text: 'router.beforeEach', isCorrect: true },
              { text: 'onMounted', isCorrect: false },
              { text: 'nextTick', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Node.js & Express : construire une API REST',
    description:
      'De zéro à une API sécurisée : routing, middlewares, validation, authentification JWT et gestion des erreurs.',
    authorEmail: 'formateur.demo@example.com',
    chapters: [
      {
        title: 'Mise en place du serveur Express',
        content:
          "Installation d'Express, structure routes/controllers/services, et configuration des middlewares de base " +
          '(helmet, cors, express.json).',
      },
      {
        title: 'Routes, middlewares et gestion des erreurs',
        content:
          'Un middleware de gestion des erreurs se reconnaît à ses 4 paramètres (err, req, res, next). On centralise ' +
          'les erreurs métier avec une classe AppError plutôt que de dupliquer des try/catch partout.',
        quiz: [
          {
            text: 'Combien de paramètres possède un middleware de gestion des erreurs Express ?',
            options: [
              { text: '4', isCorrect: true },
              { text: '2', isCorrect: false },
              { text: '3', isCorrect: false },
              { text: '1', isCorrect: false },
            ],
          },
          {
            text: 'Quel code HTTP signifie « ressource non trouvée » ?',
            options: [
              { text: '404', isCorrect: true },
              { text: '200', isCorrect: false },
              { text: '401', isCorrect: false },
              { text: '500', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Authentification JWT',
        content:
          'Le token JWT signé est envoyé par le client dans le header Authorization (Bearer). Un middleware ' +
          "authenticate le vérifie et attache l'utilisateur à req.user avant les routes protégées.",
        quiz: [
          {
            text: 'Où le client doit-il envoyer le token JWT pour authentifier une requête ?',
            options: [
              { text: 'Dans le header Authorization (Bearer)', isCorrect: true },
              { text: "Dans l'URL, en paramètre visible", isCorrect: false },
              { text: "Il n'est jamais renvoyé au serveur", isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'PostgreSQL & Prisma pour les développeurs JS',
    description: 'Modéliser un schéma relationnel, écrire des migrations et interroger sa base avec Prisma ORM.',
    authorEmail: 'marie.dev@example.com',
    chapters: [
      {
        title: 'Modéliser son schéma avec Prisma',
        content:
          'Le schema.prisma décrit les modèles, leurs relations (1-1, 1-n, n-n) et les contraintes (@unique, @@index). ' +
          'Prisma génère ensuite un client TypeScript entièrement typé à partir de ce schéma.',
      },
      {
        title: 'Migrations et requêtes',
        content:
          "prisma migrate dev crée et applique les migrations en local (avec shadow database). En production, on utilise " +
          'prisma migrate deploy, qui applique les migrations existantes sans en générer de nouvelles.',
        quiz: [
          {
            text: 'Quelle commande applique les migrations existantes en production, sans en générer de nouvelles ?',
            options: [
              { text: 'prisma migrate deploy', isCorrect: true },
              { text: 'prisma migrate dev', isCorrect: false },
              { text: 'prisma db push', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
];
