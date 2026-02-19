"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_1 = require("../utils/upload");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Profile routes (specific routes FIRST)
router.get('/me', user_controller_1.getProfile);
router.put('/profile', upload_1.upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]), user_controller_1.updateProfile);
// Search routes (specific routes FIRST)
router.get('/search/users', user_controller_1.searchUsers);
// Friends routes (specific routes FIRST)
router.get('/friends', user_controller_1.getFriends);
router.get('/friends/requests', user_controller_1.getFriendRequests);
router.post('/friend-requests/:requestId/accept', validation_middleware_1.validateRequestId, user_controller_1.acceptFriendRequest);
router.post('/friend-requests/:requestId/reject', validation_middleware_1.validateRequestId, user_controller_1.rejectFriendRequest);
router.delete('/friends/:friendId', validation_middleware_1.validateFriendId, user_controller_1.removeFriend);
// Friend request routes (specific routes FIRST)
router.post('/:userId/friend-request', validation_middleware_1.validateUserId, user_controller_1.sendFriendRequest);
router.get('/:userId/friends', validation_middleware_1.validateUserId, user_controller_1.getFriends);
// Generic profile route (MUST BE LAST)
router.get('/:userId', validation_middleware_1.validateUserId, user_controller_1.getProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map