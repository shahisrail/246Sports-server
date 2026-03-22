"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const email_1 = require("../config/email");
const logger_1 = require("../utils/logger");
// Simple template renderer
const renderTemplate = (template, data) => {
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
const loadTemplate = (templateName) => {
    try {
        const templatePath = (0, path_1.join)(__dirname, '../templates/email', `${templateName}.template.html`);
        return (0, fs_1.readFileSync)(templatePath, 'utf-8');
    }
    catch (error) {
        logger_1.logger.error(`Failed to load email template: ${templateName}`, { error: error.message });
        throw new Error(`Email template not found: ${templateName}`);
    }
};
// Email service
exports.emailService = {
    /**
     * Send invitation email
     */
    async sendInvitation(data) {
        try {
            const template = loadTemplate('invitation');
            const html = renderTemplate(template, data);
            const subject = `You're invited to join ${data.association_name} on 246Sports`;
            const sent = await (0, email_1.sendEmail)(data.email, subject, html);
            if (sent) {
                logger_1.logger.info('Invitation email sent successfully', { email: data.email });
            }
            return sent;
        }
        catch (error) {
            logger_1.logger.error('Failed to send invitation email', { error: error.message, email: data.email });
            return false;
        }
    },
    /**
     * Send password reset email
     */
    async sendPasswordReset(data) {
        try {
            const template = loadTemplate('password-reset');
            const html = renderTemplate(template, data);
            const subject = 'Reset Your 246Sports Password';
            const sent = await (0, email_1.sendEmail)(data.email, subject, html);
            if (sent) {
                logger_1.logger.info('Password reset email sent successfully', { email: data.email });
            }
            return sent;
        }
        catch (error) {
            logger_1.logger.error('Failed to send password reset email', { error: error.message, email: data.email });
            return false;
        }
    },
    /**
     * Send welcome email
     */
    async sendWelcome(data) {
        try {
            const template = loadTemplate('welcome');
            const html = renderTemplate(template, data);
            const subject = `Welcome to 246Sports - ${data.association_name}`;
            const sent = await (0, email_1.sendEmail)(data.email, subject, html);
            if (sent) {
                logger_1.logger.info('Welcome email sent successfully', { email: data.email });
            }
            return sent;
        }
        catch (error) {
            logger_1.logger.error('Failed to send welcome email', { error: error.message, email: data.email });
            return false;
        }
    },
    /**
     * Send welcome email with credentials
     */
    async sendWelcomeWithCredentials(data) {
        try {
            const template = loadTemplate('welcome-with-credentials');
            const html = renderTemplate(template, data);
            const subject = 'Welcome to 246Sports - Your Account is Ready';
            const sent = await (0, email_1.sendEmail)(data.email, subject, html);
            if (sent) {
                logger_1.logger.info('Welcome with credentials email sent successfully', { email: data.email });
            }
            return sent;
        }
        catch (error) {
            logger_1.logger.error('Failed to send welcome with credentials email', { error: error.message, email: data.email });
            return false;
        }
    },
    /**
     * Send custom email (for flexibility)
     */
    async sendCustomEmail(to, subject, templateName, data) {
        try {
            const template = loadTemplate(templateName);
            const html = renderTemplate(template, data);
            const sent = await (0, email_1.sendEmail)(to, subject, html);
            if (sent) {
                logger_1.logger.info('Custom email sent successfully', { email: to, template: templateName });
            }
            return sent;
        }
        catch (error) {
            logger_1.logger.error('Failed to send custom email', { error: error.message, email: to, template: templateName });
            return false;
        }
    },
};
exports.default = exports.emailService;
//# sourceMappingURL=email.service.js.map