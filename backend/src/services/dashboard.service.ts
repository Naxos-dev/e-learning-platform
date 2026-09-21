import { prisma } from '../config/prisma.js';
import { assertCourseOwner } from './course.service.js';

export async function getCourseDashboard(courseId: string, userId: string) {
  await assertCourseOwner(courseId, userId);

  const [chapters, enrollments, quizAverages] = await Promise.all([
    prisma.chapter.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        quiz: { select: { _count: { select: { questions: true } } } },
      },
    }),
    prisma.enrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: 'asc' },
      include: { user: { select: { id: true, email: true } }, progress: true },
    }),
    prisma.progress.groupBy({
      by: ['chapterId'],
      where: { chapter: { courseId }, quizScore: { not: null } },
      _avg: { quizScore: true },
      _count: { _all: true },
    }),
  ]);

  const totalChapters = chapters.length;
  const quizAverageByChapter = new Map(quizAverages.map((q) => [q.chapterId, q]));

  const students = enrollments.map((enrollment) => {
    const chaptersCompleted = enrollment.progress.filter((p) => p.completed).length;
    return {
      userId: enrollment.user.id,
      email: enrollment.user.email,
      enrolledAt: enrollment.enrolledAt,
      chaptersCompleted,
      completionRate: totalChapters === 0 ? 0 : Math.round((chaptersCompleted / totalChapters) * 100),
    };
  });

  const quizStats = chapters.flatMap((chapter) => {
    const questionCount = chapter.quiz?._count.questions ?? 0;
    if (questionCount === 0) {
      return [];
    }
    const agg = quizAverageByChapter.get(chapter.id);
    return [
      {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        questionCount,
        submissionCount: agg?._count._all ?? 0,
        averageScore: agg?._avg.quizScore ?? null,
      },
    ];
  });

  return { totalChapters, totalStudents: students.length, students, quizStats };
}
