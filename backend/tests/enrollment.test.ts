import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, authHeader, registerUser, uniqueEmail } from './helpers.js';

async function setupCourseWithQuiz() {
  const { token: formateurToken } = await registerUser(uniqueEmail('formateur'), 'FORMATEUR');
  const course = await request(app)
    .post('/api/courses')
    .set(...authHeader(formateurToken))
    .send({ title: 'Cours' });
  const chapter = await request(app)
    .post(`/api/courses/${course.body.id}/chapters`)
    .set(...authHeader(formateurToken))
    .send({ title: 'Ch' });
  const question = await request(app)
    .post(`/api/chapters/${chapter.body.id}/questions`)
    .set(...authHeader(formateurToken))
    .send({
      text: '2+2',
      options: [
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
      ],
    });

  const options = question.body.options as { id: string; isCorrect: boolean }[];
  const correctOptionId = options.find((o) => o.isCorrect)!.id;
  const wrongOptionId = options.find((o) => !o.isCorrect)!.id;

  return {
    formateurToken,
    courseId: course.body.id as string,
    chapterId: chapter.body.id as string,
    questionId: question.body.id as string,
    correctOptionId,
    wrongOptionId,
  };
}

describe('Enrollment & progress', () => {
  it('forbids a formateur from enrolling', async () => {
    const { formateurToken, courseId } = await setupCourseWithQuiz();
    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(formateurToken));
    expect(res.status).toBe(403);
  });

  it('lets an apprenant enroll once and rejects duplicates', async () => {
    const { courseId } = await setupCourseWithQuiz();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');

    const first = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(token));
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(token));
    expect(second.status).toBe(409);
  });

  it('blocks progress updates for a non-enrolled apprenant', async () => {
    const { chapterId } = await setupCourseWithQuiz();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');
    const res = await request(app)
      .put(`/api/chapters/${chapterId}/progress`)
      .set(...authHeader(token))
      .send({ completed: true });
    expect(res.status).toBe(403);
  });

  it('marks a chapter as completed once enrolled and lists it under /enrollments/me', async () => {
    const { courseId, chapterId } = await setupCourseWithQuiz();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');
    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(token));

    const res = await request(app)
      .put(`/api/chapters/${chapterId}/progress`)
      .set(...authHeader(token))
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);

    const mine = await request(app).get('/api/enrollments/me').set(...authHeader(token));
    expect(mine.status).toBe(200);
    expect(mine.body[0].chaptersCompleted).toBe(1);
  });

  it('scores a correct quiz submission at 100 and a wrong one at 0', async () => {
    const { courseId, chapterId, questionId, correctOptionId, wrongOptionId } =
      await setupCourseWithQuiz();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');
    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(token));

    const correct = await request(app)
      .post(`/api/chapters/${chapterId}/quiz/submit`)
      .set(...authHeader(token))
      .send({ answers: [{ questionId, optionId: correctOptionId }] });
    expect(correct.status).toBe(200);
    expect(correct.body.score).toBe(100);

    const wrong = await request(app)
      .post(`/api/chapters/${chapterId}/quiz/submit`)
      .set(...authHeader(token))
      .send({ answers: [{ questionId, optionId: wrongOptionId }] });
    expect(wrong.body.score).toBe(0);
  });

  it('rejects a quiz submission missing an answer for a question', async () => {
    const { courseId, chapterId } = await setupCourseWithQuiz();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');
    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(token));

    const res = await request(app)
      .post(`/api/chapters/${chapterId}/quiz/submit`)
      .set(...authHeader(token))
      .send({ answers: [] });
    expect(res.status).toBe(400);
  });

  it('aggregates average quiz score and completion rate on the formateur dashboard', async () => {
    const { formateurToken, courseId, chapterId, questionId, correctOptionId, wrongOptionId } =
      await setupCourseWithQuiz();

    const { token: s1 } = await registerUser(uniqueEmail('s1'), 'APPRENANT');
    const { token: s2 } = await registerUser(uniqueEmail('s2'), 'APPRENANT');
    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(s1));
    await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set(...authHeader(s2));

    await request(app)
      .post(`/api/chapters/${chapterId}/quiz/submit`)
      .set(...authHeader(s1))
      .send({ answers: [{ questionId, optionId: correctOptionId }] });
    await request(app)
      .post(`/api/chapters/${chapterId}/quiz/submit`)
      .set(...authHeader(s2))
      .send({ answers: [{ questionId, optionId: wrongOptionId }] });
    await request(app)
      .put(`/api/chapters/${chapterId}/progress`)
      .set(...authHeader(s1))
      .send({ completed: true });

    const dashboard = await request(app)
      .get(`/api/courses/${courseId}/dashboard`)
      .set(...authHeader(formateurToken));

    expect(dashboard.status).toBe(200);
    expect(dashboard.body.totalStudents).toBe(2);
    expect(dashboard.body.totalChapters).toBe(1);
    expect(dashboard.body.quizStats[0].averageScore).toBe(50);
    expect(dashboard.body.quizStats[0].submissionCount).toBe(2);

    const s1Row = dashboard.body.students.find((s: { completionRate: number }) => s.completionRate === 100);
    expect(s1Row).toBeDefined();
  });

  it('forbids a non-owner formateur from viewing the dashboard', async () => {
    const { courseId } = await setupCourseWithQuiz();
    const { token: otherFormateur } = await registerUser(uniqueEmail('other-formateur'), 'FORMATEUR');
    const res = await request(app)
      .get(`/api/courses/${courseId}/dashboard`)
      .set(...authHeader(otherFormateur));
    expect(res.status).toBe(403);
  });

  it('forbids an apprenant from viewing the dashboard', async () => {
    const { courseId } = await setupCourseWithQuiz();
    const { token } = await registerUser(uniqueEmail('apprenant'), 'APPRENANT');
    const res = await request(app)
      .get(`/api/courses/${courseId}/dashboard`)
      .set(...authHeader(token));
    expect(res.status).toBe(403);
  });
});
