const prisma = require('./config/prisma');
console.log('Is chapter in prisma?', 'chapter' in prisma);
console.log('Is course in prisma?', 'course' in prisma);
process.exit(0);
