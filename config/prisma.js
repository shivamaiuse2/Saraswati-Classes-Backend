const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  ssl: (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) 
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 10000, // 10 seconds to connect
  idleTimeoutMillis: 30000,       // 30 seconds idle before closing
  max: 10                         // Max connections in pool
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ 
  adapter,
  log: ['info', 'warn', 'error']
});

module.exports = prisma;
