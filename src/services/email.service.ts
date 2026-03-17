import { readFileSync } from 'fs';
import { join } from 'path';
import { sendEmail } from '../config/email';
import { logger } from '../utils/logger';

// Template data interfaces
export interface InvitationEmailData {
  name: string;
  email: string;
  association_name: string;
  role: string;
  inviter_name?: string;
  invite_link: string;
  support_url: string;
}

export interface PasswordResetEmailData {
  name: string;
  email: string;
  reset_link: string;
  support_url: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
  association_name: string;
  role: string;
  login_link: string;
  support_url: string;
}

// Simple template renderer
const renderTemplate = (template: string, data: Record<string, any>): string => {
  let rendered = template;

  // Replace all {{variable}} placeholders
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(data[key]));
  });

  // Handle conditionals {{#if variable}}...{{/if}}
  rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, key, content) => {
    return data[key] ? content : '';
  });

  return rendered;
};

// Load email template
const loadTemplate = (templateName: string): string => {
  try {
    const templatePath = join(__dirname, '../templates/email', `${templateName}.template.html`);
    return readFileSync(templatePath, 'utf-8');
  } catch (error: any) {
    logger.error(`Failed to load email template: ${templateName}`, { error: error.message });
    throw new Error(`Email template not found: ${templateName}`);
  }
};

// Email service
export const emailService = {
  /**
   * Send invitation email
   */
  async sendInvitation(data: InvitationEmailData): Promise<boolean> {
    try {
      const template = loadTemplate('invitation');
      const html = renderTemplate(template, data);

      const subject = `You're invited to join ${data.association_name} on 246Sports`;

      const sent = await sendEmail(data.email, subject, html);

      if (sent) {
        logger.info('Invitation email sent successfully', { email: data.email });
      }

      return sent;
    } catch (error: any) {
      logger.error('Failed to send invitation email', { error: error.message, email: data.email });
      return false;
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: PasswordResetEmailData): Promise<boolean> {
    try {
      const template = loadTemplate('password-reset');
      const html = renderTemplate(template, data);

      const subject = 'Reset Your 246Sports Password';

      const sent = await sendEmail(data.email, subject, html);

      if (sent) {
        logger.info('Password reset email sent successfully', { email: data.email });
      }

      return sent;
    } catch (error: any) {
      logger.error('Failed to send password reset email', { error: error.message, email: data.email });
      return false;
    }
  },

  /**
   * Send welcome email
   */
  async sendWelcome(data: WelcomeEmailData): Promise<boolean> {
    try {
      const template = loadTemplate('welcome');
      const html = renderTemplate(template, data);

      const subject = `Welcome to 246Sports - ${data.association_name}`;

      const sent = await sendEmail(data.email, subject, html);

      if (sent) {
        logger.info('Welcome email sent successfully', { email: data.email });
      }

      return sent;
    } catch (error: any) {
      logger.error('Failed to send welcome email', { error: error.message, email: data.email });
      return false;
    }
  },

  /**
   * Send custom email (for flexibility)
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    templateName: string,
    data: Record<string, any>
  ): Promise<boolean> {
    try {
      const template = loadTemplate(templateName);
      const html = renderTemplate(template, data);

      const sent = await sendEmail(to, subject, html);

      if (sent) {
        logger.info('Custom email sent successfully', { email: to, template: templateName });
      }

      return sent;
    } catch (error: any) {
      logger.error('Failed to send custom email', { error: error.message, email: to, template: templateName });
      return false;
    }
  },
};

export default emailService;
