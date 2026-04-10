import { Request, Response, NextFunction } from 'express';
import { addToCart, getCart, removeFromCart } from '../services/cart.service';
import { safeParam } from '../utils/safeParam';

const getUserId = (req: Request) => {
  const user = (req as any).user;
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity } = req.body;
    const cart = await addToCart(userId, productId, quantity);
    res.status(200).json({ status: 'success', data: { cart } });
  } catch (error) {
    next(error);
  }
};

export const getCartItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const cart = await getCart(userId);
    res.status(200).json({ status: 'success', data: { cart } });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const cart = await removeFromCart(userId, safeParam(req.params.itemId));
    res.status(200).json({ status: 'success', data: { cart } });
  } catch (error) {
    next(error);
  }
};
