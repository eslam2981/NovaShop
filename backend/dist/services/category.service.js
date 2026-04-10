"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const getCategories = async () => {
    const categories = await prisma_1.default.category.findMany({
        include: {
            _count: {
                select: { products: true },
            },
        },
        orderBy: { name: 'asc' },
    });
    return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
    }));
};
exports.getCategories = getCategories;
const getCategoryById = async (id) => {
    const category = await prisma_1.default.category.findUnique({
        where: { id },
        include: {
            products: {
                include: { images: true },
                take: 10,
            },
            _count: {
                select: { products: true },
            },
        },
    });
    if (!category) {
        throw new error_middleware_1.AppError('Category not found', 404);
    }
    return {
        ...category,
        products: category.products.map((p) => ({
            ...p,
            price: Number(p.price),
            images: p.images.map((img) => img.url),
        })),
        productCount: category._count.products,
    };
};
exports.getCategoryById = getCategoryById;
const createCategory = async (data) => {
    const existing = await prisma_1.default.category.findUnique({
        where: { name: data.name },
    });
    if (existing) {
        throw new error_middleware_1.AppError('Category already exists', 400);
    }
    const category = await prisma_1.default.category.create({
        data,
    });
    return category;
};
exports.createCategory = createCategory;
const updateCategory = async (id, data) => {
    const category = await prisma_1.default.category.findUnique({ where: { id } });
    if (!category) {
        throw new error_middleware_1.AppError('Category not found', 404);
    }
    if (data.name && data.name !== category.name) {
        const existing = await prisma_1.default.category.findUnique({
            where: { name: data.name },
        });
        if (existing) {
            throw new error_middleware_1.AppError('Category name already exists', 400);
        }
    }
    const updatedCategory = await prisma_1.default.category.update({
        where: { id },
        data,
    });
    return updatedCategory;
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    const category = await prisma_1.default.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
    });
    if (!category) {
        throw new error_middleware_1.AppError('Category not found', 404);
    }
    if (category._count.products > 0) {
        throw new error_middleware_1.AppError('Cannot delete category with existing products', 400);
    }
    await prisma_1.default.category.delete({
        where: { id },
    });
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.service.js.map