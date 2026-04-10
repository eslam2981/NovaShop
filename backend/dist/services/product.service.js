"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const createProduct = async (data) => {
    const { images, ...otherData } = data;
    const category = await prisma_1.default.category.findUnique({
        where: { id: otherData.categoryId },
    });
    if (!category) {
        throw new error_middleware_1.AppError('Category not found', 404);
    }
    const product = await prisma_1.default.product.create({
        data: {
            ...otherData,
            salePrice: otherData.salePrice ? Number(otherData.salePrice) : null,
            saleEndDate: otherData.saleEndDate ? new Date(otherData.saleEndDate) : null,
            images: {
                create: images ? images.map((url) => ({ url })) : [],
            },
        },
        include: { images: true, category: true },
    });
    return {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        images: product.images.map((img) => img.url),
    };
};
exports.createProduct = createProduct;
const getProducts = async (query) => {
    const { page = 1, limit = 10, search, category, sortBy, sortOrder } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
        ];
    }
    if (category) {
        where.category = { name: category };
    }
    const [products, total] = await Promise.all([
        prisma_1.default.product.findMany({
            where,
            skip: Number(skip),
            take: Number(limit),
            include: { category: true, images: true },
            orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' },
        }),
        prisma_1.default.product.count({ where }),
    ]);
    const transformedProducts = products.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        images: p.images.map((img) => img.url),
    }));
    return { products: transformedProducts, total, page: Number(page), limit: Number(limit) };
};
exports.getProducts = getProducts;
const getProductById = async (id) => {
    const product = await prisma_1.default.product.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: {
                include: { user: { select: { name: true, email: true } } }
            },
            images: true
        },
    });
    if (!product) {
        throw new error_middleware_1.AppError('Product not found', 404);
    }
    return {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        images: product.images.map((img) => img.url),
    };
};
exports.getProductById = getProductById;
const updateProduct = async (id, data) => {
    const product = await prisma_1.default.product.findUnique({ where: { id } });
    if (!product) {
        throw new error_middleware_1.AppError('Product not found', 404);
    }
    const { images, ...otherData } = data;
    if (otherData.categoryId) {
        const category = await prisma_1.default.category.findUnique({
            where: { id: otherData.categoryId },
        });
        if (!category) {
            throw new error_middleware_1.AppError('Category not found', 404);
        }
    }
    if (images) {
        await prisma_1.default.productImage.deleteMany({
            where: { productId: id },
        });
    }
    const updatedProduct = await prisma_1.default.product.update({
        where: { id },
        data: {
            ...otherData,
            salePrice: otherData.salePrice ? Number(otherData.salePrice) : null,
            saleEndDate: otherData.saleEndDate ? new Date(otherData.saleEndDate) : null,
            ...(images && {
                images: {
                    create: images.map((url) => ({ url })),
                },
            }),
        },
        include: { images: true, category: true },
    });
    return {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        salePrice: updatedProduct.salePrice ? Number(updatedProduct.salePrice) : null,
        images: updatedProduct.images.map((img) => img.url),
    };
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    const product = await prisma_1.default.product.findUnique({ where: { id } });
    if (!product) {
        throw new error_middleware_1.AppError('Product not found', 404);
    }
    await prisma_1.default.productImage.deleteMany({
        where: { productId: id },
    });
    await prisma_1.default.product.delete({
        where: { id },
    });
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.service.js.map