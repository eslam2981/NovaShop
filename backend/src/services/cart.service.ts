import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const addToCart = async (userId: string, productId: string, quantity: number) => {
  // Find pending order (cart)
  let cart = await prisma.order.findFirst({
    where: { userId, status: 'PENDING' },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total: 0,
        shippingAddress: '{}',
        paymentMethod: 'CASH',
        discount: 0,
      },
      include: { items: true },
    });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    await prisma.orderItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.orderItem.create({
      data: {
        orderId: cart.id,
        productId,
        quantity,
        price: product.price,
      },
    });
  }

  // Recalculate total
  return getCart(userId);
};

export const getCart = async (userId: string) => {
  const cart = await prisma.order.findFirst({
    where: { userId, status: 'PENDING' },
    include: { items: { include: { product: true } } },
  });

  if (!cart) return null;

  const total = cart.items.reduce((acc, item) => {
    return acc + Number(item.price) * item.quantity;
  }, 0);

  await prisma.order.update({
    where: { id: cart.id },
    data: { total },
  });

  return { ...cart, total };
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const cart = await prisma.order.findFirst({
    where: { userId, status: 'PENDING' },
  });

  if (!cart) throw new AppError('Cart not found', 404);

  await prisma.orderItem.delete({
    where: { id: itemId },
  });

  return getCart(userId);
};
