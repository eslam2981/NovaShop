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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 hover:bg-transparent hover:text-primary"
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
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
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
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200'
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
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {product.category?.name || 'Collection'}
                </span>
                <div className="flex items-center text-yellow-400 text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-400">4.8 (120 reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
              
              <div className="flex items-end gap-4 mb-2">
                <p className={`text-4xl font-bold ${isOnSale ? 'text-red-500' : 'text-primary'}`}>
                  ${currentPrice.toFixed(2)}
                </p>
                {isOnSale && (
                  <p className="text-xl text-gray-400 line-through mb-1">
                    ${Number(product.price).toFixed(2)}
                  </p>
                )}
              </div>

              {isOnSale && timeLeft && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4 mt-4">
                  <p className="text-red-600 dark:text-red-400 font-semibold mb-2 text-sm uppercase tracking-wide">Offer ends in:</p>
                  <div className="flex gap-4 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 min-w-[60px] shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{timeLeft.days}</div>
                      <div className="text-xs text-gray-500">Days</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 min-w-[60px] shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{timeLeft.hours}</div>
                      <div className="text-xs text-gray-500">Hours</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 min-w-[60px] shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{timeLeft.minutes}</div>
                      <div className="text-xs text-gray-500">Mins</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 min-w-[60px] shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{timeLeft.seconds}</div>
                      <div className="text-xs text-gray-500">Secs</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {product.description}
            </p>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
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

            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Free Delivery</h4>
                  <p className="text-sm text-gray-500">For orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">2 Year Warranty</h4>
                  <p className="text-sm text-gray-500">Full protection</p>
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
