import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  salePrice?: number | string | null;
  saleEndDate?: string | null;
  stock: number;
  images: string[];
  categoryId: string;
  category?: { name: string; id: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductListResponse> => {
    const response = await api.get('/products', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  },

  create: async (data: {
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    saleEndDate?: string;
    stock: number;
    categoryId: string;
    images?: string[];
  }): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data.data.product;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data.data.product;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getPublicStats: async (): Promise<{ productsCount: number, usersCount: number }> => {
    const response = await api.get('/products/stats/public');
    return response.data.data;
  },
};
