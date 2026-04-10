import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = express.Router();

const categorySchema = z.object({
  name: z.string().min(2),
});

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
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
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, restrictTo('ADMIN', 'OWNER'), validate(categorySchema), createCategory);
router.patch('/:id', protect, restrictTo('ADMIN', 'OWNER'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, restrictTo('ADMIN', 'OWNER'), deleteCategory);

export default router;

