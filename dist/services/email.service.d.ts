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
export interface WelcomeWithCredentialsEmailData {
    name: string;
    email: string;
    password: string;
    role: string;
    login_link: string;
    support_url: string;
}
export declare const emailService: {
    /**
     * Send invitation email
     */
    sendInvitation(data: InvitationEmailData): Promise<boolean>;
    /**
     * Send password reset email
     */
    sendPasswordReset(data: PasswordResetEmailData): Promise<boolean>;
    /**
     * Send welcome email
     */
    sendWelcome(data: WelcomeEmailData): Promise<boolean>;
    /**
     * Send welcome email with credentials
     */
    sendWelcomeWithCredentials(data: WelcomeWithCredentialsEmailData): Promise<boolean>;
    /**
     * Send custom email (for flexibility)
     */
    sendCustomEmail(to: string, subject: string, templateName: string, data: Record<string, any>): Promise<boolean>;
};
export default emailService;
//# sourceMappingURL=email.service.d.ts.map