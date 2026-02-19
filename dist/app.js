"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const story_routes_1 = __importDefault(require("./routes/story.routes"));
const password_routes_1 = __importDefault(require("./routes/password.routes"));
// Import middleware
const error_middleware_1 = require("./middleware/error.middleware");
// Import database
const database_1 = require("./config/database");
// Initialize express app
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Socket.IO configuration
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:8081',
        credentials: true
    },
    pingTimeout: 60000
});
exports.io = io;
// Store online users
const onlineUsers = new Map();
// Socket.IO events
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    // User connects
    socket.on('user-connected', async (userId) => {
        onlineUsers.set(userId, socket.id);
        // Update user status in database
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: true,
                lastSeen: new Date()
            }
        }).catch(console.error);
        // Notify other users
        socket.broadcast.emit('user-online', { userId });
    });
    // Send private message
    socket.on('send-message', async (data) => {
        try {
            const message = await database_1.prisma.message.create({
                data: {
                    content: data.content,
                    image: data.image,
                    senderId: data.senderId,
                    receiverId: data.receiverId
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            });
            // Send to receiver if online
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('new-message', message);
            }
            // Create notification
            await database_1.prisma.notification.create({
                data: {
                    type: 'message',
                    message: 'Nova mensagem',
                    fromUserId: data.senderId,
                    toUserId: data.receiverId
                }
            });
        }
        catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message-error', { error: 'Failed to send message' });
        }
    });
    // User typing
    socket.on('user-typing', async (data) => {
        try {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-typing', {
                    userId: data.userId,
                    isTyping: data.isTyping
                });
            }
        }
        catch (error) {
            console.error('Error handling typing:', error);
        }
    });
    socket.on('disconnect', async () => {
        const userId = Array.from(onlineUsers.entries())
            .find(([_, socketId]) => socketId === socket.id)?.[0];
        if (userId) {
            onlineUsers.delete(userId);
            // Update user status
            await database_1.prisma.user.update({
                where: { id: userId },
                data: {
                    isOnline: false,
                    lastSeen: new Date()
                }
            }).catch(console.error);
            // Notify other users
            socket.broadcast.emit('user-offline', { userId });
        }
        console.log('Client disconnected:', socket.id);
    });
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/', index_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/stories', story_routes_1.default);
app.use('/api/password', password_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
// Error handler
app.use(error_middleware_1.errorHandler);
//# sourceMappingURL=app.js.map