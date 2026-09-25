import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

export default function setup(): void {
  const parsed = dotenv.config({ path: '.env.test' }).parsed ?? {};

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, ...parsed },
  });
}
