import { Product } from '@/services/product';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const { hasItem, toggleItem } = useWishlistStore();
  const isWishlisted = hasItem(product.id);

  // 3D tilt effect with smooth spring physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 80, damping: 20 });
  const springY = useSpring(y, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-100, 100], [5, -5]);
  const rotateY = useTransform(springX, [-100, 100], [-5, 5]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isOnSale = product.salePrice && (!product.saleEndDate || new Date(product.saleEndDate) > new Date());
  const currentPrice = isOnSale ? Number(product.salePrice) : Number(product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if wrapped in Link
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image: product.images?.[0]
    });

    toast.success('Added to cart');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{
        y: -5,
        transition: { type: 'spring', stiffness: 200, damping: 20 }
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        zIndex: 10
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-white dark:bg-zinc-950 rounded-[2rem] overflow-hidden border border-neutral-200 dark:border-zinc-800/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300"
    >
      <div className="aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-zinc-900 relative">
        {product.images && product.images.length > 0 ? (
          <motion.img
            src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold tracking-widest text-xs uppercase">
            No Image
          </div>
        )}

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-xl z-10 animate-pulse">
            Private Sale
          </div>
        )}

        {/* Overlay Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </motion.div>

          <Link to={`/products/${product.id}`}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <Button size="icon" variant="secondary" className="rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
                <Eye className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Wishlist Button - Top Right */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="icon"
            variant="secondary"
            className={`rounded-xl shadow-lg h-10 w-10 transition-all backdrop-blur-md border ${isWishlisted
                ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                : 'bg-white/50 dark:bg-zinc-900/50 border-white/20 dark:border-zinc-800 text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400'
              }`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </motion.div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-3">
          <motion.span
            className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full inline-block"
            whileHover={{ scale: 1.05 }}
          >
            {typeof product.category === 'object' ? product.category?.name : product.category || 'Collection'}
          </motion.span>
        </div>
        <h3 className="font-black text-xl md:text-2xl mb-1.5 truncate text-black dark:text-white leading-tight">
          <Link to={`/products/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6 font-medium">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <motion.span
              className={`font-black text-2xl ${isOnSale ? 'text-red-500' : 'text-black dark:text-white'}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              ${currentPrice.toFixed(2)}
            </motion.span>
            {isOnSale && (
              <span className="text-xs font-bold text-neutral-400 line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          {product.stock > 0 ? (
            <motion.span
              className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 select-none bg-emerald-500/10 px-3 py-1.5 rounded-full"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Available
            </motion.span>
          ) : (
            <span className="text-[10px] uppercase font-black tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full">Sold Out</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
