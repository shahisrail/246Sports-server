import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('🔍 Email Configuration Debug\n');
console.log('SMTP Configuration:');
console.log('  Host:', process.env.SMTP_HOST);
console.log('  Port:', process.env.SMTP_PORT);
console.log('  Secure:', process.env.SMTP_SECURE);
console.log('  User:', process.env.SMTP_USER);
console.log('  Pass:', process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 4)}****${process.env.SMTP_PASS.substring(process.env.SMTP_PASS.length - 4)}` : 'NOT SET');
console.log('  From:', process.env.EMAIL_FROM_NAME, `<${process.env.EMAIL_FROM_ADDRESS}>`);

// Test different configurations
const configs = [
  {
    name: 'Mailtrap Port 2525 (STARTTLS)',
    config: {
      host: process.env.SMTP_HOST,
      port: 2525,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },
  {
    name: 'Mailtrap Port 587 (STARTTLS)',
    config: {
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },
];

async function testConfig(name: string, config: any) {
  console.log(`\n\n🧪 Testing: ${name}`);
  console.log('   Port:', config.port, 'Secure:', config.secure);

  try {
    const transporter = nodemailer.createTransport(config);

    // Try to verify
    console.log('   → Verifying connection...');
    await transporter.verify();
    console.log('   ✅ Connection verified!');

    // Try to send email
    console.log('   → Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || '246Sports'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Mailtrap Test - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>✅ Email Test Successful!</h1>
          <p>This email was sent using: <strong>${name}</strong></p>
          <p>Configuration:</p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>Secure: ${config.secure}</li>
          </ul>
          <p>Check your Mailtrap inbox to see this email!</p>
        </body>
        </html>
      `,
    });

    console.log('   ✅ Email sent!');
    console.log('   📧 Message ID:', info.messageId);
    console.log('   📬 Check Mailtrap: https://mailtrap.io/inboxes');
    return true;
  } catch (error: any) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing different Mailtrap configurations...');
  console.log('='.repeat(60));

  let success = false;
  for (const { name, config } of configs) {
    const result = await testConfig(name, config);
    if (result) {
      success = true;
      console.log(`\n🎉 Found working configuration: ${name}`);
      break;
    }
  }

  if (!success) {
    console.log('\n\n❌ All configurations failed!');
    console.log('\nTroubleshooting:');
    console.log('1. Check your Mailtrap credentials at: https://mailtrap.io');
    console.log('2. Verify the username and password are correct');
    console.log('3. Make sure you\'re using sandbox credentials');
    console.log('4. Try resetting your Mailtrap credentials');
  }

  console.log('\n' + '='.repeat(60));
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
