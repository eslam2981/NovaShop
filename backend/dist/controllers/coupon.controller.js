"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.toggleStatus = exports.deleteCoupon = exports.getCoupons = exports.createCoupon = void 0;
const couponService = __importStar(require("../services/coupon.service"));
const safeParam_1 = require("../utils/safeParam");
const createCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.createCoupon(req.body);
        res.status(201).json({ status: 'success', data: { coupon } });
    }
    catch (error) {
        next(error);
    }
};
exports.createCoupon = createCoupon;
const getCoupons = async (_req, res, next) => {
    try {
        const coupons = await couponService.getCoupons();
        res.status(200).json({ status: 'success', data: { coupons } });
    }
    catch (error) {
        next(error);
    }
};
exports.getCoupons = getCoupons;
const deleteCoupon = async (req, res, next) => {
    try {
        await couponService.deleteCoupon((0, safeParam_1.safeParam)(req.params.id));
        res.status(204).json({ status: 'success', data: null });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCoupon = deleteCoupon;
const toggleStatus = async (req, res, next) => {
    try {
        const coupon = await couponService.toggleCouponStatus((0, safeParam_1.safeParam)(req.params.id));
        res.status(200).json({ status: 'success', data: { coupon } });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleStatus = toggleStatus;
const validateCoupon = async (req, res, next) => {
    try {
        const { code, total } = req.body;
        const result = await couponService.validateCoupon(code, total);
        res.status(200).json({ status: 'success', data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.validateCoupon = validateCoupon;
//# sourceMappingURL=coupon.controller.js.map