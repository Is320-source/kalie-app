"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordChangedEmail = exports.sendPasswordResetEmail = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const APP_NAME = process.env.APP_NAME || "Kalie";
const EMAIL_FROM = process.env.EMAIL_FROM || "Kalie <onboarding@resend.dev>";
const sendPasswordResetEmail = async (to, resetToken, userName) => {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Código de Recuperação - ${APP_NAME}`,
            html: `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 480px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
          background-color: #ffffff;
        ">
          <h2 style="margin-bottom: 10px;">${APP_NAME}</h2>
          <p style="color: #555;">Olá ${userName},</p>
          <p style="color: #555;">
            Use o código abaixo para redefinir sua senha:
          </p>

          <div style="
            margin: 30px 0;
            padding: 20px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            background: #f4f4f4;
            border-radius: 12px;
            color: #df2700;
          ">
            ${resetToken}
          </div>

          <p style="font-size: 14px; color: #888;">
            Este código expira em 1 hora.
          </p>

          <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
            Se você não solicitou este código, ignore este email...
          </p>
        </div>
      `,
        });
        if (error)
            throw error;
        return { success: true, id: data?.id };
    }
    catch (error) {
        console.error("Erro ao enviar email:", error);
        throw error;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordChangedEmail = async (to, userName) => {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Senha alterada - ${APP_NAME}`,
            html: `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 480px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        ">
          <h2>${APP_NAME}</h2>
          <p>Olá ${userName},</p>
          <p>Sua senha foi alterada com sucesso.</p>
          <p style="color: #888; font-size: 13px;">
            Se você não realizou esta alteração, entre em contato imediatamente.
          </p>
        </div>
      `,
        });
        if (error)
            throw error;
        return { success: true, id: data?.id };
    }
    catch (error) {
        console.error("Erro ao enviar email:", error);
        throw error;
    }
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
//# sourceMappingURL=email.js.map