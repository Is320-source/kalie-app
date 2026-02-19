"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.voteOnPoll = exports.createPoll = exports.sharePost = exports.likeComment = exports.getPostComments = exports.createComment = exports.likePost = exports.getUserPosts = exports.getFeed = exports.createPost = void 0;
const database_1 = require("../config/database");
const validation_1 = require("../utils/validation");
const cloudinary_1 = require("../config/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
const createPost = async (req, res) => {
    try {
        const validatedData = validation_1.postSchema.parse(req.body);
        // Handle uploaded files with Cloudinary
        let imageUrl = null;
        let videoUrl = null;
        let imagePublicId = null;
        let videoPublicId = null;
        if (req.files) {
            // Upload image to Cloudinary
            if (req.files.image && req.files.image[0]) {
                const imageFile = req.files.image[0];
                const cloudinaryResult = await (0, cloudinary_1.uploadToCloudinary)(imageFile.path, 'posts', {
                    width: 1200,
                    quality: 'auto',
                    format: 'jpg'
                });
                imageUrl = cloudinaryResult.secureUrl;
                imagePublicId = cloudinaryResult.publicId;
                // Delete local file after upload
                await promises_1.default.unlink(imageFile.path).catch(console.error);
            }
            // Upload video to Cloudinary
            if (req.files.video && req.files.video[0]) {
                const videoFile = req.files.video[0];
                const cloudinaryResult = await (0, cloudinary_1.uploadVideoToCloudinary)(videoFile.path, 'posts', {
                    quality: 'auto',
                    format: 'mp4'
                });
                videoUrl = cloudinaryResult.secureUrl;
                videoPublicId = cloudinaryResult.publicId;
                // Delete local file after upload
                await promises_1.default.unlink(videoFile.path).catch(console.error);
            }
        }
        const post = await database_1.prisma.post.create({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar post'
        });
    }
};
exports.createPost = createPost;
const getFeed = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Get user's friends
        const friendships = await database_1.prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: req.user.id },
                    { friendId: req.user.id }
                ],
                status: 'accepted'
            }
        });
        const friendIds = friendships.map(f => f.userId === req.user.id ? f.friendId : f.userId);
        // Get posts
        const posts = await database_1.prisma.post.findMany({
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
            take: parseInt(limit)
        });
        const total = await database_1.prisma.post.count({
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
            message: 'Erro ao buscar feed'
        });
    }
};
exports.getFeed = getFeed;
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const posts = await database_1.prisma.post.findMany({
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
            take: parseInt(limit)
        });
        const total = await database_1.prisma.post.count({
            where: {
                authorId: userId
            }
        });
        res.json({
            success: true,
            data: {
                posts,
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
            message: 'Erro ao buscar posts do usuário'
        });
    }
};
exports.getUserPosts = getUserPosts;
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { type = 'like' } = req.body;
        // Verificar se o post existe
        const post = await database_1.prisma.post.findUnique({
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
        const existingLike = await database_1.prisma.postLike.findFirst({
            where: {
                userId: req.user.id,
                postId
            }
        });
        let liked = false;
        if (existingLike) {
            // Unlike if same type
            if (existingLike.type === type) {
                await database_1.prisma.postLike.delete({
                    where: { id: existingLike.id }
                });
                liked = false;
            }
            else {
                // Update like type
                await database_1.prisma.postLike.update({
                    where: { id: existingLike.id },
                    data: { type }
                });
                liked = true;
            }
        }
        else {
            // Create new like
            await database_1.prisma.postLike.create({
                data: {
                    userId: req.user.id,
                    postId,
                    type
                }
            });
            liked = true;
            // Create notification
            if (post.authorId !== req.user.id) {
                await database_1.prisma.notification.create({
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
        const likesCount = await database_1.prisma.postLike.count({
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
    }
    catch (error) {
        console.error('Erro ao curtir post:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao curtir post'
        });
    }
};
exports.likePost = likePost;
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const validatedData = validation_1.commentSchema.parse(req.body);
        const comment = await database_1.prisma.comment.create({
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
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (post && post.authorId !== req.user.id) {
            await database_1.prisma.notification.create({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar comentário'
        });
    }
};
exports.createComment = createComment;
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const comments = await database_1.prisma.comment.findMany({
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
            take: parseInt(limit)
        });
        const total = await database_1.prisma.comment.count({
            where: { postId }
        });
        res.json({
            success: true,
            data: {
                comments,
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
            message: 'Erro ao buscar comentários'
        });
    }
};
exports.getPostComments = getPostComments;
const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { type = 'like' } = req.body;
        // Verificar se o comentário existe
        const comment = await database_1.prisma.comment.findUnique({
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
        const existingLike = await database_1.prisma.commentLike.findFirst({
            where: {
                userId: req.user.id,
                commentId
            }
        });
        let liked = false;
        if (existingLike) {
            // Unlike if same type
            if (existingLike.type === type) {
                await database_1.prisma.commentLike.delete({
                    where: { id: existingLike.id }
                });
                liked = false;
            }
            else {
                // Update like type
                await database_1.prisma.commentLike.update({
                    where: { id: existingLike.id },
                    data: { type }
                });
                liked = true;
            }
        }
        else {
            // Create new like
            await database_1.prisma.commentLike.create({
                data: {
                    userId: req.user.id,
                    commentId,
                    type
                }
            });
            liked = true;
            // Create notification
            if (comment.authorId !== req.user.id) {
                await database_1.prisma.notification.create({
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
        const likesCount = await database_1.prisma.commentLike.count({
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
    }
    catch (error) {
        console.error('Erro ao curtir comentário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao curtir comentário'
        });
    }
};
exports.likeComment = likeComment;
const sharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        // Check if already shared
        const existingShare = await database_1.prisma.share.findFirst({
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
        const share = await database_1.prisma.share.create({
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
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (post && post.authorId !== req.user.id) {
            await database_1.prisma.notification.create({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao compartilhar post'
        });
    }
};
exports.sharePost = sharePost;
// Create Poll Post
const createPoll = async (req, res) => {
    try {
        const { content, question, options, duration, allowMultiple, privacy = 'public' } = req.body;
        if (!question || !options || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Enquete precisa ter uma pergunta e pelo menos 2 opções'
            });
        }
        // Create poll options with empty votes array
        const pollOptions = options.map((text, index) => ({
            id: `opt_${Date.now()}_${index}`,
            text,
            votes: []
        }));
        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (duration || 24));
        const post = await database_1.prisma.post.create({
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
    }
    catch (error) {
        console.error('Erro ao criar enquete:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar enquete'
        });
    }
};
exports.createPoll = createPoll;
// Vote on Poll
const voteOnPoll = async (req, res) => {
    try {
        const { postId } = req.params;
        const { optionIds } = req.body; // Array of option IDs
        if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Selecione pelo menos uma opção'
            });
        }
        const post = await database_1.prisma.post.findUnique({
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
        const pollOptions = post.pollOptions;
        const userId = req.user.id;
        // Remove user's previous votes
        pollOptions.forEach(option => {
            option.votes = option.votes.filter((id) => id !== userId);
        });
        // Add new votes
        optionIds.forEach(optionId => {
            const option = pollOptions.find(opt => opt.id === optionId);
            if (option) {
                option.votes.push(userId);
            }
        });
        // Update post with new votes
        const updatedPost = await database_1.prisma.post.update({
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
            await database_1.prisma.notification.create({
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
    }
    catch (error) {
        console.error('Erro ao votar na enquete:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar voto'
        });
    }
};
exports.voteOnPoll = voteOnPoll;
// Delete Post
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await database_1.prisma.post.findUnique({
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
        await database_1.prisma.post.delete({
            where: { id: postId }
        });
        res.json({
            success: true,
            message: 'Post deletado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao deletar post:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar post'
        });
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=post.controller.js.map