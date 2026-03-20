# ✅ FINAL Vercel Backend Deployment Checklist

## Configuration Status

### ✅ Verified Files

| File | Status | Purpose |
|------|--------|---------|
| [`vercel.json`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\vercel.json) | ✅ Correct | Main Vercel config (no duplicates) |
| [`package.json`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\package.json) | ✅ Correct | Build script generates Prisma Client |
| [`api.js`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\api.js) | ✅ Ready | Serverless-compatible API entry point |
| [`.vercelignore`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\.vercelignore) | ✅ Created | Excludes unnecessary files |
| [`config/prisma.js`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\config\prisma.js) | ✅ Updated | Vercel-aware database config |
| [`utils/logger.js`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\utils\logger.js) | ✅ Updated | Serverless-compatible logging |

### ✅ Removed Duplicates

- ❌ Deleted `now.json` (duplicate of vercel.json)
- ✅ Only `vercel.json` exists now

## Pre-Deployment Verification

Run these commands to verify everything is ready:

```bash
cd backend

# 1. Check vercel.json syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('vercel.json')))"

# 2. Verify package.json build script
npm run build

# 3. Generate Prisma Client locally (optional but recommended)
npx prisma generate

# 4. Test locally
npm run dev
```

## Deploy Now!

```bash
cd backend
vercel --prod
```

## Expected Build Process

Vercel will execute:

```
Step 1: npm install
→ Installing all dependencies from package.json

Step 2: npm run build  
→ Running: npx prisma generate
→ ✔ Generated Prisma Client to ./node_modules/@prisma/client

Step 3: Deploy function
→ Uploading api.js and dependencies

Step 4: Function ready
→ Your API is live!
```

## Environment Variables (CRITICAL!)

**MUST set these on Vercel Dashboard:**

Go to: **Vercel → Your Project → Settings → Environment Variables**

### Required Variables:

```bash
DATABASE_URL=postgresql://postgres.gjoogzaylyirxodenewk:%40SaraswatiClasses123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

JWT_SECRET=Saraswati@2026@Production!SecureKey

REFRESH_TOKEN_SECRET=AnotherSecureSecret2026

NODE_ENV=production

ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173,*

CONTACT_NOTIFICATION_EMAIL=shivamaiuse1@gmail.com
```

### Optional but Recommended:

```bash
CLOUDINARY_CLOUD_NAME=dlw2eg0ka
CLOUDINARY_API_KEY=464269363428171
CLOUDINARY_API_SECRET=NHR3rL5W3069tdyyCRsW0b0LkKo

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5000
```

## Post-Deployment Testing

### Test 1: Basic Health Check
```bash
curl https://your-backend.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-20T...",
  "uptime": 0.123
}
```

### Test 2: Database Connection
```bash
curl https://your-backend.vercel.app/health/db
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2026-03-20T..."
}
```

### Test 3: Admin Login
```bash
curl -X POST https://your-backend.vercel.app/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saraswaticlasses.com","password":"admin123"}'
```

Expected: Login successful with tokens

### Test 4: Get Courses List
```bash
curl https://your-backend.vercel.app/api/v1/courses
```

Expected: Array of courses

### Test 5: Contact Form
```bash
curl -X POST https://your-backend.vercel.app/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Testing"}'
```

Expected: Success message, email sent to shivamaiuse1@gmail.com

## Troubleshooting

### Issue: Still getting Prisma errors
**Solution**: Generate Prisma Client locally and commit it
```bash
npx prisma generate
git add .
git commit -m "Add generated Prisma Client"
git push
vercel --prod
```

### Issue: Database connection fails
**Solution**: Check DATABASE_URL format
- Use transaction pooler (port 6543)
- Include SSL parameters
- URL-encode special characters (@ becomes %40)

### Issue: Cold starts are slow
**Solution**: Normal for serverless. First request takes longer.
- Subsequent requests will be faster
- Consider upgrading Vercel plan for always-on functions

### Issue: CORS errors from frontend
**Solution**: Update ALLOWED_ORIGINS
```
https://your-frontend.vercel.app,http://localhost:5173,*
```

## Monitoring

### View Function Logs
1. **Via Dashboard**: Vercel → Functions tab → Click function → View logs
2. **Via CLI**: `vercel logs your-deployment-url`

### Check Performance
- Cold start time
- Average response time  
- Error rate
- Timeout occurrences

## Success Criteria

✅ All tests pass
✅ No errors in Vercel logs
✅ Database connects successfully
✅ Admin login works
✅ Contact form sends emails
✅ File uploads work (Cloudinary)
✅ Frontend can communicate with backend

## Next Steps After Success

1. Update frontend `.env` with backend URL:
   ```
   VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
   ```

2. Deploy frontend to Vercel

3. Test full integration

4. Monitor and optimize performance

---

## Final Verification Before Deploy

- [ ] Only one config file exists (vercel.json)
- [ ] package.json has `"build": "npx prisma generate"`
- [ ] api.js exports app without app.listen()
- [ ] Environment variables are set on Vercel
- [ ] prisma/schema.prisma exists
- [ ] All dependencies are in package.json

**Ready to deploy!** Run `vercel --prod` from the backend directory. 🚀
