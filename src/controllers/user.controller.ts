import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { updateProfileSchema } from '../utils/validation';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../config/cloudinary';
import fs from 'fs/promises';

export const getProfile = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
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
            friendshipsAsUser: true,
            friendshipsAsFriend: true
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

    // Get mutual friends if viewing another user's profile
    let mutualFriends = [];
    if (userId && userId !== req.user.id) {
      const userFriends = await prisma.friendship.findMany({
        where: { userId: targetUserId, status: 'accepted' },
        select: { friendId: true }
      });
      
      const myFriends = await prisma.friendship.findMany({
        where: { userId: req.user.id, status: 'accepted' },
        select: { friendId: true }
      });

      const userFriendIds = userFriends.map(f => f.friendId);
      const myFriendIds = myFriends.map(f => f.friendId);
      
      mutualFriends = userFriendIds.filter(id => myFriendIds.includes(id));
    }

    res.json({
      success: true,
      data: {
        ...user,
        mutualFriends: mutualFriends.length
      }
    });
  } catch (error: any) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil'
    });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    let updateData: any = {};
    
    // Only validate body data if there are text fields
    if (Object.keys(req.body).length > 0 && !req.files) {
      const validatedData = updateProfileSchema.parse(req.body);
      updateData = { ...validatedData };
    } else if (req.body.firstName || req.body.lastName || req.body.bio || req.body.gender || req.body.birthDate) {
      // Validate only if these fields exist
      const validatedData = updateProfileSchema.parse(req.body);
      updateData = { ...validatedData };
    }
    
    // Handle password update separately
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual é obrigatória para alterar a senha'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const validPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      updateData.password = await bcrypt.hash(req.body.password, 10);
    }
    
    // Handle file uploads with Cloudinary
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        const avatarFile = req.files.avatar[0];
        const cloudinaryResult = await uploadToCloudinary(
          avatarFile.path,
          'avatars',
          {
            width: 400,
            height: 400,
            crop: 'fill',
            quality: 'auto',
            format: 'jpg'
          }
        );
        updateData.avatar = cloudinaryResult.secureUrl;
        
        // Delete local file after upload
        await fs.unlink(avatarFile.path).catch(console.error);
      }
      
      if (req.files.coverPhoto && req.files.coverPhoto[0]) {
        const coverFile = req.files.coverPhoto[0];
        const cloudinaryResult = await uploadToCloudinary(
          coverFile.path,
          'covers',
          {
            width: 1500,
            height: 500,
            crop: 'fill',
            quality: 'auto',
            format: 'jpg'
          }
        );
        updateData.coverPhoto = cloudinaryResult.secureUrl;
        
        // Delete local file after upload
        await fs.unlink(coverFile.path).catch(console.error);
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum dado para atualizar'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
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
            friendshipsAsUser: true,
            friendshipsAsFriend: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: user
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao atualizar perfil'
    });
  }
};

export const searchUsers = async (req: any, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    /*if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Termo de busca deve ter pelo menos 2 caracteres'
      });
    }*/

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q as string, mode: 'insensitive' } },
          { lastName: { contains: q as string, mode: 'insensitive' } },
          { email: { contains: q as string, mode: 'insensitive' } }
        ],
        NOT: { id: req.user.id }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        _count: {
          select: {
            friendshipsAsUser: true,
            posts: true
          }
        }
      },
      skip,
      take: parseInt(limit as string),
      orderBy: [
        { isOnline: 'desc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { firstName: { contains: q as string, mode: 'insensitive' } },
          { lastName: { contains: q as string, mode: 'insensitive' } },
          { email: { contains: q as string, mode: 'insensitive' } }
        ],
        NOT: { id: req.user.id }
      }
    });

    res.json({
      success: true,
      data: {
        users,
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
      message: 'Erro ao buscar usuários'
    });
  }
};

export const sendFriendRequest = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode enviar solicitação para si mesmo'
      });
    }

    // Check if users exist
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: req.user.id, friendId: userId },
          { userId: userId, friendId: req.user.id }
        ]
      }
    });

    if (existingFriendship) {
      const message = existingFriendship.status === 'accepted' 
        ? 'Vocês já são amigos'
        : existingFriendship.status === 'pending'
          ? 'Solicitação já enviada'
          : 'Usuário bloqueado';
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        userId: req.user.id,
        friendId: userId,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        friend: {
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
        type: 'friend_request',
        message: `${req.user.firstName} enviou uma solicitação de amizade`,
        fromUserId: req.user.id,
        toUserId: userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Solicitação de amizade enviada',
      data: friendship
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar solicitação de amizade'
    });
  }
};

export const acceptFriendRequest = async (req: any, res: Response) => {
  try {
    const { requestId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        friend: true
      }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (friendship.friendId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para aceitar esta solicitação'
      });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitação já foi processada'
      });
    }

    // Accept friendship
    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    // Create reverse friendship for bidirectional relationship
    const reverseFriendship = await prisma.friendship.findFirst({
      where: {
        userId: req.user.id,
        friendId: friendship.userId
      }
    });

    if (!reverseFriendship) {
      await prisma.friendship.create({
        data: {
          userId: req.user.id,
          friendId: friendship.userId,
          status: 'accepted'
        }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'friend_request_accepted',
        message: `${req.user.firstName} aceitou sua solicitação de amizade`,
        fromUserId: req.user.id,
        toUserId: friendship.userId
      }
    });

    res.json({
      success: true,
      message: 'Solicitação de amizade aceita',
      data: friendship
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao aceitar solicitação'
    });
  }
};

export const rejectFriendRequest = async (req: any, res: Response) => {
  try {
    const { requestId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (friendship.friendId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para rejeitar esta solicitação'
      });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitação já foi processada'
      });
    }

    await prisma.friendship.delete({
      where: { id: requestId }
    });

    res.json({
      success: true,
      message: 'Solicitação de amizade rejeitada'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao rejeitar solicitação'
    });
  }
};

export const removeFriend = async (req: any, res: Response) => {
  try {
    const { friendId } = req.params;

    // Delete both directions of friendship
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: req.user.id, friendId: friendId },
          { userId: friendId, friendId: req.user.id }
        ]
      }
    });

    res.json({
      success: true,
      message: 'Amizade removida'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover amigo'
    });
  }
};

export const getFriends = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Buscar amizades onde o usuário é participante
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: targetUserId, status: 'accepted' },
          { friendId: targetUserId, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            isOnline: true,
            lastSeen: true
          }
        },
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            isOnline: true,
            lastSeen: true
          }
        }
      },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.friendship.count({
      where: {
        OR: [
          { userId: targetUserId, status: 'accepted' },
          { friendId: targetUserId, status: 'accepted' }
        ]
      }
    });

    // Extrair amigos (o outro usuário em cada amizade)
    const friends = friendships.map(f => 
      f.userId === targetUserId ? f.friend : f.user
    );

    res.json({
      success: true,
      data: friends,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    console.error('Erro detalhado ao buscar amigos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar amigos',
      error: error.message
    });
  }
};

export const getFriendRequests = async (req: any, res: Response) => {
  try {
    const { type = 'received' } = req.query; // 'received' or 'sent'
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = type === 'sent' 
      ? { userId: req.user.id, status: 'pending' }
      : { friendId: req.user.id, status: 'pending' };

    const requests = await prisma.friendship.findMany({
      where,
      include: type === 'sent'
        ? {
            friend: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        : {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
                isOnline: true,
                lastSeen: true
              }
            }
          },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.friendship.count({ where });

    res.json({
      success: true,
      data: {
        requests,
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
      message: 'Erro ao buscar solicitações de amizade'
    });
  }
};