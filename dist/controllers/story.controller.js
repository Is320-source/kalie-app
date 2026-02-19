"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoryViewers = exports.deleteStory = exports.viewStory = exports.getStories = exports.createStory = void 0;
const database_1 = require("../config/database");
const cloudinary_1 = require("../config/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
const createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Imagem ou vídeo é obrigatório'
            });
        }
        let imageUrl = null;
        let videoUrl = null;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Upload to Cloudinary based on file type
        if (req.file.mimetype.startsWith('image/')) {
            const cloudinaryResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.path, 'stories', {
                width: 1080,
                height: 1920,
                crop: 'limit',
                quality: 'auto',
                format: 'jpg'
            });
            imageUrl = cloudinaryResult.secureUrl;
        }
        else if (req.file.mimetype.startsWith('video/')) {
            const cloudinaryResult = await (0, cloudinary_1.uploadVideoToCloudinary)(req.file.path, 'stories', {
                quality: 'auto',
                format: 'mp4'
            });
            videoUrl = cloudinaryResult.secureUrl;
        }
        // Delete local file after upload
        await promises_1.default.unlink(req.file.path).catch(console.error);
        const story = await database_1.prisma.story.create({
            data: {
                image: imageUrl,
                video: videoUrl,
                authorId: req.user.id,
                expiresAt
            },
            include: {
                author: {
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
                        updatedAt: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: story
        });
    }
    catch (error) {
        console.error('Erro ao criar story:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar story'
        });
    }
};
exports.createStory = createStory;
const getStories = async (req, res) => {
    try {
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
        // Get stories from friends and user that haven't expired
        const stories = await database_1.prisma.story.findMany({
            where: {
                expiresAt: { gt: new Date() },
                OR: [
                    { authorId: req.user.id },
                    { authorId: { in: friendIds } }
                ]
            },
            include: {
                author: {
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
                        updatedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Group stories by author
        const storiesByAuthor = new Map();
        stories.forEach(story => {
            if (!storiesByAuthor.has(story.authorId)) {
                storiesByAuthor.set(story.authorId, {
                    author: story.author,
                    stories: [],
                    hasUnviewed: false
                });
            }
            const authorStories = storiesByAuthor.get(story.authorId);
            authorStories.stories.push(story);
            // Check if user has viewed this story
            const hasViewed = story.viewerIds.includes(req.user.id);
            if (!hasViewed) {
                authorStories.hasUnviewed = true;
            }
        });
        // Convert to array and sort
        const groupedStories = Array.from(storiesByAuthor.values())
            .sort((a, b) => {
            // Sort by unviewed first, then by most recent story
            if (a.hasUnviewed && !b.hasUnviewed)
                return -1;
            if (!a.hasUnviewed && b.hasUnviewed)
                return 1;
            const aLatest = a.stories[0].createdAt;
            const bLatest = b.stories[0].createdAt;
            return bLatest.getTime() - aLatest.getTime();
        });
        res.json({
            success: true,
            data: groupedStories
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar stories'
        });
    }
};
exports.getStories = getStories;
const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await database_1.prisma.story.findUnique({
            where: { id: storyId }
        });
        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story não encontrado'
            });
        }
        if (story.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Story expirado'
            });
        }
        if (story.authorId === req.user.id) {
            return res.json({
                success: true,
                message: 'Você é o autor deste story'
            });
        }
        // Check if already viewed
        if (story.viewerIds.includes(req.user.id)) {
            return res.json({
                success: true,
                message: 'Story já visualizado'
            });
        }
        // Add viewer to viewerIds array
        await database_1.prisma.story.update({
            where: { id: storyId },
            data: {
                viewerIds: {
                    push: req.user.id
                }
            }
        });
        // Create notification
        await database_1.prisma.notification.create({
            data: {
                type: 'story_view',
                message: `${req.user.firstName} visualizou seu story`,
                fromUserId: req.user.id,
                toUserId: story.authorId
            }
        });
        res.json({
            success: true,
            message: 'Story visualizado'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao visualizar story'
        });
    }
};
exports.viewStory = viewStory;
const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await database_1.prisma.story.findUnique({
            where: { id: storyId }
        });
        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story não encontrado'
            });
        }
        if (story.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para excluir este story'
            });
        }
        await database_1.prisma.story.delete({
            where: { id: storyId }
        });
        res.json({
            success: true,
            message: 'Story excluído'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir story'
        });
    }
};
exports.deleteStory = deleteStory;
const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await database_1.prisma.story.findUnique({
            where: { id: storyId }
        });
        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story não encontrado'
            });
        }
        if (story.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para ver os visualizadores'
            });
        }
        // Get viewers from viewerIds array
        const viewers = await database_1.prisma.user.findMany({
            where: {
                id: { in: story.viewerIds }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
            }
        });
        res.json({
            success: true,
            data: {
                viewers,
                total: viewers.length
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar visualizadores'
        });
    }
};
exports.getStoryViewers = getStoryViewers;
//# sourceMappingURL=story.controller.js.map