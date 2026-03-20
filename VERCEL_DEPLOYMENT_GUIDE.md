# Vercel Deployment Guide for Saraswati Classes Backend

## Quick Start

### 1. Test Basic Setup First
We've created a simplified API entry point (`vercel-api.js`) to verify the basic Vercel setup works without database dependencies.

**Deploy and test:**
```bash
cd backend
vercel --prod
```

Then visit: `https://your-backend.vercel.app/health`

You should see:
```json
{
  "success": true,
  "message": "Vercel backend is running!",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Configure Environment Variables on Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

#### Required Variables:
- `DATABASE_URL`: Your Supabase connection string
  ```
  postgresql://postgres.gjoogzaylyirxodenewk:%40SaraswatiClasses123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
  ```
- `JWT_SECRET`: A strong random string (e.g., `Saraswati@2026@Production!`)
- `NODE_ENV`: `production`
- `ALLOWED_ORIGINS`: Your frontend URL(s)
  ```
  https://your-frontend.vercel.app,http://localhost:5173
  ```

#### Optional Variables:
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `EMAIL_HOST`: SMTP host (e.g., `smtp.gmail.com`)
- `EMAIL_PORT`: SMTP port (e.g., `587`)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email password/app password
- `CONTACT_NOTIFICATION_EMAIL`: `shivamaiuse1@gmail.com`
- `RATE_LIMIT_WINDOW_MS`: `900000` (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: `5000`

### 3. Upgrade to Full API (After Basic Setup Works)

Once the health check works, update `vercel.json` to use the full API:

```json
{
  "version": 2,
  "name": "saraswati-classes-backend",
  "builds": [
    {
      "src": "api.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "engines": {
    "node": "18.x"
  }
}
```

Then deploy again:
```bash
vercel --prod
```

### 4. Test Database Connection

Visit: `https://your-backend.vercel.app/health/db`

This will test if the database connection is working properly.

## Troubleshooting

### Common Issues:

#### 1. FUNCTION_INVOCATION_FAILED
**Cause**: Missing environment variables or database connection issues

**Solution**:
- Check Vercel logs: Dashboard → Functions → Click on function → View logs
- Verify all required environment variables are set
- Ensure DATABASE_URL is correct and accessible

#### 2. Database Connection Errors
**Cause**: SSL requirements or connection pooling issues

**Solution**:
- The `prisma.js` config has been updated to handle Vercel's serverless environment
- Make sure your Supabase pooler URL includes SSL parameters
- Use the transaction pooler (port 6543) instead of session pooler

#### 3. CORS Errors
**Cause**: Frontend URL not in ALLOWED_ORIGINS

**Solution**:
- Add your frontend Vercel URL to ALLOWED_ORIGINS
- Format: `https://your-app.vercel.app`

### Checking Logs

To view detailed error logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click on "Functions" tab
4. Click on the function that failed
5. Click "View Function Logs"

Or use CLI:
```bash
vercel logs your-deployment-url
```

## File Structure

```
backend/
├── vercel.json              # Vercel configuration
├── vercel-api.js           # Simplified API for testing
├── api.js                  # Full API with database
├── .env.example            # Environment variables template
└── config/
    └── prisma.js          # Database configuration (Vercel-aware)
```

## Important Notes

1. **Serverless Architecture**: Vercel functions are stateless and have cold starts
2. **Database Connections**: Connections are lazy-loaded per request
3. **Timeout Limits**: Serverless functions have a maximum execution time (10s for Hobby plan, 60s for Pro)
4. **Cold Starts**: First request after deployment may take longer

## Testing Checklist

- [ ] Health endpoint works: `/health`
- [ ] Database health works: `/health/db`
- [ ] All environment variables are set
- [ ] CORS allows your frontend URL
- [ ] Auth endpoints work: `/api/v1/auth/admin/login`
- [ ] Course endpoints work: `/api/v1/courses`
- [ ] File uploads work (if using Cloudinary)

## Next Steps After Successful Deployment

1. Update frontend `.env` with the backend Vercel URL
2. Test full authentication flow
3. Test course CRUD operations
4. Test file uploads
5. Monitor function logs for any errors

## Support

If issues persist:
1. Check Vercel documentation: https://vercel.com/docs
2. Review function logs for specific error messages
3. Ensure all dependencies are installed: `npm install`
4. Verify Node.js version compatibility (18.x)
