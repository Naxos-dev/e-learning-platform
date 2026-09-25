import { afterAll, afterEach } from 'vitest';
import { prisma } from '../src/config/prisma.js';

afterEach(async () => {
  // Toutes les tables tracent vers users par cascade (author, enrollments, progress...) :
  // une seule deleteMany suffit, et un DELETE row-level évite les deadlocks que provoquait
  // TRUNCATE (verrou ACCESS EXCLUSIVE) sous charge concurrente.
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
