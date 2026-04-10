import express from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = express.Router();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  salePrice: z.number().nullable().optional(),
  saleEndDate: z.string().nullable().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  salePrice: z.number().nullable().optional(),
  saleEndDate: z.string().nullable().optional(),
});

const validate = (schema: z.ZodSchema) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'fail', errors: (error as z.ZodError).issues });
    } else {
      next(error);
    }
  }
};

// Public routes
router.get('/', getAll);
router.get('/:id', getOne);

// Admin routes - require authentication and admin role
router.post('/', protect, restrictTo('ADMIN'), validate(productSchema), create);
router.patch('/:id', protect, restrictTo('ADMIN'), validate(updateProductSchema), update);
router.delete('/:id', protect, restrictTo('ADMIN'), remove);

export default router;
