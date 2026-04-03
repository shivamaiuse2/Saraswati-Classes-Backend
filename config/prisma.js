require('dotenv').config({ override: true });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis;

const createPrismaClient = () => {
  // In serverless environments (Vercel), we want a very small connection pool per function instance
  // because multiple function instances can quickly exhaust the database connections (MaxClient Reach).
  const pool = new Pool({
    connectionString,
    ssl:
      connectionString && !connectionString.includes("localhost") &&
      !connectionString.includes("127.0.0.1")
        ? { rejectUnauthorized: false }
        : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    // Use 1 connection per lambda in production to avoid exceeding Supabase's max connections
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ["error", "warn"], // unified logging level
  });
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
