"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConfig = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
// Get email configuration from environment
const getEmailConfig = () => {
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
        logger_1.logger.warn('Email credentials not configured. Email functionality will be disabled.');
        return null;
    }
    return nodemailer_1.default.createTransport(config);
};
// Send email function
const sendEmail = async (to, subject, html, text) => {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            logger_1.logger.error('Email transporter not configured');
            return false;
        }
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || '246Sports'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        });
        logger_1.logger.info('Email sent successfully', { messageId: info.messageId, to });
        return true;
    }
    catch (error) {
        logger_1.logger.error('Failed to send email', { error: error.message, to });
        return false;
    }
};
exports.sendEmail = sendEmail;
// Verify email configuration
const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            return false;
        }
        await transporter.verify();
        logger_1.logger.info('Email server is ready to send messages');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Email configuration verification failed', { error: error.message });
        return false;
    }
};
exports.verifyEmailConfig = verifyEmailConfig;
exports.default = {
    sendEmail: exports.sendEmail,
    verifyEmailConfig: exports.verifyEmailConfig,
};
//# sourceMappingURL=email.js.map