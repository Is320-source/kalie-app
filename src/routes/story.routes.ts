import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateStoryId } from '../middleware/validation.middleware';
import { upload } from '../utils/upload';
import {
  createStory,
  getStories,
  viewStory,
  deleteStory,
  getStoryViewers
} from '../controllers/story.controller';

const router = Router();

router.use(authMiddleware);

// Stories list (specific route FIRST)
router.get('/', getStories);

// Story creation
router.post('/', upload.single('media'), createStory);

// Story operations (with ObjectId validation)
router.post('/:storyId/view', validateStoryId, viewStory);
router.get('/:storyId/viewers', validateStoryId, getStoryViewers);
router.delete('/:storyId', validateStoryId, deleteStory);

export default router;