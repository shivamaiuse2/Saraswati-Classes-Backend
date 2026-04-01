const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/auth');

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@saraswaticlasses.com' }
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123');
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@saraswaticlasses.com',
          password: hashedPassword,
          role: 'ADMIN',
          adminProfile: {
            create: {
              name: 'Admin User',
              phone: '9421018326'
            }
          }
        }
      });
      console.log('Admin user created:', adminUser.email);
    }

    // Clear existing courses
    await prisma.course.deleteMany({});

    const admin = await prisma.user.findUnique({ where: { email: 'admin@saraswaticlasses.com' } });
    const adminId = admin.id;

    // Create new courses based on requirements
    const courses = [
      // CBSE
      {
        board: 'CBSE',
        standard: 'VIII',
        timing_start: '6:30 PM',
        timing_end: '7:30 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        subjects: ['Maths', 'Science'],
        fees: 9000,
        createdBy: adminId
      },
      {
        board: 'CBSE',
        standard: 'IX',
        timing_start: '5:15 PM',
        timing_end: '6:30 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        subjects: ['Maths', 'Science'],
        fees: 9500,
        createdBy: adminId
      },
      {
        board: 'CBSE',
        standard: 'X',
        timing_start: '4:00 PM',
        timing_end: '5:15 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        subjects: ['Maths', 'Science'],
        fees: 10500,
        createdBy: adminId
      },
      // SSC
      {
        board: 'SSC',
        standard: 'VIII',
        timing_start: '7:30 PM',
        timing_end: '8:30 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        subjects: ['Maths', 'Science'],
        fees: 8000,
        createdBy: adminId
      },
      {
        board: 'SSC',
        standard: 'IX',
        timing_start: '5:15 PM',
        timing_end: '6:30 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        subjects: ['Maths', 'Science'],
        fees: 8500,
        createdBy: adminId
      },
      {
        board: 'SSC',
        standard: 'X',
        timing_start: '4:00 PM',
        timing_end: '5:15 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        subjects: ['Maths', 'Science'],
        fees: 9000,
        createdBy: adminId
      },
      // HSC
      {
        board: 'HSC',
        standard: 'XI',
        timing_start: '6:15 PM',
        timing_end: '9:30 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        subjects: ['PCMB', 'JEE', 'MHT-CET'],
        fees: 18000,
        createdBy: adminId
      },
      {
        board: 'HSC',
        standard: 'XII',
        timing_start: '6:15 PM',
        timing_end: '9:30 PM',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        subjects: ['PCMB', 'JEE', 'MHT-CET'],
        fees: 25000,
        createdBy: adminId
      }
    ];

    for (const courseData of courses) {
      await prisma.course.create({ data: courseData });
      console.log(`Created course: ${courseData.board} Class ${courseData.standard}`);
    }

    // Create sample test series
    const testSeries = [
      {
        title: 'CET PCM Test Series',
        overview: 'Rigorous full-syllabus CET PCM test series with detailed analysis.',
        features: [
          '30+ full syllabus and part syllabus mock tests',
          'Paper discussion and doubt-solving after every test',
          'Topic-wise analysis to identify strong and weak areas'
        ],
        testPattern: '150 questions | 90 minutes | No negative marking | PCM focused pattern',
        benefits: [
          'Build exam temperament through regular mock practice',
          'Understand question trends and frequently asked topics'
        ],
        image: 'https://placehold.co/400x250/0ea5e9/ffffff?text=CET+PCM+Test+Series',
        ctaLabel: 'Enroll Now',
        demoTestLink: 'https://forms.gle/example-cet-test',
        heroPosterThumbnail: 'https://placehold.co/600x450/0ea5e9/ffffff?text=CET+PCM+Test+Series',
        showInHeroPoster: true,
        testsCount: 30,
        mode: 'OMR_BASED',
        price: '₹6,000',
        createdBy: (await prisma.user.findUnique({ where: { email: 'admin@saraswaticlasses.com' } })).id
      },
      {
        title: '10th CBSE Maths & Science Test Series',
        overview: 'Board-focused test series for 10th CBSE students targeting top scores.',
        features: [
          'Prelim-style full syllabus papers',
          'Chapter-wise and unit-wise practice tests',
          'Detailed marking scheme based evaluation'
        ],
        testPattern: 'Board-style question papers with section-wise weightage',
        benefits: [
          'Experience real board-exam like environment',
          'Refine presentation and answer writing skills'
        ],
        image: 'https://placehold.co/400x250/0ea5e9/ffffff?text=10th+CBSE+Test+Series',
        ctaLabel: 'Enroll Now',
        demoTestLink: 'https://forms.gle/example-10th-cbse-test',
        heroPosterThumbnail: 'https://placehold.co/600x450/0ea5e9/ffffff?text=10th+CBSE+Test+Series',
        showInHeroPoster: false,
        testsCount: 25,
        mode: 'BOARD_STYLE',
        price: '₹5,500',
        createdBy: (await prisma.user.findUnique({ where: { email: 'admin@saraswaticlasses.com' } })).id
      }
    ];

    for (const tsData of testSeries) {
      const existingTS = await prisma.testSeries.findFirst({
        where: { title: tsData.title }
      });

      if (!existingTS) {
        await prisma.testSeries.create({ data: tsData });
        console.log(`Created test series: ${tsData.title}`);
      }
    }

    // Create feature flags
    const featureFlags = [
      {
        name: 'BANNERS_ENABLED',
        description: 'Enable banner display on homepage',
        status: 'ENABLED',
        config: { enabled: true }
      },
      {
        name: 'TEST_SERIES_ENABLED',
        description: 'Enable test series functionality',
        status: 'ENABLED',
        config: { enabled: true }
      },
      {
        name: 'ENROLLMENTS_ENABLED',
        description: 'Enable enrollment functionality',
        status: 'ENABLED',
        config: { enabled: true }
      }
    ];

    for (const flagData of featureFlags) {
      const existingFlag = await prisma.featureFlag.findUnique({
        where: { name: flagData.name }
      });

      if (!existingFlag) {
        await prisma.featureFlag.create({ data: flagData });
        console.log(`Created feature flag: ${flagData.name}`);
      }
    }

    // Create default popup content
    const popupExists = await prisma.popupContent.findFirst();
    if (!popupExists) {
      await prisma.popupContent.create({
        data: {
          title: 'Explore Our Test Series',
          description: 'Boost your exam preparation with structured practice.',
          ctaText: 'View Test Series',
          ctaLink: '/test-series',
          enabled: true
        }
      });
      console.log('Created default popup content');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;