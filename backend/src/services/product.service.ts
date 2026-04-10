import prisma from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const createProduct = async (data: any) => {
  const { images, ...otherData } = data;
  
  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: otherData.categoryId },
  });
  
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  
  const product = await prisma.product.create({
    data: {
      ...otherData,
      salePrice: otherData.salePrice ? Number(otherData.salePrice) : null,
      saleEndDate: otherData.saleEndDate ? new Date(otherData.saleEndDate) : null,
      images: {
        create: images ? images.map((url: string) => ({ url })) : [],
      },
    },
    include: { images: true, category: true },
  });
  
  return {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    images: product.images.map((img: any) => img.url),
  };
};

export const getProducts = async (query: any) => {
  const { page = 1, limit = 10, search, category, sortBy, sortOrder } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

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
    prisma.product.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      include: { category: true, images: true },
      orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const transformedProducts = products.map((p: any) => ({
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    images: p.images.map((img: any) => img.url),
  }));

  return { products: transformedProducts, total, page: Number(page), limit: Number(limit) };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
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
    throw new AppError('Product not found', 404);
  }

  return {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    images: product.images.map((img: any) => img.url),
  };
};

export const updateProduct = async (id: string, data: any) => {
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const { images, ...otherData } = data;

  // If categoryId is provided, verify it exists
  if (otherData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: otherData.categoryId },
    });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  // Delete existing images if new ones are provided
  if (images) {
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...otherData,
      salePrice: otherData.salePrice ? Number(otherData.salePrice) : null,
      saleEndDate: otherData.saleEndDate ? new Date(otherData.saleEndDate) : null,
      ...(images && {
        images: {
          create: images.map((url: string) => ({ url })),
        },
      }),
    },
    include: { images: true, category: true },
  });

  return {
    ...updatedProduct,
    price: Number(updatedProduct.price),
    salePrice: updatedProduct.salePrice ? Number(updatedProduct.salePrice) : null,
    images: updatedProduct.images.map((img: any) => img.url),
  };
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Delete related images first
  await prisma.productImage.deleteMany({
    where: { productId: id },
  });

  // Delete the product
  await prisma.product.delete({
    where: { id },
  });
};

export const getStoreStats = async () => {
  const [productsCount, usersCount] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
  ]);

  return { productsCount, usersCount };
};
