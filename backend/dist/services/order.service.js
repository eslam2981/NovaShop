"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const createOrder = async (userId, items, shippingAddress, paymentMethod = 'CASH', discount = 0, couponCode) => {
    if (!items || items.length === 0) {
        throw new error_middleware_1.AppError('Cart is empty', 400);
    }
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);
    try {
        return await prisma_1.default.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.id },
                });
                if (!product) {
                    throw new error_middleware_1.AppError(`Product not found: ${item.name}`, 404);
                }
                if (product.stock < item.quantity) {
                    throw new error_middleware_1.AppError(`Insufficient stock for product: ${product.name}`, 400);
                }
                await tx.product.update({
                    where: { id: item.id },
                    data: { stock: { decrement: item.quantity } },
                });
            }
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
                        create: items.map((item) => ({
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
            if (couponCode) {
                await tx.coupon.update({
                    where: { code: couponCode },
                    data: { usedCount: { increment: 1 } },
                });
            }
            return order;
        });
    }
    catch (error) {
        console.error('Order creation error:', error);
        if (error instanceof error_middleware_1.AppError) {
            throw error;
        }
        if (error.code === 'P2003') {
            throw new error_middleware_1.AppError('One or more products in your cart are no longer available.', 400);
        }
        throw new error_middleware_1.AppError(error.message || 'Failed to create order. Please try again.', 500);
    }
};
exports.createOrder = createOrder;
const getOrders = async (userId) => {
    const orders = await prisma_1.default.order.findMany({
        where: { userId, status: { not: 'PENDING' } },
        include: { items: { include: { product: true } }, payment: true },
        orderBy: { createdAt: 'desc' },
    });
    return orders;
};
exports.getOrders = getOrders;
const getOrderById = async (userId, orderId) => {
    const order = await prisma_1.default.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } }, payment: true },
    });
    if (!order || order.userId !== userId) {
        throw new error_middleware_1.AppError('Order not found', 404);
    }
    return order;
};
exports.getOrderById = getOrderById;
const getAllOrders = async () => {
    const orders = await prisma_1.default.order.findMany({
        include: { user: true, items: true, payment: true },
        orderBy: { createdAt: 'desc' },
    });
    return orders;
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (orderId, status) => {
    const order = await prisma_1.default.order.update({
        where: { id: orderId },
        data: { status },
    });
    return order;
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=order.service.js.map