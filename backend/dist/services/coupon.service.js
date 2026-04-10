"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.toggleCouponStatus = exports.deleteCoupon = exports.getCoupons = exports.createCoupon = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const createCoupon = async (data) => {
    const existing = await prisma_1.default.coupon.findUnique({
        where: { code: data.code },
    });
    if (existing) {
        throw new error_middleware_1.AppError('Coupon code already exists', 400);
    }
    return await prisma_1.default.coupon.create({
        data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        },
    });
};
exports.createCoupon = createCoupon;
const getCoupons = async () => {
    return await prisma_1.default.coupon.findMany({
        orderBy: { createdAt: 'desc' },
    });
};
exports.getCoupons = getCoupons;
const deleteCoupon = async (id) => {
    return await prisma_1.default.coupon.delete({
        where: { id },
    });
};
exports.deleteCoupon = deleteCoupon;
const toggleCouponStatus = async (id) => {
    const coupon = await prisma_1.default.coupon.findUnique({ where: { id } });
    if (!coupon)
        throw new error_middleware_1.AppError('Coupon not found', 404);
    return await prisma_1.default.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
    });
};
exports.toggleCouponStatus = toggleCouponStatus;
const validateCoupon = async (code, orderTotal) => {
    const coupon = await prisma_1.default.coupon.findUnique({
        where: { code },
    });
    if (!coupon) {
        throw new error_middleware_1.AppError('Invalid coupon code', 404);
    }
    if (!coupon.isActive) {
        throw new error_middleware_1.AppError('Coupon is inactive', 400);
    }
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
        throw new error_middleware_1.AppError('Coupon is expired', 400);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new error_middleware_1.AppError('Coupon usage limit reached', 400);
    }
    if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) {
        throw new error_middleware_1.AppError(`Minimum order value of $${coupon.minOrderValue} required`, 400);
    }
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (orderTotal * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
        }
    }
    else {
        discountAmount = Number(coupon.discountValue);
    }
    return {
        coupon,
        discountAmount,
        finalTotal: orderTotal - discountAmount,
    };
};
exports.validateCoupon = validateCoupon;
//# sourceMappingURL=coupon.service.js.map