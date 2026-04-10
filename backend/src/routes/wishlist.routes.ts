import express from 'express';
import { addItem, getItems, removeItem } from '../controllers/wishlist.controller';
import { protect } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = express.Router();

const addToWishlistSchema = z.object({
  productId: z.string().uuid(),
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

// All wishlist routes require authentication
router.use(protect);

router.post('/', validate(addToWishlistSchema), addItem);
router.get('/', getItems);
router.delete('/:productId', removeItem);

export default router;
