import { Response } from 'express';
import { prisma } from '../config/database';
import { postSchema, commentSchema } from '../utils/validation';
import { uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import fs from 'fs/promises';

export const createPost = async (req: any, res: Response) => {
  try {
    const validatedData = postSchema.parse(req.body);

    // Handle uploaded files with Cloudinary
    let imageUrl = null;
    let videoUrl = null;
    let imagePublicId = null;
    let videoPublicId = null;
    
    if (req.files) {
      // Upload image to Cloudinary
      if (req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        const cloudinaryResult = await uploadToCloudinary(
          imageFile.path,
          'posts',
          {
            width: 1200,
            quality: 'auto',
            format: 'jpg'
          }
        );
        imageUrl = cloudinaryResult.secureUrl;
        imagePublicId = cloudinaryResult.publicId;
        
        // Delete local file after upload
        await fs.unlink(imageFile.path).catch(console.error);
      }
      
      // Upload video to Cloudinary
      if (req.files.video && req.files.video[0]) {
        const videoFile = req.files.video[0];
        const cloudinaryResult = await uploadVideoToCloudinary(
          videoFile.path,
          'posts',
          {
            quality: 'auto',
            format: 'mp4'
          }
        );
        videoUrl = cloudinaryResult.secureUrl;
        videoPublicId = cloudinaryResult.publicId;
        
        // Delete local file after upload
        await fs.unlink(videoFile.path).catch(console.error);
      }
    }

    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        image: imageUrl,
        video: videoUrl,
        location: validatedData.location,
        feeling: validatedData.feeling,
        privacy: validatedData.privacy,
        hashtags: validatedData.hashtags || [],
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            type: true
          }
        },
        comments: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            likes: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                type: true
              }
            }
          }
        },
        shares: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar post'
    });
  }
};

export const getFeed = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get user's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { friendId: req.user.id }
        ],
        status: 'accepted'
      }
    });

    const friendIds = friendships.map(f => 
      f.userId === req.user.id ? f.friendId : f.userId
    );

    // Get posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: req.user.id },
          { privacy: 'public' },
          {
            AND: [
              { privacy: 'friends' },
              { authorId: { in: friendIds } }
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            type: true
          }
        },
        comments: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            likes: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                type: true
              }
            }
          }
        },
        shares: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.post.count({
      where: {
        OR: [
          { authorId: req.user.id },
          { privacy: 'public' },
          {
            AND: [
              { privacy: 'friends' },
              { authorId: { in: friendIds } }
            ]
          }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        posts,
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
      message: 'Erro ao buscar feed'
    });
  }
};

export const getUserPosts = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            type: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        comments: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        shares: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.post.count({
      where: {
        authorId: userId
      }
    });

    res.json({
      success: true,
      data: {
        posts,
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
      message: 'Erro ao buscar posts do usuário'
    });
  }
};

export const likePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { type = 'like' } = req.body;

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findFirst({
      where: {
        userId: req.user.id,
        postId
      }
    });

    let liked = false;

    if (existingLike) {
      // Unlike if same type
      if (existingLike.type === type) {
        await prisma.postLike.delete({
          where: { id: existingLike.id }
        });
        liked = false;
      } else {
        // Update like type
        await prisma.postLike.update({
          where: { id: existingLike.id },
          data: { type }
        });
        liked = true;
      }
    } else {
      // Create new like
      await prisma.postLike.create({
        data: {
          userId: req.user.id,
          postId,
          type
        }
      });
      liked = true;

      // Create notification
      if (post.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            type: 'like',
            message: `${req.user.firstName} curtiu seu post`,
            fromUserId: req.user.id,
            toUserId: post.authorId,
            postId
          }
        });
      }
    }

    // Get updated like count
    const likesCount = await prisma.postLike.count({
      where: { postId }
    });

    res.json({
      success: true,
      data: {
        liked,
        likes: likesCount,
        type: liked ? type : null
      }
    });
  } catch (error: any) {
    console.error('Erro ao curtir post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao curtir post'
    });
  }
};

export const createComment = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const validatedData = commentSchema.parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        authorId: req.user.id,
        postId
      },
      include: {
        author: {
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
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (post && post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          message: `${req.user.firstName} comentou no seu post`,
          fromUserId: req.user.id,
          toUserId: post.authorId,
          postId,
          commentId: comment.id
        }
      });
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar comentário'
    });
  }
};

export const getPostComments = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        likes: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.comment.count({
      where: { postId }
    });

    res.json({
      success: true,
      data: {
        comments,
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
      message: 'Erro ao buscar comentários'
    });
  }
};

export const likeComment = async (req: any, res: Response) => {
  try {
    const { commentId } = req.params;
    const { type = 'like' } = req.body;

    // Verificar se o comentário existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, postId: true }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado'
      });
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        userId: req.user.id,
        commentId
      }
    });

    let liked = false;

    if (existingLike) {
      // Unlike if same type
      if (existingLike.type === type) {
        await prisma.commentLike.delete({
          where: { id: existingLike.id }
        });
        liked = false;
      } else {
        // Update like type
        await prisma.commentLike.update({
          where: { id: existingLike.id },
          data: { type }
        });
        liked = true;
      }
    } else {
      // Create new like
      await prisma.commentLike.create({
        data: {
          userId: req.user.id,
          commentId,
          type
        }
      });
      liked = true;

      // Create notification
      if (comment.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            type: 'like',
            message: `${req.user.firstName} curtiu seu comentário`,
            fromUserId: req.user.id,
            toUserId: comment.authorId,
            postId: comment.postId,
            commentId
          }
        });
      }
    }

    // Get updated like count
    const likesCount = await prisma.commentLike.count({
      where: { commentId }
    });

    res.json({
      success: true,
      data: {
        liked,
        likes: likesCount,
        type: liked ? type : null
      }
    });
  } catch (error: any) {
    console.error('Erro ao curtir comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao curtir comentário'
    });
  }
};

export const sharePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;

    // Check if already shared
    const existingShare = await prisma.share.findFirst({
      where: {
        userId: req.user.id,
        postId
      }
    });

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'Você já compartilhou este post'
      });
    }

    const share = await prisma.share.create({
      data: {
        userId: req.user.id,
        postId
      },
      include: {
        user: {
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
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (post && post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: 'share',
          message: `${req.user.firstName} compartilhou seu post`,
          fromUserId: req.user.id,
          toUserId: post.authorId,
          postId
        }
      });
    }

    res.status(201).json({
      success: true,
      data: share
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao compartilhar post'
    });
  }
};


// Create Poll Post
export const createPoll = async (req: any, res: Response) => {
  try {
    const { content, question, options, duration, allowMultiple, privacy = 'public' } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Enquete precisa ter uma pergunta e pelo menos 2 opções'
      });
    }

    // Create poll options with empty votes array
    const pollOptions = options.map((text: string, index: number) => ({
      id: `opt_${Date.now()}_${index}`,
      text,
      votes: []
    }));

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (duration || 24));

    const post = await prisma.post.create({
      data: {
        type: 'poll',
        content: content || question,
        pollQuestion: question,
        pollOptions: pollOptions,
        pollDuration: expiresAt,
        pollMultiple: allowMultiple || false,
        privacy,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('Erro ao criar enquete:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao criar enquete'
    });
  }
};

// Vote on Poll
export const voteOnPoll = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;
    const { optionIds } = req.body; // Array of option IDs

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selecione pelo menos uma opção'
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        type: true,
        pollOptions: true,
        pollMultiple: true,
        pollDuration: true,
        authorId: true
      }
    });

    if (!post || post.type !== 'poll') {
      return res.status(404).json({
        success: false,
        message: 'Enquete não encontrada'
      });
    }

    // Check if poll is expired
    if (post.pollDuration && new Date() > new Date(post.pollDuration)) {
      return res.status(400).json({
        success: false,
        message: 'Esta enquete já foi encerrada'
      });
    }

    // Check if multiple votes allowed
    if (!post.pollMultiple && optionIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Esta enquete permite apenas uma escolha'
      });
    }

    const pollOptions = post.pollOptions as any[];
    const userId = req.user.id;

    // Remove user's previous votes
    pollOptions.forEach(option => {
      option.votes = option.votes.filter((id: string) => id !== userId);
    });

    // Add new votes
    optionIds.forEach(optionId => {
      const option = pollOptions.find(opt => opt.id === optionId);
      if (option) {
        option.votes.push(userId);
      }
    });

    // Update post with new votes
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        pollOptions: pollOptions
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Create notification for poll author
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'poll_vote',
          message: `${req.user.firstName} votou na sua enquete`,
          fromUserId: userId,
          toUserId: post.authorId,
          postId
        }
      });
    }

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error: any) {
    console.error('Erro ao votar na enquete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar voto'
    });
  }
};

// Delete Post
export const deletePost = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este post'
      });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({
      success: true,
      message: 'Post deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar post'
    });
  }
};
