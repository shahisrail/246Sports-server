#!/usr/bin/env node

/**
 * Startup Health Check Script
 * Run this before starting the server to verify environment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running startup health checks...\n');

const checks = [];

// Check if dist directory exists
const distCheck = () => {
  const distPath = path.join(__dirname, '../dist');
  const exists = fs.existsSync(distPath);
  const serverJs = fs.existsSync(path.join(distPath, 'server.js'));

  if (exists && serverJs) {
    console.log('✅ Build artifacts found');
    return true;
  } else {
    console.log('❌ Build artifacts missing - run "npm run build" first');
    return false;
  }
};

// Check environment variables
const envCheck = () => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  const optionalVars = [
    'CLOUDINARY_CLOUD_NAME',
    'SMTP_HOST',
    'CORS_ORIGIN'
  ];

  if (missing.length > 0) {
    console.log(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  } else {
    console.log('✅ Required environment variables set');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: ${process.env.PORT || 3000}`);
    return true;
  }
};

// Check database URL format
const dbUrlCheck = () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log('⚠️  No DATABASE_URL set');
    return false;
  }

  try {
    const url = new URL(dbUrl);
    console.log('✅ DATABASE_URL format valid');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Database: ${url.pathname.replace('/', '')}`);
    return true;
  } catch (error) {
    console.log('❌ DATABASE_URL format invalid');
    return false;
  }
};

// Run all checks
checks.push(distCheck());
checks.push(envCheck());
checks.push(dbUrlCheck());

console.log('\n' + '='.repeat(50));

const allPassed = checks.every(check => check === true);

if (allPassed) {
  console.log('✅ All startup checks passed!');
  console.log('🚀 Starting server...\n');
  process.exit(0);
} else {
  console.log('❌ Some startup checks failed!');
  console.log('Please fix the issues above before starting the server.\n');
  process.exit(1);
}
