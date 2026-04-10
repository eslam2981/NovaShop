import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const createOrder = async (
  userId: string, 
  items: any[], 
  shippingAddress: any,
  paymentMethod: string = 'CASH',
  discount: number = 0,
  couponCode?: string
) => {
  if (!items || items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Calculate total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Check stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new AppError(`Product not found: ${item.name}`, 404);
        }

        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
        }

        // 2. Decrement stock
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PROCESSING',
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod,
          discount,
          couponCode,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 4. Increment coupon usage if applicable
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    // Pass through AppErrors directly
    if (error instanceof AppError) {
      throw error;
    }
    // Check for specific Prisma errors
    if (error.code === 'P2003') {
      throw new AppError('One or more products in your cart are no longer available.', 400);
    }
    throw new AppError(error.message || 'Failed to create order. Please try again.', 500);
  }
};

export const getOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId, status: { not: 'PENDING' } },
    include: { items: { include: { product: { include: { images: true } } } }, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { images: true } } } }, payment: true },
  });

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404);
  }

  return order;
};

// Admin only
export const getAllOrders = async () => {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders;
};

export const updateOrderStatus = async (orderId: string, status: any) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  return order;
};
