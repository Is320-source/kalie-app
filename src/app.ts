import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import indexRoutes from './routes/index.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import storyRoutes from './routes/story.routes';
import passwordRoutes from './routes/password.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';

// Import database
import { prisma } from './config/database';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true
  },
  pingTimeout: 60000
});

// Store online users
const onlineUsers = new Map<string, string>();

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User connects
  socket.on('user-connected', async (userId: string) => {
    onlineUsers.set(userId, socket.id);
    
    // Update user status in database
    await prisma.user.update({
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
  socket.on('send-message', async (data: any) => {
    try {
      const message = await prisma.message.create({
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
      await prisma.notification.create({
        data: {
          type: 'message',
          message: 'Nova mensagem',
          fromUserId: data.senderId,
          toUserId: data.receiverId
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // User typing
  socket.on('user-typing', async (data: { userId: string, receiverId: string, isTyping: boolean }) => {
    try {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping
        });
      }
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });
  socket.on('disconnect', async () => {
    const userId = Array.from(onlineUsers.entries())
      .find(([_, socketId]) => socketId === socket.id)?.[0];
    
    if (userId) {
      onlineUsers.delete(userId);
      
      // Update user status
      await prisma.user.update({
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
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/password', passwordRoutes);

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
app.use(errorHandler);

// Export app and server
export { app, httpServer, io };