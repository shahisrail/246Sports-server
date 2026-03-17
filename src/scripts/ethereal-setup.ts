import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

async function setupEtherealEmail() {
  console.log('🔮 Setting up Ethereal Email for testing...\n');

  try {
    // Create a test account
    const testAccount = await nodemailer.createTestAccount();

    console.log('✅ Ethereal account created successfully!\n');

    // Display credentials
    console.log('📧 Ethereal Email Credentials:');
    console.log('   Host: smtp.ethereal.email');
    console.log('   Port: 587');
    console.log('   Secure: false');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
    console.log('   Web: https://ethereal.email/messages');

    // Update .env file
    const envPath = join(process.cwd(), '.env');
    const envContent = `
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports_db
DB_USER=postgres
DB_PASSWORD=shahisrailcse

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=365d

# Refresh Token Configuration
REFRESH_TOKEN_EXPIRES_DAYS=7

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dm6crryf2
CLOUDINARY_API_KEY=157947392252212
CLOUDINARY_API_SECRET=V4g1cdTYVe-kducPzNSdBn0HBfg

# Logging
LOG_LEVEL=debug

# Email Configuration (SMTP) - Ethereal Email for Testing
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${testAccount.user}
SMTP_PASS=${testAccount.pass}
EMAIL_FROM_NAME=246Sports
EMAIL_FROM_ADDRESS=noreply@246sports.com
`;

    writeFileSync(envPath, envContent.trim());
    console.log('\n✅ .env file updated with Ethereal credentials!');

    // Test sending an email
    console.log('\n🧪 Testing email sending...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"246Sports" <${testAccount.user}>`,
      to: testAccount.user,
      subject: '246Sports Email Test - Ethereal',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #667eea;">🎉 Email Test Successful!</h1>
            <p>Your email system is configured correctly with Ethereal Email.</p>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Configuration:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>Host:</strong> smtp.ethereal.email</li>
                <li><strong>Port:</strong> 587</li>
                <li><strong>Secure:</strong> false (STARTTLS)</li>
              </ul>
            </div>

            <h3>📬 View Test Emails:</h3>
            <p>Visit: <a href="https://ethereal.email/messages" target="_blank" style="color: #667eea;">https://ethereal.email/messages</a></p>
            <p>Login with these credentials:</p>
            <ul>
              <li><strong>Username:</strong> ${testAccount.user}</li>
              <li><strong>Password:</strong> ${testAccount.pass}</li>
            </ul>

            <p style="color: #6b7280; font-size: 14px;">
              <strong>Note:</strong> Ethereal Email is a fake SMTP service for testing.
              Replace with real SMTP (Gmail, SendGrid, etc.) for production.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info));

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Email system is ready to use!');
    console.log('='.repeat(70));
    console.log('\n📋 Quick Start:');
    console.log('1. View test emails: https://ethereal.email/messages');
    console.log('2. Login with the credentials shown above');
    console.log('3. Run email tests in your app');
    console.log('\n⚠️  Remember to switch to real SMTP for production!');
    console.log('='.repeat(70) + '\n');

  } catch (error: any) {
    console.error('❌ Failed to set up Ethereal Email:', error.message);
    process.exit(1);
  }
}

setupEtherealEmail()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
