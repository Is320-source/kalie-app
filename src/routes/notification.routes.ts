import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateObjectId } from '../middleware/validation.middleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notification.controller';

const router = Router();

router.use(authMiddleware);

// Notifications list (specific route FIRST)
router.get('/', getNotifications);

// Bulk operations (specific routes FIRST)
router.put('/read-all', markAllAsRead);
router.delete('/', deleteAllNotifications);

// Individual notification operations (with ObjectId validation)
router.put('/:notificationId/read', validateObjectId('notificationId'), markAsRead);
router.delete('/:notificationId', validateObjectId('notificationId'), deleteNotification);

export default router;