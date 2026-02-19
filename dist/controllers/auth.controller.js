"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../utils/validation");
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: João
 *               lastName:
 *                 type: string
 *                 example: Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *               gender:
 *                 type: string
 *                 example: male
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email já está em uso
 */
const register = async (req, res) => {
    try {
        const validatedData = validation_1.registerSchema.parse(req.body);
        // Check if user exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: validatedData.email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                password: hashedPassword,
                gender: validatedData.gender,
                birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : undefined
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                createdAt: true
            }
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar || undefined
        });
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                user: {
                    ...user,
                    token
                },
                token
            }
        });
    }
    catch (error) {
        if (error.errors) {
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors: error.errors
            });
        }
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao registrar'
        });
    }
};
exports.register = register;
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Credenciais inválidas
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
const login = async (req, res) => {
    try {
        const validatedData = validation_1.loginSchema.parse(req.body);
        // Find user
        const user = await database_1.prisma.user.findUnique({
            where: { email: validatedData.email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }
        // Verify password
        const validPassword = await bcryptjs_1.default.compare(validatedData.password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }
        // Update last seen
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() }
        });
        // Generate token
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar || undefined
        });
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: {
                    ...userWithoutPassword,
                    token
                },
                token
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao fazer login'
        });
    }
};
exports.login = login;
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     description: Retorna o perfil do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const getProfile = async (req, res) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                coverPhoto: true,
                bio: true,
                gender: true,
                birthDate: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        posts: true,
                        //friends: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar perfil'
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map