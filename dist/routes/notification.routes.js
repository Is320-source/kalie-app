"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Notifications list (specific route FIRST)
router.get('/', notification_controller_1.getNotifications);
// Bulk operations (specific routes FIRST)
router.put('/read-all', notification_controller_1.markAllAsRead);
router.delete('/', notification_controller_1.deleteAllNotifications);
// Individual notification operations (with ObjectId validation)
router.put('/:notificationId/read', (0, validation_middleware_1.validateObjectId)('notificationId'), notification_controller_1.markAsRead);
router.delete('/:notificationId', (0, validation_middleware_1.validateObjectId)('notificationId'), notification_controller_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map