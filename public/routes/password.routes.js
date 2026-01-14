"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const password_controller_1 = require("../controllers/password.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/password/forgot:
 *   post:
 *     summary: Solicitar recuperação de senha
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 *       400:
 *         description: Email inválido
 *       500:
 *         description: Erro no servidor
 */
router.post('/forgot', password_controller_1.forgotPassword);
/**
 * @swagger
 * /api/password/verify-token:
 *   post:
 *     summary: Verificar se o token de recuperação é válido
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/verify-token', password_controller_1.verifyResetToken);
/**
 * @swagger
 * /api/password/reset:
 *   post:
 *     summary: Redefinir senha com token
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou senha fraca
 */
router.post('/reset', password_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=password.routes.js.map