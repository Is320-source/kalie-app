"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.deleteMessage = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const database_1 = require("../config/database");
const validation_1 = require("../utils/validation");
const cloudinary_1 = require("../config/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
const app_1 = require("../app");
const getConversations = async (req, res) => {
    try {
        // Get all unique users the current user has messaged with
        const messages = await database_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        isOnline: true,
                        lastSeen: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        isOnline: true,
                        lastSeen: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Group conversations by user
        const conversationsMap = new Map();
        messages.forEach(message => {
            const otherUser = message.senderId === req.user.id
                ? message.receiver
                : message.sender;
            const conversationId = `conversation_${otherUser.id}`;
            if (!conversationsMap.has(conversationId)) {
                // Count unread messages
                const unreadCount = messages.filter(m => m.receiverId === req.user.id &&
                    m.senderId === otherUser.id &&
                    !m.read).length;
                conversationsMap.set(conversationId, {
                    id: conversationId,
                    participants: [req.user, otherUser],
                    lastMessage: message,
                    unreadCount,
                    updatedAt: message.createdAt
                });
            }
        });
        const conversations = Array.from(conversationsMap.values())
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        res.json({
            success: true,
            data: {
                conversations: conversations
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar conversas'
        });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Mark messages as read
        await database_1.prisma.message.updateMany({
            where: {
                senderId: userId,
                receiverId: req.user.id,
                read: false
            },
            data: { read: true }
        });
        const messages = await database_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id, receiverId: userId },
                    { senderId: userId, receiverId: req.user.id }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        });
        const total = await database_1.prisma.message.count({
            where: {
                OR: [
                    { senderId: req.user.id, receiverId: userId },
                    { senderId: userId, receiverId: req.user.id }
                ]
            }
        });
        // Reverse to show oldest first
        messages.reverse();
        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar mensagens'
        });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const validatedData = validation_1.messageSchema.parse(req.body);
        // Handle uploaded image with Cloudinary
        let imageUrl = null;
        if (req.files && req.files.image && req.files.image[0]) {
            const imageFile = req.files.image[0];
            const cloudinaryResult = await (0, cloudinary_1.uploadToCloudinary)(imageFile.path, 'messages', {
                width: 800,
                quality: 'auto',
                format: 'jpg'
            });
            imageUrl = cloudinaryResult.secureUrl;
            // Delete local file after upload
            await promises_1.default.unlink(imageFile.path).catch(console.error);
        }
        const message = await database_1.prisma.message.create({
            data: {
                content: validatedData.content || '',
                image: imageUrl,
                senderId: req.user.id,
                receiverId: validatedData.receiverId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });
        // Create notification
        await database_1.prisma.notification.create({
            data: {
                type: 'message',
                message: imageUrl
                    ? `${req.user.firstName} enviou uma imagem`
                    : `${req.user.firstName} enviou uma mensagem`,
                fromUserId: req.user.id,
                toUserId: validatedData.receiverId
            }
        });
        // Send via Socket.IO to receiver in real-time
        app_1.io.emit('new-message', message);
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao enviar mensagem'
        });
    }
};
exports.sendMessage = sendMessage;
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await database_1.prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }
        if (message.senderId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para excluir esta mensagem'
            });
        }
        await database_1.prisma.message.delete({
            where: { id: messageId }
        });
        res.json({
            success: true,
            message: 'Mensagem excluída'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir mensagem'
        });
    }
};
exports.deleteMessage = deleteMessage;
const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await database_1.prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensagem não encontrada'
            });
        }
        if (message.receiverId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Você não pode marcar esta mensagem como lida'
            });
        }
        await database_1.prisma.message.update({
            where: { id: messageId },
            data: { read: true }
        });
        res.json({
            success: true,
            message: 'Mensagem marcada como lida'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar mensagem como lida'
        });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await database_1.prisma.message.updateMany({
            where: {
                senderId: userId,
                receiverId: req.user.id,
                read: false
            },
            data: { read: true }
        });
        res.json({
            success: true,
            message: 'Todas as mensagens marcadas como lidas'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar mensagens como lidas'
        });
    }
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (req, res) => {
    try {
        const count = await database_1.prisma.message.count({
            where: {
                receiverId: req.user.id,
                read: false
            }
        });
        res.json({
            success: true,
            data: { count }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao contar mensagens não lidas'
        });
    }
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=message.controller.js.map