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

    // Create sample courses
    const courses = [
      {
        title: '8th CBSE',
        category: 'FOUNDATION',
        description: 'Build strong fundamentals in Maths and Science aligned with CBSE syllabus.',
        fullDescription: 'Our 8th CBSE foundation batch focuses on conceptual clarity and regular practice in Maths and Science.',
        mode: 'Offline',
        image: 'https://placehold.co/400x250/0ea5e9/ffffff?text=8th+CBSE',
        timing: '6:30 – 7:30 PM',
        days: 'Monday – Friday',
        pricePerSubject: 9000,
        subjects: ['Maths', 'Science'],
        duration: 'Full Academic Year',
        demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        createdBy: (await prisma.user.findUnique({ where: { email: 'admin@saraswaticlasses.com' } })).id
      },
      {
        title: '10th CBSE',
        category: 'FOUNDATION',
        description: 'Board-focused 10th CBSE preparation with regular prelim-style tests.',
        fullDescription: 'Comprehensive coverage of the 10th CBSE Maths and Science syllabus.',
        mode: 'Offline',
        image: 'https://placehold.co/400x250/0ea5e9/ffffff?text=10th+CBSE',
        timing: '4:15 – 5:30 PM',
        days: 'Monday – Saturday',
        pricePerSubject: 10500,
        subjects: ['Maths', 'Science'],
        duration: 'Full Academic Year',
        demoVideoUrl: 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
        createdBy: (await prisma.user.findUnique({ where: { email: 'admin@saraswaticlasses.com' } })).id
      },
      {
        title: '12th Science State Board PCMB + JEE + NEET + CET',
        category: 'SCIENCE',
        description: 'Integrated 12th Science coaching for Board + JEE + NEET + CET.',
        fullDescription: 'This integrated 12th Science program covers complete State Board PCMB syllabus.',
        mode: 'Offline',
        image: 'https://placehold.co/400x250/0ea5e9/ffffff?text=12th+Science+PCMB',
        timing: '6:00 – 9:00 PM',
        days: 'As per batch schedule',
        pricePerSubject: 25000,
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
        duration: 'One Academic Year',
        demoVideoUrl: 'https://www.youtube.com/embed/09R8_2nJtjg',
        createdBy: (await prisma.user.findUnique({ where: { email: 'admin@saraswaticlasses.com' } })).id
      }
    ];

    for (const courseData of courses) {
      const existingCourse = await prisma.course.findFirst({
        where: { title: courseData.title }
      });

      if (!existingCourse) {
        await prisma.course.create({ data: courseData });
        console.log(`Created course: ${courseData.title}`);
      }
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