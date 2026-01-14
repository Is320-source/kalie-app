import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateUserId, validateMessageId } from '../middleware/validation.middleware';
import { upload } from '../utils/upload';
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/message.controller';

const router = Router();

router.use(authMiddleware);

// Conversations route (specific route FIRST)
router.get('/conversations', getConversations);

// Unread count
router.get('/unread-count', getUnreadCount);

// Message operations
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), sendMessage);

// User-specific message routes (with ObjectId validation)
router.get('/:userId', validateUserId, getMessages);
router.put('/:userId/read-all', validateUserId, markAllAsRead);

// Message-specific routes (with ObjectId validation)
router.put('/:messageId/read', validateMessageId, markAsRead);
router.delete('/:messageId', validateMessageId, deleteMessage);

export default router;