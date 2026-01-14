"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetToken = exports.forgotPassword = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../config/email");
// Solicitar recuperação de senha
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email é obrigatório'
            });
        }
        // Buscar usuário
        const user = await database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!user) {
            // Por segurança, não revelar se o email existe ou não
            return res.json({
                success: true,
                message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
            });
        }
        // Gerar token de 6 dígitos
        const resetToken = crypto_1.default.randomInt(100000, 999999).toString();
        // Hash do token para armazenar no banco
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Definir expiração para 1 hora
        const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        // Salvar token no banco
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires
            }
        });
        // Enviar email
        try {
            await (0, email_1.sendPasswordResetEmail)(user.email, resetToken, `${user.firstName} ${user.lastName}`);
            res.json({
                success: true,
                message: 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
            });
        }
        catch (emailError) {
            console.error('Erro ao enviar email:', emailError);
            // Limpar token se o email falhar
            await database_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                }
            });
            return res.status(500).json({
                success: false,
                message: 'Erro ao enviar email. Tente novamente mais tarde.'
            });
        }
    }
    catch (error) {
        console.error('Erro em forgotPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar solicitação'
        });
    }
};
exports.forgotPassword = forgotPassword;
// Verificar se o token é válido
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token é obrigatório'
            });
        }
        // Hash do token para comparar
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        // Buscar usuário com token válido
        const user = await database_1.prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Erro em verifyResetToken:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar token'
        });
    }
};
exports.verifyResetToken = verifyResetToken;
// Redefinir senha
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token e nova senha são obrigatórios'
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'A senha deve ter pelo menos 6 caracteres'
            });
        }
        // Hash do token para comparar
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        // Buscar usuário com token válido
        const user = await database_1.prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
        // Hash da nova senha
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Atualizar senha e limpar token
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });
        // Enviar email de confirmação
        try {
            await (0, email_1.sendPasswordChangedEmail)(user.email, `${user.firstName} ${user.lastName}`);
        }
        catch (emailError) {
            console.error('Erro ao enviar email de confirmação:', emailError);
            // Não falhar a operação se o email de confirmação falhar
        }
        res.json({
            success: true,
            message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.'
        });
    }
    catch (error) {
        console.error('Erro em resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao redefinir senha'
        });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=password.controller.js.map