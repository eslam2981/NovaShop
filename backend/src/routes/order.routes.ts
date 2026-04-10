import express from 'express';
import { getMyOrders, getOrder, getAll, updateStatus, createOrder } from '../controllers/order.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// User routes - require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);

// Admin routes must be registered before `/:id` so paths like `/admin/all` are not captured as an id
router.get('/admin/all', restrictTo('ADMIN'), getAll);
router.patch('/admin/:id/status', restrictTo('ADMIN'), updateStatus);

router.get('/:id', getOrder);

export default router;
