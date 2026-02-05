import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  gender: z.string().optional(),
  birthDate: z
  .string()
  .optional()
  .refine(
    (val) => !val || !isNaN(new Date(val).getTime()),
    { message: "Data de nascimento inválida" }
  )
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Post schemas
export const postSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  location: z.string().optional(),
  feeling: z.string().optional(),
  privacy: z.enum(['public', 'friends', 'private']).default('public'),
  hashtags: z.string().optional().transform((val) => {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  })
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comentário é obrigatório'),
  postId: z.string()
});

// Message schemas
export const messageSchema = z.object({
  content: z.string().optional(),
  receiverId: z.string(),
  image: z.string().optional()
}).refine(data => data.content || data.image, {
  message: "Mensagem deve conter texto ou imagem"
});

// User schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  bio: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional()
});