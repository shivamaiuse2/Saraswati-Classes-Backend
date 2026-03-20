# Saraswati Classes Coaching - Backend API Specification

## Base URL
```
Production: https://api.saraswaticlasses.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### 1. AUTHENTICATION
```
POST   /auth/admin/login        - Admin login
POST   /auth/student/login      - Student login
POST   /auth/register           - Student registration
POST   /auth/refresh            - Refresh token
POST   /auth/logout             - Logout
GET    /auth/profile            - Get current user profile
```

### 2. PUBLIC ENDPOINTS
```
GET    /courses                 - Get all courses
GET    /courses/:id             - Get course details
GET    /test-series             - Get all test series
GET    /test-series/:id         - Get test series details
GET    /blogs                   - Get all blogs
GET    /blogs/:id               - Get blog details
GET    /results                 - Get all results
GET    /gallery                 - Get gallery items
GET    /resources               - Get resources
GET    /banners                 - Get active banners
GET    /feature-flags           - Get feature flags
GET    /popup                   - Get popup content
```

### 3. CONTACT & INQUIRIES
```
POST   /contact                 - Submit contact message
POST   /inquiries               - Submit inquiry
GET    /inquiries               - Get all inquiries (admin)
PUT    /inquiries/:id/status    - Update inquiry status (admin)
```

### 4. ADMIN - USER MANAGEMENT
```
GET    /admin/students          - Get all students
POST   /admin/students          - Create student
GET    /admin/students/:id      - Get student details
PUT    /admin/students/:id      - Update student
DELETE /admin/students/:id      - Delete student
PUT    /admin/students/:id/block - Block/unblock student
```

### 5. ADMIN - COURSE MANAGEMENT
```
GET    /admin/courses           - Get all courses
POST   /admin/courses           - Create course
GET    /admin/courses/:id       - Get course details
PUT    /admin/courses/:id       - Update course
DELETE /admin/courses/:id       - Delete course
POST   /admin/courses/:id/chapters - Add chapter
PUT    /admin/chapters/:id      - Update chapter
DELETE /admin/chapters/:id      - Delete chapter
```

### 6. ADMIN - TEST SERIES MANAGEMENT
```
GET    /admin/test-series       - Get all test series
POST   /admin/test-series       - Create test series
GET    /admin/test-series/:id   - Get test series details
PUT    /admin/test-series/:id   - Update test series
DELETE /admin/test-series/:id   - Delete test series
```

### 7. ADMIN - ENROLLMENT MANAGEMENT
```
GET    /admin/enrollments       - Get all enrollments
GET    /admin/enrollments/:id   - Get enrollment details
PUT    /admin/enrollments/:id/status - Update enrollment status
DELETE /admin/enrollments/:id   - Delete enrollment
```

### 8. ADMIN - CONTENT MANAGEMENT
```
GET    /admin/blogs             - Get all blogs
POST   /admin/blogs             - Create blog
PUT    /admin/blogs/:id         - Update blog
DELETE /admin/blogs/:id         - Delete blog

GET    /admin/resources         - Get all resources
POST   /admin/resources         - Create resource
PUT    /admin/resources/:id     - Update resource
DELETE /admin/resources/:id     - Delete resource

GET    /admin/results           - Get all results
POST   /admin/results           - Create result
PUT    /admin/results/:id       - Update result
DELETE /admin/results/:id       - Delete result

GET    /admin/gallery           - Get all gallery items
POST   /admin/gallery           - Create gallery item
PUT    /admin/gallery/:id       - Update gallery item
DELETE /admin/gallery/:id       - Delete gallery item
```

### 9. ADMIN - BANNER & FEATURE MANAGEMENT
```
GET  /admin/banners             - Get all banners
POST /admin/banners             - Create banner
PUT  /admin/banners/:id         - Update banner
DELETE /admin/banners/:id        - Delete banner

GET  /admin/feature-flags       - Get all feature flags
POST /admin/feature-flags       - Create feature flag
PUT  /admin/feature-flags/:id   - Update feature flag
DELETE /admin/feature-flags/:id  - Delete feature flag

GET  /admin/popup               - Get popup content
PUT  /admin/popup               - Update popup content

GET  /admin/contact-messages    - Get all contact messages
GET  /admin/contact-messages/:id - Get contact message details
PUT  /admin/contact-messages/:id/status - Update status
DELETE /admin/contact-messages/:id - Delete contact message

GET  /admin/inquiries           - Get all inquiries
GET  /admin/inquiries/:id       - Get inquiry details
PUT  /admin/inquiries/:id/status - Update inquiry status
DELETE /admin/inquiries/:id      - Delete inquiry
```

### 10. ADMIN - ANALYTICS
```
GET  /admin/analytics/overview    - Dashboard overview
GET  /admin/analytics/users      - User statistics
GET  /admin/analytics/courses    - Course statistics
GET  /admin/analytics/revenue    - Revenue analytics
GET  /admin/analytics/students   - Student statistics
GET  /admin/analytics/enrollments - Enrollment statistics
GET  /admin/analytics/inquiries  - Inquiry statistics
```

### 11. STUDENT DASHBOARD
```
GET    /student/dashboard       - Student dashboard overview
GET    /student/courses         - Get enrolled courses
GET    /student/test-series     - Get enrolled test series
GET    /student/results         - Get student results
GET    /student/profile         - Get student profile
PUT    /student/profile         - Update student profile
```

### 12. FILE UPLOAD
```
POST   /upload/image            - Upload image to Cloudinary
POST   /upload/document         - Upload document
DELETE /upload/:publicId        - Delete file from Cloudinary
```

### 13. NOTIFICATIONS
```
GET    /notifications           - Get user notifications
PUT    /notifications/:id/read  - Mark notification as read
DELETE /notifications/:id       - Delete notification
```

### 14. BACKUP (ADMIN ONLY)
```
POST  /backup/database         - Trigger database backup
POST  /backup/files           - Trigger file backup
GET   /backup/logs            - Get backup logs
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details",
  "statusCode": 400
}
```

## Pagination
```
GET /api/v1/courses?page=1&limit=10&category=FOUNDATION
```

Response includes:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering & Search
- `category` - Filter by course category
- `search` - Search by title/description
- `status` - Filter by status
- `dateFrom/dateTo` - Date range filtering

## Rate Limiting
- 100 requests per 15 minutes for anonymous users
- 500 requests per 15 minutes for authenticated users
- 1000 requests per 15 minutes for admin users

## Error Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 429: Too Many Requests
- 500: Internal Server Error