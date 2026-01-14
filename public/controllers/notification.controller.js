"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const database_1 = require("../config/database");
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unread = false } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            toUserId: req.user.id
        };
        if (unread === 'true') {
            where.read = false;
        }
        const notifications = await database_1.prisma.notification.findMany({
            where,
            include: {
                fromUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                        image: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        postId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        });
        const total = await database_1.prisma.notification.count({ where });
        const unreadCount = await database_1.prisma.notification.count({
            where: { toUserId: req.user.id, read: false }
        });
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
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
            message: 'Erro ao buscar notificações'
        });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await database_1.prisma.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada'
            });
        }
        if (notification.toUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para marcar esta notificação'
            });
        }
        await database_1.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        res.json({
            success: true,
            message: 'Notificação marcada como lida'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar notificação como lida'
        });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        await database_1.prisma.notification.updateMany({
            where: {
                toUserId: req.user.id,
                read: false
            },
            data: { read: true }
        });
        res.json({
            success: true,
            message: 'Todas as notificações marcadas como lidas'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar notificações como lidas'
        });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await database_1.prisma.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada'
            });
        }
        if (notification.toUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para excluir esta notificação'
            });
        }
        await database_1.prisma.notification.delete({
            where: { id: notificationId }
        });
        res.json({
            success: true,
            message: 'Notificação excluída'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir notificação'
        });
    }
};
exports.deleteNotification = deleteNotification;
const deleteAllNotifications = async (req, res) => {
    try {
        await database_1.prisma.notification.deleteMany({
            where: { toUserId: req.user.id }
        });
        res.json({
            success: true,
            message: 'Todas as notificações excluídas'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir notificações'
        });
    }
};
exports.deleteAllNotifications = deleteAllNotifications;
//# sourceMappingURL=notification.controller.js.map