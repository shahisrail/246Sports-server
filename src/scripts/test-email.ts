import * as dotenv from 'dotenv';
import { verifyEmailConfig, sendEmail } from '../config/email';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Test email configuration
 * Run with: npm run test:email (after adding to package.json scripts)
 * Or: ts-node src/scripts/test-email.ts
 */
async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');

  // Verify configuration
  console.log('1. Verifying email configuration...');
  const isValid = await verifyEmailConfig();

  if (!isValid) {
    console.log('❌ Email configuration is invalid!');
    console.log('\nPlease check your .env file:');
    console.log('  - SMTP_HOST=smtp.gmail.com');
    console.log('  - SMTP_PORT=465');
    console.log('  - SMTP_SECURE=true');
    console.log('  - SMTP_USER=your-email@gmail.com');
    console.log('  - SMTP_PASS=your-app-password');
    process.exit(1);
  }

  console.log('✅ Email configuration is valid!\n');

  // Send test email
  console.log('2. Sending test email...');
  // Use a real email address for testing, not the SMTP username
  const testEmail = 'shahisrail134@gmail.com';
  const subject = '246Sports Email Test - Mailtrap';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Email Test Successful!</h1>
        </div>
        <div class="content">
          <h2>SMTP Configuration is Working!</h2>
          <p>Congratulations! Your email service is properly configured and ready to send emails.</p>

          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
            <li><strong>SMTP Secure:</strong> ${process.env.SMTP_SECURE}</li>
            <li><strong>From:</strong> ${process.env.EMAIL_FROM_NAME} &lt;${process.env.EMAIL_FROM_ADDRESS}&gt;</li>
          </ul>

          <p>You can now use the email service to send:</p>
          <ul>
            <li>✅ Invitation emails</li>
            <li>✅ Welcome emails</li>
            <li>✅ Password reset emails</li>
            <li>✅ Custom notifications</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}" class="button">Visit 246Sports</a>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Use the email service in your controllers</li>
            <li>Import: <code>import { emailService } from '../services/email.service';</code></li>
            <li>Send emails: <code>await emailService.sendInvitation(data);</code></li>
          </ol>
        </div>
        <div class="footer">
          <p>This is an automated test email from 246Sports Platform.</p>
          <p>If you received this email, your SMTP configuration is working correctly! 🚀</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const sent = await sendEmail(testEmail, subject, html);

  if (sent) {
    console.log(`✅ Test email sent successfully to ${testEmail}`);
    console.log('📬 Please check your inbox (and spam folder)');
    console.log('\n🎉 Email integration is ready to use!');
  } else {
    console.log('❌ Failed to send test email');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you\'re using an App Password, not your regular password');
    console.log('2. Enable 2-Factor Authentication on your Google Account');
    console.log('3. Generate an App Password at: https://myaccount.google.com/apppasswords');
    console.log('4. Use the App Password in SMTP_PASS');
    process.exit(1);
  }
}

// Run the test
testEmailConfiguration()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    logger.error('Email test error', { error: error.message, stack: error.stack });
    process.exit(1);
  });
