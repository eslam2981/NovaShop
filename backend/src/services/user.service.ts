import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import bcrypt from 'bcryptjs';

export const getUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((user) => ({
    ...user,
    orderCount: user._count.orders,
  }));
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const ALLOWED_ROLES = ['USER', 'ADMIN'] as const;

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const role = data.role === 'ADMIN' ? 'ADMIN' : 'USER';
  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUser = async (id: string, data: { name?: string; email?: string; role?: string; password?: string }) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email already in use', 400);
    }
    updateData.email = data.email;
  }
  if (data.role !== undefined) {
    if (!ALLOWED_ROLES.includes(data.role as (typeof ALLOWED_ROLES)[number])) {
      throw new AppError('Invalid role', 400);
    }
    updateData.role = data.role;
  }
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Don't allow deleting yourself
  // This check should be done in controller using req.user.id

  await prisma.user.delete({
    where: { id },
  });
};

