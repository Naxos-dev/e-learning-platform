import { Role } from '@prisma/client';
import { Router } from 'express';
import { createChapter, listChapters } from '../controllers/chapter.controller.js';
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourseDashboard,
  listCourses,
  updateCourse,
} from '../controllers/course.controller.js';
import { enroll } from '../controllers/enrollment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

export const courseRouter = Router();

courseRouter.get('/', listCourses);
courseRouter.post('/', authenticate, authorize(Role.FORMATEUR), createCourse);
courseRouter.get('/:courseId', getCourse);
courseRouter.patch('/:courseId', authenticate, authorize(Role.FORMATEUR), updateCourse);
courseRouter.delete('/:courseId', authenticate, authorize(Role.FORMATEUR), deleteCourse);

courseRouter.get('/:courseId/chapters', listChapters);
courseRouter.post('/:courseId/chapters', authenticate, authorize(Role.FORMATEUR), createChapter);

courseRouter.post('/:courseId/enroll', authenticate, authorize(Role.APPRENANT), enroll);
courseRouter.get('/:courseId/dashboard', authenticate, authorize(Role.FORMATEUR), getCourseDashboard);
