# Saraswati Classes Coaching - Backend API

A production-ready, scalable backend for Saraswati Classes Coaching Institute built with Node.js, Express, and PostgreSQL.

## 🎯 Features

- ✅ **Authentication & Authorization** - JWT-based with role-based access control (Admin/Student)
- ✅ **Course Management** - Complete CRUD for courses, chapters, and enrollments
- ✅ **Test Series Management** - Comprehensive test series system with OMR/Board-style support
- ✅ **Student Management** - Student profiles, progress tracking, certificates, and results
- ✅ **Content Management** - Blogs, resources, gallery, results, and banner posters
- ✅ **File Upload** - Cloudinary integration for images and documents
- ✅ **Contact & Inquiry System** - Lead management with email notifications
- ✅ **Feature Flags** - Dynamic UI configuration for festivals/special events
- ✅ **Popup Management** - Configurable popup banners
- ✅ **Analytics Dashboard** - Student, course, enrollment, and revenue analytics
- ✅ **Notifications** - In-app notification system
- ✅ **Security** - Rate limiting, CORS, XSS protection, Helmet security
- ✅ **Logging** - Winston logging with daily file rotation
- ✅ **Documentation** - Swagger/OpenAPI documentation
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **Backup System** - Automated database and file backups

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Logging**: Winston
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Jest
- **Documentation**: Swagger

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Cloudinary account
- Redis (optional, for caching)

## Quick Start

### 1. Clone and Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/saraswati_classes"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN=1d

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
CONTACT_NOTIFICATION_EMAIL="shivamaiuse1@gmail.com"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

API Documentation available at `http://localhost:3000/api-docs`

## 📁 Project Structure

```
backend/
├── config/           # Configuration files (Swagger, etc.)
│   └── swagger.js
├── controllers/      # Route controllers (Business logic)
│   ├── analytics.controller.js
│   ├── auth.controller.js
│   ├── banner.controller.js
│   ├── contact.controller.js
│   ├── content.controller.js
│   ├── course.controller.js
│   ├── enrollment.controller.js
│   ├── testSeries.controller.js
│   ├── upload.controller.js
│   └── user.controller.js
├── middleware/       # Custom middleware
│   ├── error.middleware.js
│   ├── monitoring.middleware.js
│   ├── notFound.middleware.js
│   └── security.middleware.js
├── prisma/          # Database schema and migrations
│   ├── schema.prisma
│   └── seed.js
├── routes/          # API routes
│   ├── admin.routes.js
│   ├── analytics.routes.js
│   ├── auth.routes.js
│   ├── backup.routes.js
│   ├── banner.routes.js
│   ├── contact.routes.js
│   ├── content.routes.js
│   ├── course.routes.js
│   ├── enrollment.routes.js
│   ├── notification.routes.js
│   ├── student.routes.js
│   ├── testSeries.routes.js
│   ├── upload.routes.js
│   └── user.routes.js
├── utils/           # Utility functions
│   ├── auth.js
│   ├── backup.manager.js
│   ├── cache.js
│   ├── cloudinary.js
│   └── logger.js
├── tests/           # Test files
│   ├── integration/
│   └── unit/
├── .env.example  # Environment variables template
├── .gitignore
├── API_SPECIFICATION.md
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js        # Main application entry
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/admin/login` - Admin login
- `POST /api/v1/auth/student/login` - Student login
- `POST /api/v1/auth/register` - Student registration
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get current user profile

### Public Content
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course details
- `GET /api/v1/test-series` - Get all test series
- `GET /api/v1/test-series/:id` - Get test series details
- `GET /api/v1/blogs` - Get all blogs
- `GET /api/v1/blogs/:id` - Get blog details
- `GET /api/v1/resources` - Get all resources
- `GET /api/v1/gallery` - Get gallery items
- `GET /api/v1/results` - Get all results
- `GET /api/v1/banners` - Get active banners
- `GET /api/v1/feature-flags` - Get feature flags
- `GET /api/v1/popup` - Get popup content

### Contact & Inquiries
- `POST /api/v1/contact` - Submit contact message
- `POST /api/v1/inquiries` - Submit inquiry
- `GET /api/v1/inquiries` - Get all inquiries (Admin)
- `PUT /api/v1/inquiries/:id/status` - Update inquiry status (Admin)

### Admin Routes (Protected)
- `GET /api/v1/admin/students` - Manage students
- `POST /api/v1/admin/students` - Create student
- `GET /api/v1/admin/students/:id` - Get student details
- `PUT /api/v1/admin/students/:id` - Update student
- `DELETE /api/v1/admin/students/:id` - Delete student
- `PUT /api/v1/admin/students/:id/block` - Block/unblock student

- `GET /api/v1/admin/courses` - Manage courses
- `POST /api/v1/admin/courses` - Create course
- `GET /api/v1/admin/courses/:id` - Get course details
- `PUT /api/v1/admin/courses/:id` - Update course
- `DELETE /api/v1/admin/courses/:id` - Delete course
- `POST /api/v1/admin/courses/:id/chapters` - Add chapter
- `PUT /api/v1/admin/courses/chapters/:id` - Update chapter
- `DELETE /api/v1/admin/courses/chapters/:id` - Delete chapter

- `GET /api/v1/admin/test-series` - Manage test series
- `POST /api/v1/admin/test-series` - Create test series
- `GET /api/v1/admin/test-series/:id` - Get test series details
- `PUT /api/v1/admin/test-series/:id` - Update test series
- `DELETE /api/v1/admin/test-series/:id` - Delete test series

- `GET /api/v1/admin/enrollments` - Manage enrollments
- `GET /api/v1/admin/enrollments/:id` - Get enrollment details
- `PUT /api/v1/admin/enrollments/:id/status` - Update enrollment status
- `DELETE /api/v1/admin/enrollments/:id` - Delete enrollment

- `GET /api/v1/admin/analytics` - Dashboard analytics
- `GET /api/v1/admin/analytics/users` - User statistics
- `GET /api/v1/admin/analytics/courses` - Course statistics
- `GET /api/v1/admin/analytics/revenue` - Revenue analytics

- `GET /api/v1/admin/blogs` - Manage blogs
- `POST /api/v1/admin/blogs` - Create blog
- `PUT /api/v1/admin/blogs/:id` - Update blog
- `DELETE /api/v1/admin/blogs/:id` - Delete blog

- `GET /api/v1/admin/resources` - Manage resources
- `POST /api/v1/admin/resources` - Create resource
- `PUT /api/v1/admin/resources/:id` - Update resource
- `DELETE /api/v1/admin/resources/:id` - Delete resource

- `GET /api/v1/admin/gallery` - Manage gallery
- `POST /api/v1/admin/gallery` - Create gallery item
- `PUT /api/v1/admin/gallery/:id` - Update gallery item
- `DELETE /api/v1/admin/gallery/:id` - Delete gallery item

- `GET /api/v1/admin/results` - Manage results
- `POST /api/v1/admin/results` - Create result
- `PUT /api/v1/admin/results/:id` - Update result
- `DELETE /api/v1/admin/results/:id` - Delete result

- `GET /api/v1/admin/banners` - Manage banners
- `POST /api/v1/admin/banners` - Create banner
- `PUT /api/v1/admin/banners/:id` - Update banner
- `DELETE /api/v1/admin/banners/:id` - Delete banner

- `GET /api/v1/admin/contact-messages` - Manage contact messages
- `GET /api/v1/admin/inquiries` - Manage inquiries

### Student Routes (Protected)
- `GET /api/v1/students/dashboard` - Student dashboard overview
- `GET /api/v1/students/courses` - Get enrolled courses
- `GET /api/v1/students/test-series` - Get enrolled test series
- `GET /api/v1/students/results` - Get student results
- `GET /api/v1/students/profile` - Get student profile
- `PUT /api/v1/students/profile` - Update student profile

### File Upload (Admin Protected)
- `POST /api/v1/upload/image` - Upload images to Cloudinary
- `POST /api/v1/upload/document` - Upload documents
- `DELETE /api/v1/upload/:publicId` - Delete files

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Backup (Admin Protected)
- `POST /api/v1/backup/database` - Trigger database backup
- `POST /api/v1/backup/files` - Trigger file backup
- `GET /api/v1/backup/logs` - Get backup logs

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset
```

### Code Quality

```bash
# Run linting (if configured)
npm run lint
```

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
# ... other production variables
```

### Build and Deploy

```bash
# Install production dependencies only
npm ci --production

# Start server
npm start
```

## Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Role-based authorization (Admin/Student)
- ✅ Rate limiting (100 requests/15min)
- ✅ CORS protection
- ✅ XSS protection
- ✅ Helmet security headers
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization

## Monitoring

- ✅ Winston logging with file rotation
- ✅ Morgan request logging
- ✅ Error tracking and reporting
- ✅ Health check endpoint at `/health`

## 💾 Database Schema

The database includes the following models:

- **User** - Core user entity with roles (Admin/Student)
- **AdminProfile** - Admin-specific profile information
- **StudentProfile** - Student profiles with academic details
- **Course** - Course information and metadata
- **CourseChapter** - Individual course chapters with videos
- **CourseEnrollment** - Student course enrollments
- **TestSeries** - Test series information (Online/Offline/OMR/Board)
- **TestSeriesEnrollment** - Student test series enrollments
- **TestResult** - Student test results and grades
- **Enrollment** - Enrollment requests and status tracking
- **Inquiry** - Contact inquiries and status
- **Blog** - Blog posts with images
- **Resource** - Educational resources
- **GalleryItem** - Gallery photos by category
- **Result** - Exam results with images
- **BannerPoster** - Banner images for courses/test series
- **FeatureFlag** - Dynamic feature toggles
- **PopupContent** - Popup banner content
- **Notification** - User notifications
- **ContactMessage** - Contact form messages
- **Certificate** - Student certificates

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email contact@saraswaticlasses.com or create an issue in the repository.