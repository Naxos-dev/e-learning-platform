import { prisma } from '../config/prisma.js';
import type { QuestionInput } from '../schemas/quiz.schema.js';
import { AppError } from '../utils/AppError.js';
import { assertChapterOwner } from './chapter.service.js';
import { isEnrolled } from './enrollment.service.js';

export async function getQuizForChapter(chapterId: string, requesterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { course: true },
  });
  if (!chapter) {
    throw new AppError(404, 'Chapitre introuvable');
  }

  const quiz = await prisma.quiz.findUnique({
    where: { chapterId },
    include: { questions: { orderBy: { id: 'asc' }, include: { options: true } } },
  });
  if (!quiz) {
    throw new AppError(404, "Ce chapitre n'a pas encore de quiz");
  }

  if (chapter.course.authorId === requesterId) {
    return quiz;
  }

  // Le quiz exige toujours une inscription, même sur le premier chapitre (aperçu gratuit) :
  // seul le contenu du chapitre est en libre accès, pas le quiz.
  if (!(await isEnrolled(requesterId, chapter.courseId))) {
    throw new AppError(403, 'Inscrivez-vous à ce cours pour accéder au quiz de ce chapitre');
  }

  // Les apprenants ne doivent pas voir les bonnes réponses avant d'avoir répondu.
  return {
    ...quiz,
    questions: quiz.questions.map((question) => ({
      ...question,
      options: question.options.map(({ id, text }) => ({ id, text })),
    })),
  };
}

export async function createQuestion(chapterId: string, userId: string, input: QuestionInput) {
  await assertChapterOwner(chapterId, userId);

  const quiz = await prisma.quiz.upsert({
    where: { chapterId },
    create: { chapterId },
    update: {},
  });

  return prisma.question.create({
    data: {
      quizId: quiz.id,
      text: input.text,
      options: { create: input.options },
    },
    include: { options: true },
  });
}

async function assertQuestionOwner(questionId: string, userId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { chapter: { include: { course: true } } } } },
  });
  if (!question) {
    throw new AppError(404, 'Question introuvable');
  }
  if (question.quiz.chapter.course.authorId !== userId) {
    throw new AppError(403, "Vous n'êtes pas l'auteur de ce cours");
  }
  return question;
}

export async function updateQuestion(questionId: string, userId: string, input: QuestionInput) {
  const question = await assertQuestionOwner(questionId, userId);

  return prisma.$transaction(async (tx) => {
    await tx.option.deleteMany({ where: { questionId: question.id } });
    return tx.question.update({
      where: { id: question.id },
      data: { text: input.text, options: { create: input.options } },
      include: { options: true },
    });
  });
}

export async function deleteQuestion(questionId: string, userId: string): Promise<void> {
  const question = await assertQuestionOwner(questionId, userId);
  await prisma.question.delete({ where: { id: question.id } });
}
