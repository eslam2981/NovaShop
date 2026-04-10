"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const env_1 = require("../config/env");
const registerUser = async (data) => {
    const { email, password, name } = data;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new error_middleware_1.AppError('هذا البريد الإلكتروني مستخدم بالفعل', 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new error_middleware_1.AppError('Invalid email or password', 401);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.AppError('Invalid email or password', 401);
    }
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, env_1.env.JWT_SECRET, {
        expiresIn: '15m',
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.service.js.map