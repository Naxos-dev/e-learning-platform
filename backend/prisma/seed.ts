import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

// Comptes "vitrine" à utiliser pour la démo (identifiants partagés dans le README).
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_EMAILS = [
  'formateur.demo@example.com',
  'marie.dev@example.com',
  'apprenant.demo@example.com',
  'lucas.moreau@example.com',
  'sofia.nguyen@example.com',
  'thomas.roux@example.com',
];

async function main() {
  // Idempotent : supprime toute donnée de démo précédente avant de reseeder (cascade sur tout le reste).
  await prisma.user.deleteMany({ where: { email: { in: DEMO_EMAILS } } });

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const formateur = await prisma.user.create({
    data: { email: 'formateur.demo@example.com', passwordHash, role: Role.FORMATEUR },
  });
  const marie = await prisma.user.create({
    data: { email: 'marie.dev@example.com', passwordHash, role: Role.FORMATEUR },
  });
  const apprenant = await prisma.user.create({
    data: { email: 'apprenant.demo@example.com', passwordHash, role: Role.APPRENANT },
  });
  const lucas = await prisma.user.create({
    data: { email: 'lucas.moreau@example.com', passwordHash, role: Role.APPRENANT },
  });
  const sofia = await prisma.user.create({
    data: { email: 'sofia.nguyen@example.com', passwordHash, role: Role.APPRENANT },
  });
  const thomas = await prisma.user.create({
    data: { email: 'thomas.roux@example.com', passwordHash, role: Role.APPRENANT },
  });

  // --- Cours 1 : Vue 3 (formateur.demo) ---
  const course1 = await prisma.course.create({
    data: {
      authorId: formateur.id,
      title: 'Vue 3 : les fondamentaux',
      description:
        "Apprenez à construire des interfaces réactives avec Vue 3 : Composition API, réactivité, routing et gestion d'état.",
    },
  });

  const c1ch1 = await prisma.chapter.create({
    data: {
      courseId: course1.id,
      order: 1,
      title: 'Introduction à Vue 3',
      content:
        "Vue 3 introduit un moteur de réactivité basé sur les Proxy JavaScript, plus rapide et plus prévisible que Vue 2. " +
        "Dans ce chapitre, on installe un projet avec Vite et on découvre la structure d'un composant single-file (.vue).",
    },
  });

  const c1ch2 = await prisma.chapter.create({
    data: {
      courseId: course1.id,
      order: 2,
      title: 'La Composition API en pratique',
      content:
        "ref() et reactive() sont les deux primitives de base pour créer un état réactif. computed() dérive une valeur " +
        "en lecture seule, et watch()/watchEffect() réagissent aux changements. On construit un compteur puis un formulaire.",
      quiz: {
        create: {
          questions: {
            create: [
              {
                text: 'Quelle fonction rend une valeur primitive (string, number...) réactive ?',
                options: {
                  create: [
                    { text: 'ref()', isCorrect: true },
                    { text: 'toRef()', isCorrect: false },
                    { text: 'defineProps()', isCorrect: false },
                  ],
                },
              },
              {
                text: 'Que retourne computed() ?',
                options: {
                  create: [
                    { text: "Une valeur réactive en lecture seule, dérivée d'autres refs", isCorrect: true },
                    { text: 'Une fonction à appeler manuellement à chaque rendu', isCorrect: false },
                    { text: 'Un composant Vue enregistré globalement', isCorrect: false },
                    { text: 'Un plugin Vue Router', isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  const c1ch3 = await prisma.chapter.create({
    data: {
      courseId: course1.id,
      order: 3,
      title: 'Vue Router & Pinia',
      content:
        "Vue Router gère la navigation côté client et les guards (beforeEach) pour protéger des routes selon l'authentification. " +
        'Pinia remplace Vuex pour la gestion d’état global avec une API plus simple basée sur des stores composables.',
      quiz: {
        create: {
          questions: {
            create: [
              {
                text: 'Quel hook de Vue Router permet de bloquer une navigation avant qu’elle ait lieu ?',
                options: {
                  create: [
                    { text: 'router.beforeEach', isCorrect: true },
                    { text: 'onMounted', isCorrect: false },
                    { text: 'nextTick', isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  // --- Cours 2 : Node/Express (formateur.demo) ---
  const course2 = await prisma.course.create({
    data: {
      authorId: formateur.id,
      title: 'Node.js & Express : construire une API REST',
      description:
        'De zéro à une API sécurisée : routing, middlewares, validation, authentification JWT et gestion des erreurs.',
    },
  });

  const c2ch1 = await prisma.chapter.create({
    data: {
      courseId: course2.id,
      order: 1,
      title: 'Mise en place du serveur Express',
      content:
        "Installation d'Express, structure routes/controllers/services, et configuration des middlewares de base " +
        '(helmet, cors, express.json).',
    },
  });

  const c2ch2 = await prisma.chapter.create({
    data: {
      courseId: course2.id,
      order: 2,
      title: 'Routes, middlewares et gestion des erreurs',
      content:
        'Un middleware de gestion des erreurs se reconnaît à ses 4 paramètres (err, req, res, next). On centralise ' +
        'les erreurs métier avec une classe AppError plutôt que de dupliquer des try/catch partout.',
      quiz: {
        create: {
          questions: {
            create: [
              {
                text: 'Combien de paramètres possède un middleware de gestion des erreurs Express ?',
                options: {
                  create: [
                    { text: '4', isCorrect: true },
                    { text: '2', isCorrect: false },
                    { text: '3', isCorrect: false },
                    { text: '1', isCorrect: false },
                  ],
                },
              },
              {
                text: "Quel code HTTP signifie « ressource non trouvée » ?",
                options: {
                  create: [
                    { text: '404', isCorrect: true },
                    { text: '200', isCorrect: false },
                    { text: '401', isCorrect: false },
                    { text: '500', isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  const c2ch3 = await prisma.chapter.create({
    data: {
      courseId: course2.id,
      order: 3,
      title: 'Authentification JWT',
      content:
        'Le token JWT signé est envoyé par le client dans le header Authorization (Bearer). Un middleware ' +
        "authenticate le vérifie et attache l'utilisateur à req.user avant les routes protégées.",
      quiz: {
        create: {
          questions: {
            create: [
              {
                text: 'Où le client doit-il envoyer le token JWT pour authentifier une requête ?',
                options: {
                  create: [
                    { text: "Dans le header Authorization (Bearer)", isCorrect: true },
                    { text: "Dans l'URL, en paramètre visible", isCorrect: false },
                    { text: "Il n'est jamais renvoyé au serveur", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  // --- Cours 3 : PostgreSQL/Prisma (marie.dev) ---
  const course3 = await prisma.course.create({
    data: {
      authorId: marie.id,
      title: 'PostgreSQL & Prisma pour les développeurs JS',
      description: 'Modéliser un schéma relationnel, écrire des migrations et interroger sa base avec Prisma ORM.',
    },
  });

  const c3ch1 = await prisma.chapter.create({
    data: {
      courseId: course3.id,
      order: 1,
      title: 'Modéliser son schéma avec Prisma',
      content:
        'Le schema.prisma décrit les modèles, leurs relations (1-1, 1-n, n-n) et les contraintes (@unique, @@index). ' +
        'Prisma génère ensuite un client TypeScript entièrement typé à partir de ce schéma.',
    },
  });

  const c3ch2 = await prisma.chapter.create({
    data: {
      courseId: course3.id,
      order: 2,
      title: 'Migrations et requêtes',
      content:
        "prisma migrate dev crée et applique les migrations en local (avec shadow database). En production, on utilise " +
        'prisma migrate deploy, qui applique les migrations existantes sans en générer de nouvelles.',
      quiz: {
        create: {
          questions: {
            create: [
              {
                text: 'Quelle commande applique les migrations existantes en production, sans en générer de nouvelles ?',
                options: {
                  create: [
                    { text: 'prisma migrate deploy', isCorrect: true },
                    { text: 'prisma migrate dev', isCorrect: false },
                    { text: 'prisma db push', isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  // --- Inscriptions & progression ---

  // apprenant.demo : engagé sur le cours 1, un peu avancé sur le 2, vient de s'inscrire au 3
  const enrDemoC1 = await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: course1.id } });
  await prisma.progress.create({ data: { enrollmentId: enrDemoC1.id, chapterId: c1ch1.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrDemoC1.id, chapterId: c1ch2.id, completed: true, quizScore: 100 },
  });

  const enrDemoC2 = await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: course2.id } });
  await prisma.progress.create({ data: { enrollmentId: enrDemoC2.id, chapterId: c2ch1.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrDemoC2.id, chapterId: c2ch2.id, completed: true, quizScore: 50 },
  });

  await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: course3.id } });

  // lucas.moreau : a terminé le cours 1 en entier, avec de bons scores
  const enrLucasC1 = await prisma.enrollment.create({ data: { userId: lucas.id, courseId: course1.id } });
  await prisma.progress.create({ data: { enrollmentId: enrLucasC1.id, chapterId: c1ch1.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrLucasC1.id, chapterId: c1ch2.id, completed: true, quizScore: 100 },
  });
  await prisma.progress.create({
    data: { enrollmentId: enrLucasC1.id, chapterId: c1ch3.id, completed: true, quizScore: 100 },
  });

  // sofia.nguyen : débute le cours 1 et le cours 2
  const enrSofiaC1 = await prisma.enrollment.create({ data: { userId: sofia.id, courseId: course1.id } });
  await prisma.progress.create({ data: { enrollmentId: enrSofiaC1.id, chapterId: c1ch1.id, completed: true } });

  const enrSofiaC2 = await prisma.enrollment.create({ data: { userId: sofia.id, courseId: course2.id } });
  await prisma.progress.create({ data: { enrollmentId: enrSofiaC2.id, chapterId: c2ch1.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrSofiaC2.id, chapterId: c2ch2.id, completed: true, quizScore: 50 },
  });

  // thomas.roux : a terminé le cours 2 en entier, avec de bons scores
  const enrThomasC2 = await prisma.enrollment.create({ data: { userId: thomas.id, courseId: course2.id } });
  await prisma.progress.create({ data: { enrollmentId: enrThomasC2.id, chapterId: c2ch1.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrThomasC2.id, chapterId: c2ch2.id, completed: true, quizScore: 100 },
  });
  await prisma.progress.create({
    data: { enrollmentId: enrThomasC2.id, chapterId: c2ch3.id, completed: true, quizScore: 100 },
  });

  console.log('Seed terminé :');
  console.log('  Formateurs : formateur.demo@example.com, marie.dev@example.com');
  console.log('  Apprenants : apprenant.demo@example.com, lucas.moreau@example.com, sofia.nguyen@example.com, thomas.roux@example.com');
  console.log(`  Mot de passe (tous les comptes) : ${DEMO_PASSWORD}`);
  console.log('  3 cours, 8 chapitres, 6 questions de quiz, 7 inscriptions');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
