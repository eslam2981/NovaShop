import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { AppError } from '../middlewares/error.middleware';
import { safeParam } from '../utils/safeParam';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, email, and password are required',
      });
    }
    const user = await userService.createUser({ name, email, password, role });
    return res.status(201).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(safeParam(req.params.id));
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prevent admin from deleting themselves
    const currentUser = (req as any).user;
    const targetId = safeParam(req.params.id);
    if (targetId === currentUser.id && req.body.role && req.body.role !== currentUser.role) {
      return next(new AppError('You cannot change your own role', 400));
    }
    
    const user = await userService.updateUser(targetId, req.body);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prevent admin from deleting themselves
    const currentUser = (req as any).user;
    const targetId = safeParam(req.params.id);
    if (targetId === currentUser.id) {
      return next(new AppError('You cannot delete your own account', 400));
    }
    
    await userService.deleteUser(targetId);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

