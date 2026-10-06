import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import type { CreateChapterInput, UpdateChapterInput } from '../schemas/chapter.schema.js';
import { AppError } from '../utils/AppError.js';
import { isUniqueConstraintError } from '../utils/prismaErrors.js';
import { assertCourseOwner } from './course.service.js';

// Aperçu public du syllabus : jamais de contenu/vidéo ici. Le contenu complet d'un chapitre
// n'est servi que par getChapterDetail, route protégée par authenticate.
export const chapterSummarySelect = {
  id: true,
  courseId: true,
  title: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChapterSelect;

export function listChapters(courseId: string) {
  return prisma.chapter.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    select: chapterSummarySelect,
  });
}

export async function getChapterDetail(chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { quiz: { select: { id: true } } },
  });
  if (!chapter) {
    throw new AppError(404, 'Chapitre introuvable');
  }
  return chapter;
}

export async function assertChapterOwner(chapterId: string, userId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { course: true },
  });
  if (!chapter) {
    throw new AppError(404, 'Chapitre introuvable');
  }
  if (chapter.course.authorId !== userId) {
    throw new AppError(403, "Vous n'êtes pas l'auteur de ce cours");
  }
  return chapter;
}

async function nextChapterOrder(courseId: string): Promise<number> {
  const last = await prisma.chapter.findFirst({ where: { courseId }, orderBy: { order: 'desc' } });
  return (last?.order ?? 0) + 1;
}

export async function createChapter(courseId: string, userId: string, input: CreateChapterInput) {
  await assertCourseOwner(courseId, userId);
  const order = input.order ?? (await nextChapterOrder(courseId));

  try {
    return await prisma.chapter.create({
      data: {
        courseId,
        title: input.title,
        order,
        ...(input.content !== undefined ? { content: input.content } : {}),
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, `Un chapitre avec l'ordre ${order} existe déjà pour ce cours`);
    }
    throw err;
  }
}

export async function updateChapter(chapterId: string, userId: string, input: UpdateChapterInput) {
  const chapter = await assertChapterOwner(chapterId, userId);

  try {
    return await prisma.chapter.update({
      where: { id: chapter.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, `Un chapitre avec l'ordre ${input.order} existe déjà pour ce cours`);
    }
    throw err;
  }
}

export async function deleteChapter(chapterId: string, userId: string): Promise<void> {
  const chapter = await assertChapterOwner(chapterId, userId);
  await prisma.chapter.delete({ where: { id: chapter.id } });
}
