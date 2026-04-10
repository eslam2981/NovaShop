import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';

export const registerUser = async (data: any) => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('هذا البريد الإلكتروني مستخدم بالفعل', 400);
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

  const user = await prisma.user.findUnique({ where: { email } });
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
    const data = await response.json();
    
    if (!data || !data.email) {
      throw new AppError('Invalid Google token', 401);
    }

    const email = data.email;
    const name = data.name || 'Google User';
    const googleId = data.sub;

  let user = await prisma.user.findUnique({ where: { email } });

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
