import { PrismaClient } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const prisma = () => {
  return new PrismaClient();
};