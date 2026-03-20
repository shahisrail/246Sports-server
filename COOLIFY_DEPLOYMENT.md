

## Issues Fixed

1. **Build Configuration**: Created `nixpacks.toml` to ensure proper build process
2. **Database Error Handling**: Added proper production error handling
3. **Environment Variables**: Fixed NODE_ENV configuration

## Coolify Configuration

### Build Settings
- **Build Pack**: Nixpacks
- **Base Directory**: `/backend`
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Start Command**: `node dist/server.js`

### Environment Variables

#### Production Environment Variables (CRITICAL - Read carefully)
```
# Build-time variables (Set these as "Runtime Only" in Coolify)
NODE_ENV=production  # ⚠️ IMPORTANT: Set as "Runtime Only", NOT "Available at Buildtime"

# Runtime variables
PORT=3000
DATABASE_URL=postgres://postgres:CeglG6jy4P0aF4VQoFgPodvYaCx5VHkeNWbS0L4y9tGczajlnuk72VkiinM6nWrr@i3zcfy9gxbqnlqd65tt5rro2:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=365d
REFRESH_TOKEN_EXPIRES_DAYS=7

# CORS Configuration
CORS_ORIGIN=*

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dm6crryf2
CLOUDINARY_API_KEY=157947392252212
CLOUDINARY_API_SECRET=V4g1cdTYVe-kducPzNSdBn0HBfg

# Logging
LOG_LEVEL=info

# Email Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=89f635387784d8
SMTP_PASS=067f32ffe254cc
EMAIL_FROM_NAME=246Sports
EMAIL_FROM_ADDRESS=noreply@246sports.com

# Node version
NIXPACKS_NODE_VERSION=22
```

### Important Configuration Steps

1. **Set NODE_ENV as Runtime Only**:
   - Go to Environment Variables in Coolify
   - Find or add `NODE_ENV=production`
   - **Uncheck** "Available at Buildtime"
   - This ensures devDependencies (TypeScript, etc.) are installed during build

2. **Update Base Directory**:
   - Set Base Directory to `/backend` (not `/`)
   - This ensures Coolify finds the correct package.json

3. **Port Configuration**:
   - Exposed Port: `3000`
   - Port Mapping: `3000:3000`

4. **Health Check** (Optional but recommended):
   - Endpoint: `/health`
   - Interval: 30s
   - Timeout: 10s
   - Retries: 3

## Troubleshooting

### Application keeps restarting
1. Check logs in Coolify
2. Verify NODE_ENV is set to "Runtime Only"
3. Ensure database is accessible
4. Verify all environment variables are set

### Build fails
1. Check that Base Directory is set to `/backend`
2. Verify NODE_ENV is NOT available at buildtime
3. Check that all dependencies are in package.json

### Database connection fails
1. Verify DATABASE_URL is correct
2. Ensure database server is accessible
3. Check SSL settings (required for production databases)

### No logs appearing
1. Ensure LOG_LEVEL is set to `info` or `debug`
2. Check that the application is actually starting
3. Verify the start command is correct: `node dist/server.js`

## Deployment Steps

1. Push changes to git repository
2. In Coolify, click "Redeploy" or wait for auto-deployment
3. Monitor deployment logs for errors
4. Once deployed, test the health endpoint: `https://api.246sports.com/health`
5. Check API docs at: `https://api.246sports.com/api-docs`

## Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] API documentation is accessible
- [ ] Database connection is working
- [ ] Environment variables are correctly set
- [ ] No restart loops occurring
- [ ] Application logs are visible

## Monitoring

After successful deployment, monitor:
- Application logs in Coolify
- Database connection status
- API response times
- Error rates
- Resource usage (CPU, Memory)
