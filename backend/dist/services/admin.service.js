"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAdminStats = async () => {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders, completedOrders, recentOrders, topProducts, lowStockProducts,] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.product.count(),
        prisma_1.default.order.count(),
        prisma_1.default.order.aggregate({
            _sum: { total: true },
            where: {
                status: { in: ['COMPLETED', 'DELIVERED'] }
            },
        }),
        prisma_1.default.order.count({ where: { status: 'PENDING' } }),
        prisma_1.default.order.count({
            where: {
                status: { in: ['COMPLETED', 'DELIVERED'] }
            }
        }),
        prisma_1.default.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: true } },
            },
        }),
        prisma_1.default.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            where: {
                order: {
                    status: { in: ['COMPLETED', 'DELIVERED'] }
                }
            },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        }),
        prisma_1.default.product.findMany({
            where: { stock: { lt: 10 } },
            take: 5,
            include: { category: true, images: true },
        }),
    ]);
    const topProductsWithDetails = await Promise.all(topProducts.map(async (item) => {
        const product = await prisma_1.default.product.findUnique({
            where: { id: item.productId },
            include: { category: true, images: true },
        });
        return {
            ...product,
            soldQuantity: item._sum.quantity,
            images: product?.images.map((img) => img.url) || [],
        };
    }));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [recentUsersCount, recentOrdersCount] = await Promise.all([
        prisma_1.default.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma_1.default.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const salesOverTime = await prisma_1.default.order.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: { gte: sevenDaysAgo },
            status: { in: ['COMPLETED', 'DELIVERED'] }
        },
        _sum: { total: true },
        _count: { id: true },
    });
    const salesData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayStats = salesOverTime.filter(s => s.createdAt.toISOString().startsWith(dateStr));
        const revenue = dayStats.reduce((acc, curr) => acc + Number(curr._sum.total || 0), 0);
        const orders = dayStats.reduce((acc, curr) => acc + (curr._count.id || 0), 0);
        return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue,
            orders
        };
    });
    const categoryRevenue = await prisma_1.default.orderItem.findMany({
        where: {
            order: { status: { in: ['COMPLETED', 'DELIVERED'] } }
        },
        include: {
            product: {
                include: { category: true }
            }
        }
    });
    const revenueByCategory = categoryRevenue.reduce((acc, item) => {
        const categoryName = item.product.category.name;
        const revenue = Number(item.price) * item.quantity;
        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += revenue;
        return acc;
    }, {});
    const categoryData = Object.entries(revenueByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    return {
        overview: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: Number(totalRevenue._sum.total || 0),
            pendingOrders,
            completedOrders,
        },
        growth: {
            newUsers: recentUsersCount,
            newOrders: recentOrdersCount,
        },
        salesData,
        categoryData,
        recentOrders,
        topProducts: topProductsWithDetails,
        lowStockProducts: lowStockProducts.map((p) => ({
            ...p,
            images: p.images.map((img) => img.url),
        })),
    };
};
exports.getAdminStats = getAdminStats;
//# sourceMappingURL=admin.service.js.map