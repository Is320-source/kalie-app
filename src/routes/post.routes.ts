import { Router } from 'express';
import { 
  createPost, 
  getFeed,
  getUserPosts,
  likePost, 
  createComment,
  getPostComments,
  likeComment,
  sharePost,
  createPoll,
  voteOnPoll,
  deletePost
} from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validatePostId, validateObjectId } from '../middleware/validation.middleware';
import { upload } from '../utils/upload';

const router = Router();

router.use(authMiddleware);

// Feed route (specific route FIRST)
router.get('/feed', getFeed);

// User posts route
router.get('/user/:userId', getUserPosts);

// Post creation
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), createPost);

// Poll creation
router.post('/poll', createPoll);

// Post interactions (with ObjectId validation)
router.post('/:postId/like', validatePostId, likePost);
router.post('/:postId/comment', validatePostId, createComment);
router.get('/:postId/comments', validatePostId, getPostComments);
router.post('/:postId/share', validatePostId, sharePost);
router.post('/:postId/vote', validatePostId, voteOnPoll);
router.delete('/:postId', validatePostId, deletePost);

// Comment interactions (with ObjectId validation)
router.post('/comments/:commentId/like', validateObjectId('commentId'), likeComment);

export default router;