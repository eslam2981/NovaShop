import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';
import { sendEmail, generateOrderConfirmationEmail, generateOrderStatusEmail } from '../utils/email';

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
          user: true,
        },
      });

      // 4. Send Confirmation Email
      try {
        const html = generateOrderConfirmationEmail(order.id, order.user.name, Number(order.total), order.items);
        // Don't await email send to avoid blocking the response
        sendEmail(order.user.email, `Order Confirmation: #${order.id.slice(-6).toUpperCase()}`, html).catch(console.error);
      } catch (emailError) {
        console.error('Failed to generate/send confirmation email', emailError);
      }

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
    include: { 
      user: true,
      items: { include: { product: { include: { images: true } } } }
    },
  });

  try {
    const html = generateOrderStatusEmail(order.id, order.status, order.user.name, order.items);
    sendEmail(order.user.email, `Order Status Update: #${order.id.slice(-6).toUpperCase()}`, html).catch(console.error);
  } catch (emailError) {
    console.error('Failed to generate/send status update email', emailError);
  }

  return order;
};

export const deleteOrder = async (orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Restore product stock
    for (const item of order.items) {
      // Find the product first to ensure it hasn't been completely deleted from the DB
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    // Decrement coupon count if one was used
    if (order.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: order.couponCode } });
      if (coupon && coupon.usedCount > 0) {
        await tx.coupon.update({
          where: { code: order.couponCode },
          data: { usedCount: { decrement: 1 } }
        });
      }
    }

    // Finally, safely delete the order. (Order items and payments cascade down)
    await tx.order.delete({
      where: { id: orderId }
    });

    return { success: true, message: 'Order successfully deleted and resources restored.' };
  });
};
