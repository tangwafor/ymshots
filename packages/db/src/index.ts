export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';

let prisma: InstanceType<typeof import('@prisma/client').PrismaClient>;

export function getDb() {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}
