import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Get email configuration from environment
const getEmailConfig = (): EmailConfig => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');

  // For Mailtrap sandbox and other services using STARTTLS, secure should be false
  // For Gmail with port 465, secure should be true
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return {
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
    },
  };
};

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig();

  // Check if email is configured
  if (!config.auth.user || !config.auth.pass) {
    logger.warn('Email credentials not configured. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport(config);
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      logger.error('Email transporter not configured');
      return false;
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || '246Sports'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    logger.info('Email sent successfully', { messageId: info.messageId, to });
    return true;
  } catch (error: any) {
    logger.error('Failed to send email', { error: error.message, to });
    return false;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return false;
    }

    await transporter.verify();
    logger.info('Email server is ready to send messages');
    return true;
  } catch (error: any) {
    logger.error('Email configuration verification failed', { error: error.message });
    return false;
  }
};

export default {
  sendEmail,
  verifyEmailConfig,
};
