import nodemailer from 'nodemailer';
export declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare const sendPasswordResetEmail: (to: string, resetToken: string, userName: string) => Promise<{
    success: boolean;
    messageId: string;
}>;
export declare const sendPasswordChangedEmail: (to: string, userName: string) => Promise<{
    success: boolean;
    messageId: string;
}>;
//# sourceMappingURL=email.d.ts.map