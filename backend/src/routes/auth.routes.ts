import express from 'express';
import { register, login, logout, googleLogin, forgotPassword, verifyResetCode, resetPassword } from '../controllers/auth.controller';
import { z } from 'zod';

const router = express.Router();

// Validation schemas (can be moved to separate file)
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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

const googleSchema = z.object({
  credential: z.string(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleSchema), googleLogin);
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;
