import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { productService, Product } from '@/services/product';
import ProductCard from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { items } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // In a real app, we should have an endpoint to get products by IDs
        // For now, we'll fetch all and filter, or fetch individually
        const allProducts = await productService.getAll({ limit: 1000 });
        const wishlistProducts = allProducts.products.filter(p => items.includes(p.id));
        setProducts(wishlistProducts);
      } catch (error) {
        console.error('Failed to fetch wishlist products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [items]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-sm">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black dark:text-white">My Wishlist</h1>
              <p className="text-neutral-500 font-medium mt-1">{items.length} items saved for later</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] bg-neutral-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center bg-neutral-50 dark:bg-zinc-900/30 rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 group hover:border-red-500/30 transition-colors duration-500">
            <div className="h-24 w-24 bg-red-500/5 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Heart className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-3 tracking-tight">Your wishlist is empty</h3>
            <p className="text-neutral-500 font-medium max-w-md mx-auto mb-8">
              Start saving your favorite items by clicking the heart icon on products you love. They will be stored securely right here.
            </p>
            <Link to="/products">
              <Button size="lg" className="rounded-full px-8 h-14 font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Explore Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
