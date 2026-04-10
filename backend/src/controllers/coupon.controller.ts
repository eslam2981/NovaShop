import { Request, Response, NextFunction } from 'express';
import * as couponService from '../services/coupon.service';
import { safeParam } from '../utils/safeParam';

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ status: 'success', data: { coupon } });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await couponService.getCoupons();
    res.status(200).json({ status: 'success', data: { coupons } });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await couponService.deleteCoupon(safeParam(req.params.id));
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await couponService.toggleCouponStatus(safeParam(req.params.id));
    res.status(200).json({ status: 'success', data: { coupon } });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, total } = req.body;
    const result = await couponService.validateCoupon(code, total);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
