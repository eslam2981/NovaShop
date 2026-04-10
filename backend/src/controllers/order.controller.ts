import { Request, Response, NextFunction } from 'express';
import { getOrders, getOrderById, getAllOrders, updateOrderStatus, createOrder as createOrderService, deleteOrder } from '../services/order.service';
import { safeParam } from '../utils/safeParam';

const getUserId = (req: Request) => {
  const user = (req as any).user;
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { items, shippingAddress, paymentMethod, discount, couponCode } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Cart is empty' });
    }
    
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({ status: 'error', message: 'Shipping address is required' });
    }

    const order = await createOrderService(userId, items, shippingAddress, paymentMethod, discount, couponCode);
    return res.status(201).json({ status: 'success', data: { order } });
  } catch (error) {
    return next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const orders = await getOrders(userId);
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const order = await getOrderById(userId, safeParam(req.params.id));
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

// Admin
export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatus(safeParam(req.params.id), status);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error) {
    next(error);
  }
};

export const deleteOrderAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteOrder(safeParam(req.params.id));
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
