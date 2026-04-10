"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.getWishlist = exports.addToWishlist = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const addToWishlist = async (userId, productId) => {
    let wishlist = await prisma_1.default.wishlist.findUnique({
        where: { userId },
    });
    if (!wishlist) {
        wishlist = await prisma_1.default.wishlist.create({
            data: { userId },
        });
    }
    const existingItem = await prisma_1.default.wishlistItem.findFirst({
        where: { wishlistId: wishlist.id, productId },
    });
    if (existingItem) {
        throw new error_middleware_1.AppError('Product already in wishlist', 400);
    }
    await prisma_1.default.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            productId,
        },
    });
    return (0, exports.getWishlist)(userId);
};
exports.addToWishlist = addToWishlist;
const getWishlist = async (userId) => {
    const wishlist = await prisma_1.default.wishlist.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    });
    return wishlist;
};
exports.getWishlist = getWishlist;
const removeFromWishlist = async (userId, productId) => {
    const wishlist = await prisma_1.default.wishlist.findUnique({
        where: { userId },
    });
    if (!wishlist)
        throw new error_middleware_1.AppError('Wishlist not found', 404);
    const item = await prisma_1.default.wishlistItem.findFirst({
        where: { wishlistId: wishlist.id, productId },
    });
    if (!item)
        throw new error_middleware_1.AppError('Item not found in wishlist', 404);
    await prisma_1.default.wishlistItem.delete({
        where: { id: item.id },
    });
    return (0, exports.getWishlist)(userId);
};
exports.removeFromWishlist = removeFromWishlist;
//# sourceMappingURL=wishlist.service.js.map