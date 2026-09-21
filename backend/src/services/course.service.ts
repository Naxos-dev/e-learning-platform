import { prisma } from '../config/prisma.js';
import type { CreateCourseInput, UpdateCourseInput } from '../schemas/course.schema.js';
import { AppError } from '../utils/AppError.js';

export function createCourse(authorId: string, input: CreateCourseInput) {
  return prisma.course.create({
    data: {
      authorId,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });
}

export function listCourses() {
  return prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, email: true } },
      _count: { select: { chapters: true, enrollments: true } },
    },
  });
}

export async function getCourseDetail(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      author: { select: { id: true, email: true } },
      chapters: { orderBy: { order: 'asc' } },
    },
  });
  if (!course) {
    throw new AppError(404, 'Cours introuvable');
  }
  return course;
}

export async function assertCourseOwner(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError(404, 'Cours introuvable');
  }
  if (course.authorId !== userId) {
    throw new AppError(403, "Vous n'êtes pas l'auteur de ce cours");
  }
  return course;
}

export async function updateCourse(courseId: string, userId: string, input: UpdateCourseInput) {
  await assertCourseOwner(courseId, userId);
  return prisma.course.update({
    where: { id: courseId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });
}

export async function deleteCourse(courseId: string, userId: string): Promise<void> {
  await assertCourseOwner(courseId, userId);
  await prisma.course.delete({ where: { id: courseId } });
}
