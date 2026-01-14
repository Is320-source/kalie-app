import { Request, Response, NextFunction } from 'express';

/**
 * Regex oficial para ObjectId do MongoDB (24 chars hex)
 */
const objectIdRegex = /^[a-f\d]{24}$/i;

/**
 * Middleware genérico para validar ObjectId do MongoDB
 * Previne erros P2023 do Prisma
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const param = req.params[paramName];

    // Garantir que seja string
    if (typeof param !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Parâmetro ${paramName} inválido`
      });
    }

    if (!objectIdRegex.test(param)) {
      return res.status(400).json({
        success: false,
        message: `${paramName} inválido. Deve ser um ObjectId válido do MongoDB.`
      });
    }

    next();
  };
};

/* Middlewares específicos */
export const validateUserId = validateObjectId('userId');
export const validatePostId = validateObjectId('postId');
export const validateCommentId = validateObjectId('commentId');
export const validateMessageId = validateObjectId('messageId');
export const validateStoryId = validateObjectId('storyId');
export const validateRequestId = validateObjectId('requestId');
export const validateFriendId = validateObjectId('friendId');
