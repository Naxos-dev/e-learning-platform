import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';
import { allCourseSeeds, type CourseSeed } from './seed-data/index.js';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo1234!';
const FORMATEUR_EMAILS = ['formateur.demo@example.com', 'marie.dev@example.com', 'sarah.leroy@example.com'];
const APPRENANT_EMAILS = [
  'apprenant.demo@example.com',
  'lucas.moreau@example.com',
  'sofia.nguyen@example.com',
  'thomas.roux@example.com',
];
const DEMO_EMAILS = [...FORMATEUR_EMAILS, ...APPRENANT_EMAILS];

async function createCourseFromSeed(seed: CourseSeed, authorId: string) {
  const course = await prisma.course.create({
    data: { authorId, title: seed.title, description: seed.description },
  });

  const chapters = [];
  for (const [index, chapterSeed] of seed.chapters.entries()) {
    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        order: index + 1,
        title: chapterSeed.title,
        content: chapterSeed.content,
        ...(chapterSeed.videoUrl ? { videoUrl: chapterSeed.videoUrl } : {}),
        ...(chapterSeed.videoKey ? { videoKey: chapterSeed.videoKey } : {}),
        ...(chapterSeed.quiz
          ? {
              quiz: {
                create: {
                  questions: {
                    create: chapterSeed.quiz.map((q) => ({
                      text: q.text,
                      options: { create: q.options },
                    })),
                  },
                },
              },
            }
          : {}),
      },
    });
    chapters.push(chapter);
  }

  return { course, chapters };
}

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
  const sarah = await prisma.user.create({
    data: { email: 'sarah.leroy@example.com', passwordHash, role: Role.FORMATEUR },
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

  const usersByEmail = new Map(
    [formateur, marie, sarah, apprenant, lucas, sofia, thomas].map((u) => [u.email, u]),
  );

  const coursesByTitle = new Map<string, Awaited<ReturnType<typeof createCourseFromSeed>>>();
  for (const seed of allCourseSeeds) {
    const author = usersByEmail.get(seed.authorEmail);
    if (!author) throw new Error(`Auteur introuvable pour le cours "${seed.title}": ${seed.authorEmail}`);
    coursesByTitle.set(seed.title, await createCourseFromSeed(seed, author.id));
  }

  const vue3 = coursesByTitle.get('Vue 3 : les fondamentaux')!;
  const nodeExpress = coursesByTitle.get('Node.js & Express : construire une API REST')!;
  const postgres = coursesByTitle.get('PostgreSQL & Prisma pour les développeurs JS')!;
  const typescript = coursesByTitle.get('TypeScript pour les développeurs JavaScript')!;
  const git = coursesByTitle.get('Git & collaboration en équipe')!;
  const testing = coursesByTitle.get('Introduction aux tests (Jest/Vitest)')!;

  // --- Inscriptions & progression (cours existants : logique inchangée) ---

  const enrDemoC1 = await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: vue3.course.id } });
  await prisma.progress.create({ data: { enrollmentId: enrDemoC1.id, chapterId: vue3.chapters[0]!.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrDemoC1.id, chapterId: vue3.chapters[1]!.id, completed: true, quizScore: 100 },
  });

  const enrDemoC2 = await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: nodeExpress.course.id } });
  await prisma.progress.create({ data: { enrollmentId: enrDemoC2.id, chapterId: nodeExpress.chapters[0]!.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrDemoC2.id, chapterId: nodeExpress.chapters[1]!.id, completed: true, quizScore: 50 },
  });

  await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: postgres.course.id } });

  const enrLucasC1 = await prisma.enrollment.create({ data: { userId: lucas.id, courseId: vue3.course.id } });
  for (const [i, chapter] of vue3.chapters.entries()) {
    await prisma.progress.create({
      data: {
        enrollmentId: enrLucasC1.id,
        chapterId: chapter.id,
        completed: true,
        ...(i > 0 ? { quizScore: 100 } : {}),
      },
    });
  }

  const enrSofiaC1 = await prisma.enrollment.create({ data: { userId: sofia.id, courseId: vue3.course.id } });
  await prisma.progress.create({ data: { enrollmentId: enrSofiaC1.id, chapterId: vue3.chapters[0]!.id, completed: true } });

  const enrSofiaC2 = await prisma.enrollment.create({ data: { userId: sofia.id, courseId: nodeExpress.course.id } });
  await prisma.progress.create({ data: { enrollmentId: enrSofiaC2.id, chapterId: nodeExpress.chapters[0]!.id, completed: true } });
  await prisma.progress.create({
    data: { enrollmentId: enrSofiaC2.id, chapterId: nodeExpress.chapters[1]!.id, completed: true, quizScore: 50 },
  });

  const enrThomasC2 = await prisma.enrollment.create({ data: { userId: thomas.id, courseId: nodeExpress.course.id } });
  for (const [i, chapter] of nodeExpress.chapters.entries()) {
    await prisma.progress.create({
      data: {
        enrollmentId: enrThomasC2.id,
        chapterId: chapter.id,
        completed: true,
        ...(i > 0 ? { quizScore: 100 } : {}),
      },
    });
  }

  // --- Un peu d'engagement sur les nouveaux cours, pour que le catalogue élargi reste vivant ---

  const enrDemoTs = await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: typescript.course.id } });
  await prisma.progress.create({ data: { enrollmentId: enrDemoTs.id, chapterId: typescript.chapters[0]!.id, completed: true } });

  const enrDemoGit = await prisma.enrollment.create({ data: { userId: apprenant.id, courseId: git.course.id } });
  await prisma.progress.create({ data: { enrollmentId: enrDemoGit.id, chapterId: git.chapters[0]!.id, completed: true } });

  const enrLucasTesting = await prisma.enrollment.create({ data: { userId: lucas.id, courseId: testing.course.id } });
  for (const [i, chapter] of testing.chapters.entries()) {
    await prisma.progress.create({
      data: {
        enrollmentId: enrLucasTesting.id,
        chapterId: chapter.id,
        completed: true,
        ...(i === 1 ? { quizScore: 100 } : {}),
      },
    });
  }

  const totalChapters = [...coursesByTitle.values()].reduce((sum, c) => sum + c.chapters.length, 0);
  const totalQuestions = allCourseSeeds
    .flatMap((c) => c.chapters)
    .reduce((sum, ch) => sum + (ch.quiz?.length ?? 0), 0);

  console.log('Seed terminé :');
  console.log(`  Formateurs : ${FORMATEUR_EMAILS.join(', ')}`);
  console.log(`  Apprenants : ${APPRENANT_EMAILS.join(', ')}`);
  console.log(`  Mot de passe (tous les comptes) : ${DEMO_PASSWORD}`);
  console.log(
    `  ${allCourseSeeds.length} cours, ${totalChapters} chapitres, ${totalQuestions} questions de quiz, 10 inscriptions`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
