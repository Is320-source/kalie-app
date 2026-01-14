import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateUserId, validateRequestId, validateFriendId } from '../middleware/validation.middleware';
import { upload } from '../utils/upload';
import {
  getProfile,
  updateProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests
} from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware);

// Profile routes (specific routes FIRST)
router.get('/me', getProfile);
router.put(
  '/profile',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  updateProfile
);

// Search routes (specific routes FIRST)
router.get('/search/users', searchUsers);

// Friends routes (specific routes FIRST)
router.get('/friends', getFriends);
router.get('/friends/requests', getFriendRequests);
router.post('/friend-requests/:requestId/accept', validateRequestId, acceptFriendRequest);
router.post('/friend-requests/:requestId/reject', validateRequestId, rejectFriendRequest);
router.delete('/friends/:friendId', validateFriendId, removeFriend);

// Friend request routes (specific routes FIRST)
router.post('/:userId/friend-request', validateUserId, sendFriendRequest);
router.get('/:userId/friends', validateUserId, getFriends);

// Generic profile route (MUST BE LAST)
router.get('/:userId', validateUserId, getProfile);

export default router;