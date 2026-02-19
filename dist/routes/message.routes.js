"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_1 = require("../utils/upload");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Conversations route (specific route FIRST)
router.get('/conversations', message_controller_1.getConversations);
// Unread count
router.get('/unread-count', message_controller_1.getUnreadCount);
// Message operations
router.post('/', upload_1.upload.fields([{ name: 'image', maxCount: 1 }]), message_controller_1.sendMessage);
// User-specific message routes (with ObjectId validation)
router.get('/:userId', validation_middleware_1.validateUserId, message_controller_1.getMessages);
router.put('/:userId/read-all', validation_middleware_1.validateUserId, message_controller_1.markAllAsRead);
// Message-specific routes (with ObjectId validation)
router.put('/:messageId/read', validation_middleware_1.validateMessageId, message_controller_1.markAsRead);
router.delete('/:messageId', validation_middleware_1.validateMessageId, message_controller_1.deleteMessage);
exports.default = router;
//# sourceMappingURL=message.routes.js.map