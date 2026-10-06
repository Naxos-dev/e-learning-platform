import { Role } from '@prisma/client';
import { Router } from 'express';
import { deleteChapter, getChapter, updateChapter } from '../controllers/chapter.controller.js';
import { submitQuiz, updateProgress } from '../controllers/progress.controller.js';
import { createQuestion, getChapterQuiz } from '../controllers/quiz.controller.js';
import { confirmVideoUpload, deleteVideo, presignVideoUpload } from '../controllers/video.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

export const chapterRouter = Router();

chapterRouter.get('/:chapterId', authenticate, getChapter);
chapterRouter.patch('/:chapterId', authenticate, authorize(Role.FORMATEUR), updateChapter);
chapterRouter.delete('/:chapterId', authenticate, authorize(Role.FORMATEUR), deleteChapter);

chapterRouter.get('/:chapterId/quiz', authenticate, getChapterQuiz);
chapterRouter.post('/:chapterId/questions', authenticate, authorize(Role.FORMATEUR), createQuestion);

chapterRouter.post(
  '/:chapterId/video/presign',
  authenticate,
  authorize(Role.FORMATEUR),
  presignVideoUpload,
);
chapterRouter.patch('/:chapterId/video', authenticate, authorize(Role.FORMATEUR), confirmVideoUpload);
chapterRouter.delete('/:chapterId/video', authenticate, authorize(Role.FORMATEUR), deleteVideo);

chapterRouter.put('/:chapterId/progress', authenticate, authorize(Role.APPRENANT), updateProgress);
chapterRouter.post('/:chapterId/quiz/submit', authenticate, authorize(Role.APPRENANT), submitQuiz);
