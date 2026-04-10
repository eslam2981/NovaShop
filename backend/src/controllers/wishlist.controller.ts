import { Request, Response, NextFunction } from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../services/wishlist.service';
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
    const { productId } = req.body;
    const wishlist = await addToWishlist(userId, productId);
    res.status(200).json({ status: 'success', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const wishlist = await getWishlist(userId);
    res.status(200).json({ status: 'success', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const wishlist = await removeFromWishlist(userId, safeParam(req.params.productId));
    res.status(200).json({ status: 'success', data: { wishlist } });
  } catch (error) {
    next(error);
  }
};
