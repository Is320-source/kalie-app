import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { messageSchema } from '../utils/validation';
import { uploadToCloudinary } from '../config/cloudinary';
import fs from 'fs/promises';
import { io } from '../app';

export const getConversations = async (req: any, res: Response) => {
  try {
    // Get all unique users the current user has messaged with
    const messages = await prisma.message.findMany({
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
        const unreadCount = messages.filter(m => 
          m.receiverId === req.user.id && 
          m.senderId === otherUser.id && 
          !m.read
        ).length;
        
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar conversas'
    });
  }
};

export const getMessages = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: req.user.id,
        read: false
      },
      data: { read: true }
    });

    const messages = await prisma.message.findMany({
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
      take: parseInt(limit as string)
    });

    const total = await prisma.message.count({
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
      message: 'Erro ao buscar mensagens'
    });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const validatedData = messageSchema.parse(req.body);

    // Handle uploaded image with Cloudinary
    let imageUrl = null;
    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      const cloudinaryResult = await uploadToCloudinary(
        imageFile.path,
        'messages',
        {
          width: 800,
          quality: 'auto',
          format: 'jpg'
        }
      );
      imageUrl = cloudinaryResult.secureUrl;
      
      // Delete local file after upload
      await fs.unlink(imageFile.path).catch(console.error);
    }

    const message = await prisma.message.create({
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
    await prisma.notification.create({
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
    io.emit('new-message', message);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao enviar mensagem'
    });
  }
};

export const deleteMessage = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
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

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Mensagem excluída'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir mensagem'
    });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
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

    await prisma.message.update({
      where: { id: messageId },
      data: { read: true }
    });

    res.json({
      success: true,
      message: 'Mensagem marcada como lida'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar mensagem como lida'
    });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    await prisma.message.updateMany({
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar mensagens como lidas'
    });
  }
};

export const getUnreadCount = async (req: any, res: Response) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        read: false
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao contar mensagens não lidas'
    });
  }
};