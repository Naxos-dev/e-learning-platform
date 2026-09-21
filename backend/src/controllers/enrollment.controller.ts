import type { Request, Response } from 'express';
import * as enrollmentService from '../services/enrollment.service.js';
import { requireParam } from '../utils/params.js';

export async function enroll(req: Request, res: Response): Promise<void> {
  const enrollment = await enrollmentService.enrollInCourse(req.user!.id, requireParam(req, 'courseId'));
  res.status(201).json(enrollment);
}

export async function listMyEnrollments(req: Request, res: Response): Promise<void> {
  const enrollments = await enrollmentService.listMyEnrollments(req.user!.id);
  res.json(enrollments);
}
