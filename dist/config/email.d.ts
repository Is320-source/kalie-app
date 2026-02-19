export declare const sendPasswordResetEmail: (to: string, resetToken: string, userName: string) => Promise<{
    success: boolean;
    id: string;
}>;
export declare const sendPasswordChangedEmail: (to: string, userName: string) => Promise<{
    success: boolean;
    id: string;
}>;
//# sourceMappingURL=email.d.ts.map