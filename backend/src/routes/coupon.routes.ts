import express from 'express';
import * as couponController from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Public route for validation
router.post('/validate', couponController.validateCoupon);

// Admin routes
router.use(protect);

// Admin & Owner can read and modify
router.get('/', restrictTo('ADMIN', 'OWNER'), couponController.getCoupons);
router.post('/', restrictTo('ADMIN', 'OWNER'), couponController.createCoupon);
router.patch('/:id/status', restrictTo('ADMIN', 'OWNER'), couponController.toggleStatus);

// Only Owner can delete
router.delete('/:id', restrictTo('OWNER'), couponController.deleteCoupon);

export default router;
