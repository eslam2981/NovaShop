import { Router } from 'express';
import { getStats } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('ADMIN', 'OWNER'));

// Admin statistics endpoint
router.get('/stats', getStats);

export default router;
