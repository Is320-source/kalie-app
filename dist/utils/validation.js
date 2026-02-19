"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.messageSchema = exports.commentSchema = exports.postSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: zod_1.z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    gender: zod_1.z.string().optional(),
    birthDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(new Date(val).getTime()), { message: "Data de nascimento inválida" })
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória')
});
// Post schemas
exports.postSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Conteúdo é obrigatório'),
    location: zod_1.z.string().optional(),
    feeling: zod_1.z.string().optional(),
    privacy: zod_1.z.enum(['public', 'friends', 'private']).default('public'),
    hashtags: zod_1.z.string().optional().transform((val) => {
        if (!val)
            return [];
        try {
            return JSON.parse(val);
        }
        catch {
            return [];
        }
    })
});
exports.commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comentário é obrigatório'),
    postId: zod_1.z.string()
});
// Message schemas
exports.messageSchema = zod_1.z.object({
    content: zod_1.z.string().optional(),
    receiverId: zod_1.z.string(),
    image: zod_1.z.string().optional()
}).refine(data => data.content || data.image, {
    message: "Mensagem deve conter texto ou imagem"
});
// User schemas
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().optional()
});
//# sourceMappingURL=validation.js.map