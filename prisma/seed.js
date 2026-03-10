/**
 * Seed entry point (spec: /prisma/seed.js).
 * Runs the actual seed logic from server so PrismaClient resolves from server/node_modules.
 */
import { runSeed } from '../server/seed.js';

runSeed()
  .then(() => {
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
