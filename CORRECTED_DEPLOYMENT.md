# ✅ CORRECTED Vercel Deployment Guide

## What Was Wrong

1. ❌ `vercel.json` had invalid `scripts` property (not supported by Vercel schema)
2. ❌ Prisma Client wasn't being generated during build

## What's Fixed

1. ✅ Updated [`package.json`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\package.json) - Changed build script to `npx prisma generate`
2. ✅ Cleaned up [`vercel.json`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\vercel.json) - Removed invalid `scripts` property
3. ✅ Created [`now.json`](file://s:\Projects\Synerjex\New%20Clone\Saraswati-Classes-Combined\backend\now.json) - Alternative config (optional)

## How Vercel Build Works Now

Vercel automatically runs `npm run build` during deployment, which will now:
```bash
npx prisma generate
```

This generates the Prisma Client before your function is deployed.

## Deploy Steps

### Step 1: Commit and Push
```bash
git add .
git commit -m "Fix Prisma generation for Vercel"
git push
```

### Step 2: Deploy
```bash
cd backend
vercel --prod
```

### Step 3: Watch Build Logs

You should see:
```
Running "npm run build"
> npx prisma generate
✔ Generated Prisma Client to ./node_modules/@prisma/client
Build completed successfully!
```

## If It Still Fails

### Option A: Manual Generation Before Deploy

Generate Prisma Client locally, then deploy:

```bash
cd backend
npx prisma generate
git add .
git commit -m "Add generated Prisma Client"
git push
vercel --prod
```

### Option B: Use Postinstall Script

If Vercel still doesn't run the build, add a postinstall hook:

Edit `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "npx prisma generate"
  }
}
```

This ensures Prisma Client is generated right after `npm install`.

### Option C: Commit Generated Client

1. Generate locally: `npx prisma generate`
2. This creates `.prisma/client/` directory
3. Commit it to Git (add to `.gitignore` if needed)
4. Push and deploy

## Test Deployment

After successful deployment:

1. **Health Check**: `https://your-app.vercel.app/health`
   ```json
   {
     "success": true,
     "message": "Server is running"
   }
   ```

2. **Database Test**: `https://your-app.vercel.app/health/db`
   ```json
   {
     "success": true,
     "message": "Database connected"
   }
   ```

3. **Admin Login**: 
   ```
   POST https://your-app.vercel.app/api/v1/auth/admin/login
   Content-Type: application/json
   
   {
     "email": "admin@saraswaticlasses.com",
     "password": "admin123"
   }
   ```

## Required Environment Variables

Set these on **Vercel Dashboard → Settings → Environment Variables**:

```
DATABASE_URL=postgresql://postgres.gjoogzaylyirxodenewk:%40SaraswatiClasses123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
JWT_SECRET=Saraswati@2026@Production!SecureKey
REFRESH_TOKEN_SECRET=AnotherSecureSecret2026
NODE_ENV=production
ALLOWED_ORIGINS=*
CONTACT_NOTIFICATION_EMAIL=shivamaiuse1@gmail.com
CLOUDINARY_CLOUD_NAME=dlw2eg0ka
CLOUDINARY_API_KEY=464269363428171
CLOUDINARY_API_SECRET=NHR3rL5W3069tdyyCRsW0b0LkKo
```

## Verification Checklist

- [ ] package.json has `"build": "npx prisma generate"`
- [ ] vercel.json does NOT have `scripts` property
- [ ] prisma/schema.prisma exists
- [ ] @prisma/client is in dependencies
- [ ] Environment variables are set on Vercel
- [ ] Build logs show "Generated Prisma Client"

---

**Ready to deploy!** Run `vercel --prod` from the backend directory.
