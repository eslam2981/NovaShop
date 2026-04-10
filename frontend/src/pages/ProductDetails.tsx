import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, Product } from '@/services/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await productService.getById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isOnSale = product && product.salePrice && (!product.saleEndDate || new Date(product.saleEndDate) > new Date());
  const currentPrice = isOnSale ? Number(product.salePrice) : (product ? Number(product.price) : 0);

  useEffect(() => {
    if (isOnSale && product?.saleEndDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(product.saleEndDate!).getTime() - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft(null);
        } else {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [product, isOnSale]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/50 dark:bg-zinc-950/50 py-12 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 hover:bg-white dark:hover:bg-zinc-900/50 rounded-full pr-6 font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white dark:bg-zinc-950 rounded-[2rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none border border-neutral-200 dark:border-zinc-800/50 relative">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest text-sm bg-neutral-50 dark:bg-zinc-900/50">No Image</div>
              )}
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                  Limited Time Offer
                </div>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index ? 'border-primary ring-4 ring-primary/20 scale-95' : 'border-transparent hover:border-neutral-200 dark:hover:border-zinc-800'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
                  {product.category?.name || 'Collection'}
                </span>
                <div className="flex items-center text-amber-400 text-sm bg-amber-400/10 px-3 py-1.5 rounded-full font-bold">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span className="text-amber-600 dark:text-amber-400">4.8 (120 reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6 tracking-tighter leading-tight">{product.name}</h1>
              
              <div className="flex items-end gap-4 mb-4">
                <p className={`text-4xl md:text-5xl font-black ${isOnSale ? 'text-red-500' : 'text-primary'}`}>
                  ${currentPrice.toFixed(2)}
                </p>
                {isOnSale && (
                  <p className="text-2xl text-neutral-400 line-through mb-1.5 font-bold">
                    ${Number(product.price).toFixed(2)}
                  </p>
                )}
              </div>

              {isOnSale && timeLeft && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 mt-6">
                  <p className="text-red-600 dark:text-red-400 font-bold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                     Offer ends in:
                  </p>
                  <div className="flex gap-4 text-center">
                    <div className="bg-white dark:bg-zinc-950 rounded-xl p-3 min-w-[70px] shadow-sm border border-neutral-100 dark:border-zinc-800/50">
                      <div className="text-2xl font-black text-black dark:text-white">{timeLeft.days}</div>
                      <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Days</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 rounded-xl p-3 min-w-[70px] shadow-sm border border-neutral-100 dark:border-zinc-800/50">
                      <div className="text-2xl font-black text-black dark:text-white">{timeLeft.hours}</div>
                      <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Hours</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 rounded-xl p-3 min-w-[70px] shadow-sm border border-neutral-100 dark:border-zinc-800/50">
                      <div className="text-2xl font-black text-black dark:text-white">{timeLeft.minutes}</div>
                      <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Mins</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 rounded-xl p-3 min-w-[70px] shadow-sm border border-neutral-100 dark:border-zinc-800/50">
                      <div className="text-2xl font-black text-black dark:text-white">{timeLeft.seconds}</div>
                      <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Secs</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-lg font-medium">
              {product.description}
            </p>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 h-14 text-lg rounded-xl font-bold bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
                onClick={() => addItem({
                  id: product.id,
                  name: product.name,
                  price: currentPrice,
                  quantity: 1,
                  image: product.images?.[0]
                })}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 mt-8 border-t border-neutral-200 dark:border-zinc-800/50">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-800/50">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-black dark:text-white">Free Delivery</h4>
                  <p className="text-sm text-neutral-500 font-medium mt-1">Orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-800/50">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-black dark:text-white">2 Year Warranty</h4>
                  <p className="text-sm text-neutral-500 font-medium mt-1">Full protection</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
