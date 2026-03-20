const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

let prisma;

if (process.env.VERCEL) {
  // Vercel serverless environment - use direct connection
  const connectionString = process.env.DATABASE_URL;
  
  prisma = new PrismaClient({
    datasourceUrl: connectionString,
    log: ['error', 'warn'],
  });
} else {
  // Local development - use connection pool
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({ 
    connectionString,
    ssl: (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) 
      ? { rejectUnauthorized: false } 
      : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10
  });

  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ 
    adapter,
    log: ['info', 'warn', 'error']
  });
}

module.exports = prisma;
