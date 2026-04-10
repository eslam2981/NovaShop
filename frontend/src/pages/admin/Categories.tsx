import { useEffect, useState } from 'react';
import { categoryService, Category } from '@/services/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type CategoryForm = z.infer<typeof categorySchema>;

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, data);
      } else {
        await categoryService.create(data);
      }
      
      setShowModal(false);
      setEditingCategory(null);
      reset();
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will be affected.')) return;
    
    try {
      await categoryService.delete(id);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-sans">Categories</h1>
          <p className="text-neutral-500 font-medium">Manage product categories.</p>
        </div>
        <Button 
          onClick={() => { setEditingCategory(null); reset(); setShowModal(true); }}
          className="gap-2 shadow-lg shadow-primary/25 rounded-full px-6 h-12"
        >
          <Plus className="h-5 w-5" /> Add Category
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-900" onClick={() => { setShowModal(false); reset(); setEditingCategory(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <Input {...register('name')} className="rounded-xl border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 h-11" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              
              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 rounded-full h-12 text-md font-bold">{editingCategory ? 'Update Category' : 'Create Category'}</Button>
                <Button type="button" variant="outline" className="rounded-full h-12 px-8 font-bold hover:bg-neutral-100 dark:hover:bg-zinc-800" onClick={() => { setShowModal(false); reset(); setEditingCategory(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20 text-neutral-500 font-bold">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center mx-auto text-neutral-500">
            <p className="font-semibold text-xl text-black dark:text-white mb-2">No categories found</p>
            <p className="text-sm">Create your first category to start organizing products.</p>
          </div>
        ) : categories.map((category) => (
          <div key={category.id} className="group bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-primary blur-2xl" />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-xl text-primary">
                  {(typeof category.name === 'object' ? category.name?.name : category.name)?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-neutral-200 dark:hover:bg-zinc-800" onClick={() => handleEdit(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-neutral-500" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="font-black text-xl text-black dark:text-white mb-1 truncate">{typeof category.name === 'object' ? category.name.name : category.name}</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-zinc-800 text-xs font-bold text-neutral-500 max-w-fit">
                  <span className="text-black dark:text-white">{category.productCount || 0}</span> Products
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;

