import type { Request, Response } from 'express';
import { createCourseSchema, updateCourseSchema } from '../schemas/course.schema.js';
import * as courseService from '../services/course.service.js';
import * as dashboardService from '../services/dashboard.service.js';
import { AppError } from '../utils/AppError.js';
import { requireParam } from '../utils/params.js';

export async function createCourse(req: Request, res: Response): Promise<void> {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const course = await courseService.createCourse(req.user!.id, parsed.data);
  res.status(201).json(course);
}

export async function listCourses(_req: Request, res: Response): Promise<void> {
  const courses = await courseService.listCourses();
  res.json(courses);
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const course = await courseService.getCourseDetail(requireParam(req, 'courseId'));
  res.json(course);
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Requête invalide');
  }
  const course = await courseService.updateCourse(requireParam(req, 'courseId'), req.user!.id, parsed.data);
  res.json(course);
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
  await courseService.deleteCourse(requireParam(req, 'courseId'), req.user!.id);
  res.status(204).send();
}

export async function getCourseDashboard(req: Request, res: Response): Promise<void> {
  const dashboard = await dashboardService.getCourseDashboard(
    requireParam(req, 'courseId'),
    req.user!.id,
  );
  res.json(dashboard);
}
