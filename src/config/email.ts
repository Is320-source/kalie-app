import nodemailer from 'nodemailer';

// Configuração do transporter de email
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true para porta 465, false para outras portas
  auth: {
    user: process.env.SMTP_USERNAME || 'noreply@netsulwel.tech',
    pass: process.env.SMTP_PASSWORD || ';m4VEpa[?TO&',
  },
});

// Verificar conexão
transporter.verify((error, success) => {
  if (error) {
    console.error('Erro na configuração de email:', error);
  } else {
    console.log('✅ Servidor de email pronto para enviar mensagens');
  }
});

// Função para enviar email de recuperação de senha
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  userName: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'exp://192.168.8.48:8081'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Kalie App" <${process.env.SMTP_USERNAME || 'noreply@netsulwel.tech'}>`,
    to,
    subject: 'Recuperação de Senha - Kalie',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #df2700;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #df2700;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #c02200;
          }
          .token-box {
            background-color: #f5f5f5;
            border: 2px dashed #df2700;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #df2700;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Kalie</div>
            <h2 style="color: #333; margin: 0;">Recuperação de Senha</h2>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no Kalie.</p>
            
            <p>Use o código abaixo para redefinir sua senha:</p>
            
            <div class="token-box">
              ${resetToken}
            </div>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este código expira em <strong>1 hora</strong></li>
                <li>Use o código apenas uma vez</li>
                <li>Não compartilhe este código com ninguém</li>
              </ul>
            </div>
            
            <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Kalie. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Olá ${userName},
      
      Recebemos uma solicitação para redefinir a senha da sua conta no Kalie.
      
      Use o código abaixo para redefinir sua senha:
      
      ${resetToken}
      
      Ou acesse o link: ${resetUrl}
      
      IMPORTANTE:
      - Este código expira em 1 hora
      - Use o código apenas uma vez
      - Não compartilhe este código com ninguém
      
      Se você não solicitou a redefinição de senha, ignore este email.
      
      Atenciosamente,
      Equipe Kalie
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

// Função para enviar email de confirmação de senha alterada
export const sendPasswordChangedEmail = async (
  to: string,
  userName: string
) => {
  const mailOptions = {
    from: `"Kalie App" <${process.env.SMTP_USERNAME || 'noreply@netsulwel.tech'}>`,
    to,
    subject: 'Senha Alterada com Sucesso - Kalie',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h2 style="text-align: center; color: #059669;">Senha Alterada com Sucesso!</h2>
          
          <p>Olá <strong>${userName}</strong>,</p>
          
          <p>Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR')}.</p>
          
          <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>
          
          <p style="margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Kalie</strong>
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de confirmação enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    throw error;
  }
};
