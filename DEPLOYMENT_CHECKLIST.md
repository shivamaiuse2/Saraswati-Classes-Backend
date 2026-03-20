# ✅ Vercel Backend Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables (MUST configure on Vercel)

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

#### Critical Variables:
- [ ] `DATABASE_URL` - Your Supabase connection string
  ```
  postgresql://postgres.gjoogzaylyirxodenewk:%40SaraswatiClasses123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
  ```
- [ ] `JWT_SECRET` - Production secret (e.g., `Saraswati@2026@Production!SecureKey`)
- [ ] `REFRESH_TOKEN_SECRET` - Another strong secret
- [ ] `NODE_ENV` = `production`
- [ ] `ALLOWED_ORIGINS` - Your frontend URLs
  ```
  https://your-frontend.vercel.app,http://localhost:5173
  ```

#### Optional Variables (for full functionality):
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `EMAIL_HOST` (e.g., `smtp.gmail.com`)
- [ ] `EMAIL_PORT` (e.g., `587`)
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS` (app password)
- [ ] `CONTACT_NOTIFICATION_EMAIL` = `shivamaiuse1@gmail.com`
- [ ] `RATE_LIMIT_WINDOW_MS` = `900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS` = `5000`
- [ ] `LOG_LEVEL` = `info`

### 2. Verify Files

Make sure these files exist in the backend directory:
- [ ] `vercel.json` (configured for api.js)
- [ ] `api.js` (main API entry point)
- [ ] `config/prisma.js` (Vercel-aware database config)
- [ ] `utils/logger.js` (serverless-compatible logging)
- [ ] `.env.example` (reference for env variables)

## Deployment Steps

### Option A: Using PowerShell Script (Recommended)
```powershell
# From project root
.\deploy-backend.ps1
```

### Option B: Manual Deployment
```bash
cd backend
vercel --prod
```

## Post-Deployment Testing

### Test Endpoints in Order:

1. **Basic Health Check** (No database)
   ```
   GET https://your-backend.vercel.app/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "...",
     "uptime": 0.123
   }
   ```

2. **Database Connection Test**
   ```
   GET https://your-backend.vercel.app/health/db
   ```
   Expected response:
   ```json
   {
     "success": true,
     "message": "Database connection successful",
     "timestamp": "..."
   }
   ```

3. **Admin Login Test**
   ```
   POST https://your-backend.vercel.app/api/v1/auth/admin/login
   Content-Type: application/json
   
   {
     "email": "admin@saraswaticlasses.com",
     "password": "admin123"
   }
   ```

4. **Get Courses List**
   ```
   GET https://your-backend.vercel.app/api/v1/courses
   ```

5. **Contact Form Test**
   ```
   POST https://your-backend.vercel.app/api/v1/contact
   Content-Type: application/json
   
   {
     "name": "Test User",
     "email": "test@example.com",
     "message": "Testing contact form"
   }
   ```

## Troubleshooting

### If deployment fails:

1. **Check vercel.json syntax**
   ```bash
   cd backend
   node -e "console.log(JSON.parse(require('fs').readFileSync('vercel.json')))"
   ```

2. **Verify all dependencies are installed**
   ```bash
   npm install
   ```

3. **Check for missing environment variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure all required variables are set

### If health check works but database fails:

1. **Verify DATABASE_URL format**
   - Should include username, password, host, port, and database name
   - For Supabase pooler, use port 6543
   - Include SSL parameters if needed

2. **Check Supabase access**
   - Ensure your IP is not blocked in Supabase dashboard
   - Verify credentials are correct (URL-encoded special characters)

3. **Test connection string locally**
   ```bash
   # Use a tool like pgAdmin or DBeaver to test the connection
   ```

### If routes return 404:

1. **Verify route paths**
   - All routes should be under `/api/v1/*`
   - Check that route files exist in `routes/` directory

2. **Check middleware order in api.js**
   - Routes should be added before error handlers

### If getting CORS errors:

1. **Update ALLOWED_ORIGINS**
   ```
   https://your-frontend.vercel.app,http://localhost:5173,*
   ```

2. **Clear browser cache and try again**

## Monitoring

### View Function Logs:

**Via Dashboard:**
1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. Click on any function to see logs

**Via CLI:**
```bash
vercel logs your-deployment-url
```

### Check Function Performance:

1. Cold start time (first request after deployment)
2. Average response time
3. Error rate
4. Timeout occurrences

## Success Criteria

✅ Health endpoint returns 200
✅ Database connection successful
✅ Admin login works
✅ Course CRUD operations work
✅ Contact form sends emails
✅ File uploads work (if using Cloudinary)
✅ No errors in Vercel function logs
✅ CORS allows frontend domain

## Important Notes

1. **Serverless Limitations:**
   - Maximum execution time: 10s (Hobby), 60s (Pro)
   - Stateless functions (no in-memory caching between requests)
   - Cold starts on first request

2. **Database Connections:**
   - Connections are lazy-loaded per request
   - Use Supabase connection pooling (port 6543)
   - SSL is required for remote connections

3. **File Uploads:**
   - Use Cloudinary (already configured)
   - Don't store files locally

4. **Logging:**
   - Logs go to Vercel's logging system
   - Use console.error() for errors
   - Winston configured for serverless

## Rollback Plan

If something goes wrong:

1. **Revert to simple API:**
   ```bash
   cd backend
   # Edit vercel.json to use vercel-api.js instead
   vercel --prod
   ```

2. **Check previous deployments:**
   ```bash
   vercel ls
   vercel rollback [deployment-name]
   ```

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Functions: https://vercel.com/docs/functions
- Prisma on Serverless: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
- Supabase Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#direct-connection

---

**After successful deployment:** Update your frontend `.env` file with the new backend URL!

```
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```
