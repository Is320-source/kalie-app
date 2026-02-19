"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Feed route (specific route FIRST)
router.get('/feed', post_controller_1.getFeed);
// User posts route
router.get('/user/:userId', post_controller_1.getUserPosts);
// Post creation
router.post('/', upload_1.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), post_controller_1.createPost);
// Poll creation
router.post('/poll', post_controller_1.createPoll);
// Post interactions (with ObjectId validation)
router.post('/:postId/like', validation_middleware_1.validatePostId, post_controller_1.likePost);
router.post('/:postId/comment', validation_middleware_1.validatePostId, post_controller_1.createComment);
router.get('/:postId/comments', validation_middleware_1.validatePostId, post_controller_1.getPostComments);
router.post('/:postId/share', validation_middleware_1.validatePostId, post_controller_1.sharePost);
router.post('/:postId/vote', validation_middleware_1.validatePostId, post_controller_1.voteOnPoll);
router.delete('/:postId', validation_middleware_1.validatePostId, post_controller_1.deletePost);
// Comment interactions (with ObjectId validation)
router.post('/comments/:commentId/like', (0, validation_middleware_1.validateObjectId)('commentId'), post_controller_1.likeComment);
exports.default = router;
//# sourceMappingURL=post.routes.js.map