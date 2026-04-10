"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.getCart = exports.addToCart = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const addToCart = async (userId, productId, quantity) => {
    let cart = await prisma_1.default.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: true },
    });
    if (!cart) {
        cart = await prisma_1.default.order.create({
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
    const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
    if (!product)
        throw new error_middleware_1.AppError('Product not found', 404);
    const existingItem = cart.items.find((item) => item.productId === productId);
    if (existingItem) {
        await prisma_1.default.orderItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
        });
    }
    else {
        await prisma_1.default.orderItem.create({
            data: {
                orderId: cart.id,
                productId,
                quantity,
                price: product.price,
            },
        });
    }
    return (0, exports.getCart)(userId);
};
exports.addToCart = addToCart;
const getCart = async (userId) => {
    const cart = await prisma_1.default.order.findFirst({
        where: { userId, status: 'PENDING' },
        include: { items: { include: { product: true } } },
    });
    if (!cart)
        return null;
    const total = cart.items.reduce((acc, item) => {
        return acc + Number(item.price) * item.quantity;
    }, 0);
    await prisma_1.default.order.update({
        where: { id: cart.id },
        data: { total },
    });
    return { ...cart, total };
};
exports.getCart = getCart;
const removeFromCart = async (userId, itemId) => {
    const cart = await prisma_1.default.order.findFirst({
        where: { userId, status: 'PENDING' },
    });
    if (!cart)
        throw new error_middleware_1.AppError('Cart not found', 404);
    await prisma_1.default.orderItem.delete({
        where: { id: itemId },
    });
    return (0, exports.getCart)(userId);
};
exports.removeFromCart = removeFromCart;
//# sourceMappingURL=cart.service.js.map