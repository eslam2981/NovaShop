"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const error_middleware_1 = require("./error.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../utils/prisma"));
const protect = async (req, _res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new error_middleware_1.AppError('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const currentUser = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!currentUser) {
            return next(new error_middleware_1.AppError('المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى', 401));
        }
        req.user = currentUser;
        next();
    }
    catch (error) {
        return next(new error_middleware_1.AppError('رمز الدخول غير صالح. يرجى تسجيل الدخول مرة أخرى', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new error_middleware_1.AppError('ليس لديك صلاحية للوصول إلى هذه الصفحة', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.middleware.js.map