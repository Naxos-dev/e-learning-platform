export type Role = 'FORMATEUR' | 'APPRENANT'

export interface User {
  id: string
  email: string
  role: Role
  createdAt: string
}

export interface AuthResult {
  user: User
  token: string
}

export interface CourseAuthor {
  id: string
  email: string
}

export interface CourseSummary {
  id: string
  title: string
  description: string | null
  authorId: string
  createdAt: string
  updatedAt: string
  author: CourseAuthor
  _count: { chapters: number; enrollments: number }
}

// Syllabus public : jamais de contenu/vidéo (l'API ne les renvoie pas pour ces endpoints).
export interface ChapterSummary {
  id: string
  courseId: string
  title: string
  order: number
  createdAt: string
  updatedAt: string
}

// Chapitre complet : uniquement renvoyé par GET /chapters/:id, qui exige d'être connecté.
export interface Chapter {
  id: string
  courseId: string
  title: string
  content: string | null
  order: number
  videoUrl: string | null
  videoKey: string | null
  createdAt: string
  updatedAt: string
}

export interface ChapterDetail extends Chapter {
  quiz: { id: string } | null
}

export interface CourseDetail {
  id: string
  title: string
  description: string | null
  authorId: string
  createdAt: string
  updatedAt: string
  author: CourseAuthor
  chapters: ChapterSummary[]
}

export interface Option {
  id: string
  questionId: string
  text: string
  isCorrect?: boolean
}

export interface Question {
  id: string
  quizId: string
  text: string
  options: Option[]
}

export interface Quiz {
  id: string
  chapterId: string
  questions: Question[]
}

export interface QuestionInput {
  text: string
  options: { text: string; isCorrect: boolean }[]
}

export interface EnrollmentSummary {
  id: string
  enrolledAt: string
  course: {
    id: string
    title: string
    description: string | null
    totalChapters: number
  }
  chaptersCompleted: number
  progress: { chapterId: string; completed: boolean; quizScore: number | null }[]
}

export interface Progress {
  id: string
  enrollmentId: string
  chapterId: string
  completed: boolean
  quizScore: number | null
  updatedAt: string
}

export interface QuizSubmitResult {
  score: number
  correctCount: number
  totalQuestions: number
}

export interface DashboardStudent {
  userId: string
  email: string
  enrolledAt: string
  chaptersCompleted: number
  completionRate: number
}

export interface DashboardQuizStat {
  chapterId: string
  chapterTitle: string
  questionCount: number
  submissionCount: number
  averageScore: number | null
}

export interface Dashboard {
  totalChapters: number
  totalStudents: number
  students: DashboardStudent[]
  quizStats: DashboardQuizStat[]
}

export interface PresignedUpload {
  uploadUrl: string
  videoKey: string
}
