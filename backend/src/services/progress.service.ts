import { prisma } from '../config/prisma.js';
import type { SubmitQuizInput } from '../schemas/progress.schema.js';
import { AppError } from '../utils/AppError.js';
import { getEnrollmentOrThrow } from './enrollment.service.js';

async function getChapterOrThrow(chapterId: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) {
    throw new AppError(404, 'Chapitre introuvable');
  }
  return chapter;
}

export async function setChapterCompleted(chapterId: string, userId: string, completed: boolean) {
  const chapter = await getChapterOrThrow(chapterId);
  const enrollment = await getEnrollmentOrThrow(userId, chapter.courseId);

  return prisma.progress.upsert({
    where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId } },
    create: { enrollmentId: enrollment.id, chapterId, completed },
    update: { completed },
  });
}

export async function submitQuiz(chapterId: string, userId: string, input: SubmitQuizInput) {
  const chapter = await getChapterOrThrow(chapterId);
  const enrollment = await getEnrollmentOrThrow(userId, chapter.courseId);

  const quiz = await prisma.quiz.findUnique({
    where: { chapterId },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) {
    throw new AppError(404, "Ce chapitre n'a pas de quiz");
  }

  const questionIds = new Set(quiz.questions.map((q) => q.id));
  const answeredIds = new Set(input.answers.map((a) => a.questionId));
  if (questionIds.size !== answeredIds.size || ![...questionIds].every((id) => answeredIds.has(id))) {
    throw new AppError(400, 'Une réponse est requise pour chaque question du quiz, sans doublon');
  }

  let correctCount = 0;
  for (const question of quiz.questions) {
    const answer = input.answers.find((a) => a.questionId === question.id);
    const option = question.options.find((o) => o.id === answer?.optionId);
    if (!option) {
      throw new AppError(400, `optionId invalide pour la question ${question.id}`);
    }
    if (option.isCorrect) {
      correctCount += 1;
    }
  }

  const score = Math.round((correctCount / quiz.questions.length) * 10000) / 100;

  await prisma.progress.upsert({
    where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId } },
    create: { enrollmentId: enrollment.id, chapterId, quizScore: score },
    update: { quizScore: score },
  });

  return { score, correctCount, totalQuestions: quiz.questions.length };
}
