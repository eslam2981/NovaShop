import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';
import { sendEmail, generatePasswordResetEmail } from '../utils/email';

export const registerUser = async (data: any) => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('This email is already in use', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  let user: any = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.password) {
    throw new AppError('This account is registered via Google. Please use the "Continue with Google" button.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Enforce OWNER role for specific email
  if (user.email === 'eslamgamil214@gmail.com' && user.role !== 'OWNER') {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'OWNER' }
    }) as any;
  }

  const accessToken = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const authenticateWithGoogle = async (token: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json() as { email: string, name?: string, sub: string };

    if (!data || !data.email) {
      throw new AppError('Invalid Google token', 401);
    }

    const email = data.email;
    const name = data.name || 'Google User';
    const googleId = data.sub;

    let user: any = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Register user
      user = await prisma.user.create({
        data: {
          email,
          name,
          authProvider: 'GOOGLE',
          googleId,
        },
      });
    } else if (!user.googleId) {
      // Link existing standard account to Google
      user = await prisma.user.update({
        where: { email },
        data: { googleId, authProvider: 'GOOGLE' },
      });
    }

    // Enforce OWNER role for specific email
    if (user.email === 'eslamgamil214@gmail.com' && user.role !== 'OWNER') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'OWNER' }
      }) as any;
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  } catch (error) {
    throw new AppError('Failed to verify Google token', 401);
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('No user found with this email', 404);
  }

  if (user.authProvider !== 'LOCAL') {
    throw new AppError('This email is registered via Google. You cannot reset its password here.', 400);
  }

  // Always generate a 6 digit code for OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

  await prisma.user.update({
    where: { email },
    data: { resetCode: code, resetCodeExpiry: expiry } as any // Type cast if prisma client isn't fully synced
  });

  const emailHtml = generatePasswordResetEmail(user.name, code);
  await sendEmail(email, 'Your Password Reset Code', emailHtml);
  return { message: 'Reset code sent to email' };
};

export const verifyResetCode = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } }) as any;

  if (!user || user.resetCode !== code || !user.resetCodeExpiry) {
    throw new AppError('Invalid or expired reset code', 400);
  }

  if (new Date() > new Date(user.resetCodeExpiry)) {
    throw new AppError('Invalid or expired reset code', 400);
  }

  return { message: 'Code is valid' };
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } }) as any;

  if (!user || user.resetCode !== code || !user.resetCodeExpiry || new Date() > new Date(user.resetCodeExpiry)) {
    throw new AppError('Invalid or expired reset code', 400);
  }

  // Prevent using the same password
  if (user.password) {
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError('New password must be different from your current password', 400);
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpiry: null
    } as any
  });

  return { message: 'Password has been reset successfully' };
};
