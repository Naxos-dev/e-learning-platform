import { existingCourses } from './courses-existing.js';
import { typescriptCourse } from './course-typescript.js';
import { authSecurityCourse } from './course-auth-security.js';
import { testingCourse } from './course-testing.js';
import { architectureCourse } from './course-architecture.js';
import { cicdCourse } from './course-cicd.js';
import { s3Course } from './course-s3.js';
import { gitCourse } from './course-git.js';
import { tailwindCourse } from './course-tailwind.js';
import { nuxtCourse } from './course-nuxt.js';
import type { CourseSeed } from './types.js';

export type { ChapterSeed, CourseSeed, OptionSeed, QuestionSeed } from './types.js';

// formateur.demo : 2 cours existants (Vue 3, Node/Express) + 3 nouveaux
// marie.dev      : 1 cours existant (PostgreSQL/Prisma) + 3 nouveaux
// sarah.leroy    : 3 nouveaux (frontend/outillage)
export const allCourseSeeds: CourseSeed[] = [
  ...existingCourses,
  typescriptCourse,
  authSecurityCourse,
  testingCourse,
  architectureCourse,
  cicdCourse,
  s3Course,
  gitCourse,
  tailwindCourse,
  nuxtCourse,
];
