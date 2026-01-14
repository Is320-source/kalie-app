"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFriendId = exports.validateRequestId = exports.validateStoryId = exports.validateMessageId = exports.validateCommentId = exports.validatePostId = exports.validateUserId = exports.validateObjectId = void 0;
/**
 * Regex oficial para ObjectId do MongoDB (24 chars hex)
 */
const objectIdRegex = /^[a-f\d]{24}$/i;
/**
 * Middleware genérico para validar ObjectId do MongoDB
 * Previne erros P2023 do Prisma
 */
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
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
exports.validateObjectId = validateObjectId;
/* Middlewares específicos */
exports.validateUserId = (0, exports.validateObjectId)('userId');
exports.validatePostId = (0, exports.validateObjectId)('postId');
exports.validateCommentId = (0, exports.validateObjectId)('commentId');
exports.validateMessageId = (0, exports.validateObjectId)('messageId');
exports.validateStoryId = (0, exports.validateObjectId)('storyId');
exports.validateRequestId = (0, exports.validateObjectId)('requestId');
exports.validateFriendId = (0, exports.validateObjectId)('friendId');
//# sourceMappingURL=validation.middleware.js.map