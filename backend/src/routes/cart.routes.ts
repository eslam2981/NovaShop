import express from 'express';
import { addItem, getCartItems, removeItem } from '../controllers/cart.controller';
import { protect } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = express.Router();

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
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

// All cart routes require authentication
router.use(protect);

router.post('/', validate(addToCartSchema), addItem);
router.get('/', getCartItems);
router.delete('/:itemId', removeItem);

export default router;
