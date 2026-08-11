import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if cached instance exists AND contains newly generated models
const existingPrisma = globalForPrisma.prisma;
const isValidInstance = existingPrisma && "newsletterSubscriber" in existingPrisma;

export const prisma = isValidInstance ? existingPrisma : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
