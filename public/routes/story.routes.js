"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_1 = require("../utils/upload");
const story_controller_1 = require("../controllers/story.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Stories list (specific route FIRST)
router.get('/', story_controller_1.getStories);
// Story creation
router.post('/', upload_1.upload.single('media'), story_controller_1.createStory);
// Story operations (with ObjectId validation)
router.post('/:storyId/view', validation_middleware_1.validateStoryId, story_controller_1.viewStory);
router.get('/:storyId/viewers', validation_middleware_1.validateStoryId, story_controller_1.getStoryViewers);
router.delete('/:storyId', validation_middleware_1.validateStoryId, story_controller_1.deleteStory);
exports.default = router;
//# sourceMappingURL=story.routes.js.map