"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsers = async () => {
    const users = await prisma_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    orders: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => ({
        ...user,
        orderCount: user._count.orders,
    }));
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            orders: {
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    return user;
};
exports.getUserById = getUserById;
const ALLOWED_ROLES = ['USER', 'ADMIN'];
const createUser = async (data) => {
    const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new error_middleware_1.AppError('Email already in use', 400);
    }
    const role = data.role === 'ADMIN' ? 'ADMIN' : 'USER';
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    return prisma_1.default.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.createUser = createUser;
const updateUser = async (id, data) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    const updateData = {};
    if (data.name)
        updateData.name = data.name;
    if (data.email && data.email !== user.email) {
        const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new error_middleware_1.AppError('Email already in use', 400);
        }
        updateData.email = data.email;
    }
    if (data.role !== undefined) {
        if (!ALLOWED_ROLES.includes(data.role)) {
            throw new error_middleware_1.AppError('Invalid role', 400);
        }
        updateData.role = data.role;
    }
    if (data.password) {
        updateData.password = await bcryptjs_1.default.hash(data.password, 12);
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    await prisma_1.default.user.delete({
        where: { id },
    });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.service.js.map