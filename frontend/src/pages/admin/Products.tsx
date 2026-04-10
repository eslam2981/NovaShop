import { useEffect, useState } from 'react';
import { productService, Product } from '@/services/product';
import { categoryService, Category } from '@/services/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock must be non-negative'),
  categoryId: z.string().min(1, 'Please select a category'),
  images: z.string().optional(),
  salePrice: z.union([z.string(), z.number()]).optional(),
  saleEndDate: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll({ limit: 1000 }),
        categoryService.getAll(),
      ]);
      setProducts(productsData.products);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const images = data.images ? data.images.split(',').map(url => url.trim()).filter(Boolean) : [];
      
      const payload = {
        ...data,
        images,
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        saleEndDate: data.saleEndDate ? new Date(data.saleEndDate).toISOString() : null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
      } else {
        await productService.create(payload as any);
      }
      
      setShowModal(false);
      setEditingProduct(null);
      reset();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', typeof product.price === 'string' ? parseFloat(product.price) : product.price);
    setValue('stock', product.stock);
    setValue('categoryId', product.categoryId);
    setValue('images', product.images?.join(', ') || '');
    setValue('salePrice', product.salePrice ? product.salePrice.toString() : '');
    setValue('saleEndDate', product.saleEndDate ? new Date(product.saleEndDate).toISOString().slice(0, 16) : '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productService.delete(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-sans">Products</h1>
          <p className="text-neutral-500 font-medium">Manage your product inventory.</p>
        </div>
        <Button 
          onClick={() => { setEditingProduct(null); reset(); setShowModal(true); }}
          className="gap-2 shadow-lg shadow-primary/25 rounded-full px-6 h-12"
        >
          <Plus className="h-5 w-5" /> Add Product
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-white dark:bg-zinc-950 p-4 rounded-2xl md:rounded-full border border-neutral-200 dark:border-zinc-800/50 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <Input 
            placeholder="Search products..." 
            className="pl-12 bg-transparent border-none text-base focus-visible:ring-0 shadow-none h-auto py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-900" onClick={() => { setShowModal(false); reset(); setEditingProduct(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <Input {...register('name')} className="rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 h-11" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea {...register('description')} className="w-full p-3 border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border rounded-xl" rows={4} />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price</label>
                  <Input type="number" step="0.01" className="rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 h-11" {...register('price', { valueAsNumber: true })} />
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Stock</label>
                  <Input type="number" className="rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 h-11" {...register('stock', { valueAsNumber: true })} />
                  {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-neutral-50 dark:bg-zinc-900/50 border-neutral-200 dark:border-zinc-800/50 rounded-2xl border">
                <div className="md:col-span-2 text-sm font-bold text-primary mb-1">Limited Time Offer (Optional)</div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neutral-500">Sale Price</label>
                  <Input type="number" step="0.01" className="bg-white dark:bg-zinc-950 border-neutral-200 dark:border-zinc-800 rounded-xl h-11" placeholder="Disabled" {...register('salePrice')} />
                  {errors.salePrice && <p className="text-sm text-red-500 mt-1">{errors.salePrice.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-neutral-500">Sale End Date</label>
                  <Input type="datetime-local" className="bg-white dark:bg-zinc-950 border-neutral-200 dark:border-zinc-800 rounded-xl h-11" {...register('saleEndDate')} />
                  {errors.saleEndDate && <p className="text-sm text-red-500 mt-1">{errors.saleEndDate.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select {...register('categoryId')} className="w-full px-3 h-11 border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 border rounded-xl">
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Images (comma-separated URLs)</label>
                <Input className="rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 h-11" {...register('images')} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
              </div>
              
              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 rounded-full h-12 text-md font-bold">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
                <Button type="button" variant="outline" className="rounded-full h-12 px-8 font-bold hover:bg-neutral-100 dark:hover:bg-zinc-800" onClick={() => { setShowModal(false); reset(); setEditingProduct(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/50 dark:bg-zinc-900/30 border-b border-neutral-200 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5 font-bold tracking-wider">Product</th>
                <th className="px-6 py-5 font-bold tracking-wider">Price</th>
                <th className="px-6 py-5 font-bold tracking-wider">Stock</th>
                <th className="px-6 py-5 font-bold tracking-wider">Category</th>
                <th className="px-8 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-neutral-500 font-medium">Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-neutral-500 font-medium">No products found</td></tr>
              ) : filteredProducts.map((product) => {
                const catName = typeof product.category === 'object' ? product.category?.name : product.category;
                return (
                <tr key={product.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-zinc-700/50 relative">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-neutral-400 text-[10px] font-bold">NO IMG</div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[250px]">
                        <div className="font-bold text-base text-black dark:text-white truncate">{product.name}</div>
                        <div className="text-neutral-500 text-xs truncate mt-0.5">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-base text-black dark:text-white">${typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      product.stock > 10 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 font-medium">{typeof catName === 'string' ? catName : 'Uncategorized'}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-neutral-200 dark:hover:bg-zinc-800" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
