import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, Product } from '@/services/product';
import { categoryService, Category } from '@/services/category';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



const ProductList = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAll({ 
          search, 
          category: selectedCategory || undefined,
          sortBy, 
          sortOrder,
          page,
          limit
        });
        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, sortBy, sortOrder, page]);

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-zinc-800/50 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black mb-1">Shop Collection</h1>
              <p className="text-sm text-neutral-500 font-medium hidden md:block">
                Discover our premium selection of products.
              </p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto flex-wrap justify-center">
              <div className="relative flex-1 md:w-80 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder={t('search') || 'Search products...'}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="h-12 pl-12 bg-neutral-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 focus:border-primary focus:ring-1 focus:ring-primary rounded-full transition-all"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-full border-neutral-200 dark:border-zinc-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-900/50 font-bold gap-2 min-w-[150px]">
                    <SlidersHorizontal className="h-4 w-4" />
                    {selectedCategory 
                      ? categories.find(c => c.name === selectedCategory)?.name || 'Category'
                      : 'All Categories'
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border-neutral-200 dark:border-zinc-800/50 rounded-2xl max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="font-semibold" onClick={() => { 
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                    setSelectedCategory('');
                    setPage(1); 
                  }}>
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem 
                      key={cat.id} 
                      className="font-medium"
                      onClick={() => { 
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('category', cat.name);
                        setSearchParams(newParams);
                        setSelectedCategory(cat.name);
                        setPage(1); 
                      }}
                    >
                      {cat.name} ({cat.productCount || 0})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-full border-neutral-200 dark:border-zinc-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-900/50 font-bold gap-2 min-w-[150px]">
                    <ArrowUpDown className="h-4 w-4" />
                    {sortBy === 'price' 
                      ? (sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low')
                      : sortBy === 'name'
                        ? (sortOrder === 'asc' ? 'Name: A-Z' : 'Name: Z-A')
                        : 'Newest Arrivals'
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border-neutral-200 dark:border-zinc-800/50 rounded-2xl">
                  <DropdownMenuItem className="font-semibold" onClick={() => handleSort('createdAt', 'desc')}>
                    Newest Arrivals
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold" onClick={() => handleSort('price', 'asc')}>
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold" onClick={() => handleSort('price', 'desc')}>
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold" onClick={() => handleSort('name', 'asc')}>
                    Name: A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold" onClick={() => handleSort('name', 'desc')}>
                    Name: Z-A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 relative z-0">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-neutral-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
        
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-24 w-24 bg-neutral-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-200 dark:border-zinc-800">
              <Search className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-black mb-2">No products found</h3>
            <p className="text-neutral-500 font-medium max-w-sm mx-auto">
              We couldn't find any products matching your search. Try adjusting your filters or check back later.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full font-bold h-12 px-8"
              onClick={() => { 
                setSearch(''); 
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('category');
                setSearchParams(newParams);
                setSelectedCategory('');
                setSortBy('createdAt'); 
                setPage(1);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Active Filters */}
        {(search || selectedCategory) && (
          <div className="flex flex-wrap gap-3 mt-10 mb-6 items-center">
            <span className="text-xs font-black tracking-widest uppercase text-neutral-500">Active filters:</span>
            {search && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Search: "{search}"
                <button onClick={() => { setSearch(''); setPage(1); }} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Category: {selectedCategory}
                <button onClick={() => { 
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('category');
                  setSearchParams(newParams);
                  setSelectedCategory('');
                  setPage(1); 
                }} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > limit && (
          <div className="flex justify-center items-center gap-6 mt-16 pb-8">
            <Button 
              variant="outline" 
              className="h-12 px-8 rounded-full font-bold border-neutral-200 dark:border-zinc-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-900/50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-black text-neutral-500 uppercase tracking-widest">
              Page {page} / {Math.ceil(total / limit)}
            </span>
            <Button 
              variant="outline" 
              className="h-12 px-8 rounded-full font-bold border-neutral-200 dark:border-zinc-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-900/50"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
