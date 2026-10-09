import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { isUniqueConstraintError } from '../utils/prismaErrors.js';

export async function enrollInCourse(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError(404, 'Cours introuvable');
  }

  try {
    return await prisma.enrollment.create({ data: { userId, courseId } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, 'Vous êtes déjà inscrit à ce cours');
    }
    throw err;
  }
}

// Point d'entrée unique pour "cet utilisateur est-il inscrit à ce cours ?" : chapter.service.ts
// et quiz.service.ts s'appuient dessus plutôt que de refaire la même requête Prisma, pour que
// la définition de "inscrit" ne puisse pas diverger entre les différents points d'accès.
export function findEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  return Boolean(await findEnrollment(userId, courseId));
}

export async function getEnrollmentOrThrow(userId: string, courseId: string) {
  const enrollment = await findEnrollment(userId, courseId);
  if (!enrollment) {
    throw new AppError(403, "Vous n'êtes pas inscrit à ce cours");
  }
  return enrollment;
}

export async function listMyEnrollments(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: {
        include: { _count: { select: { chapters: true } } },
      },
      progress: true,
    },
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    enrolledAt: enrollment.enrolledAt,
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      totalChapters: enrollment.course._count.chapters,
    },
    chaptersCompleted: enrollment.progress.filter((p) => p.completed).length,
    progress: enrollment.progress.map((p) => ({
      chapterId: p.chapterId,
      completed: p.completed,
      quizScore: p.quizScore,
    })),
  }));
}
