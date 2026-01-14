import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      toUserId: req.user.id
    };

    if (unread === 'true') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
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
      take: parseInt(limit as string)
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { toUserId: req.user.id, read: false }
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações'
    });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
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

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificação como lida'
    });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    await prisma.notification.updateMany({
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificações como lidas'
    });
  }
};

export const deleteNotification = async (req: any, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
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

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({
      success: true,
      message: 'Notificação excluída'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir notificação'
    });
  }
};

export const deleteAllNotifications = async (req: any, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { toUserId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Todas as notificações excluídas'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir notificações'
    });
  }
};