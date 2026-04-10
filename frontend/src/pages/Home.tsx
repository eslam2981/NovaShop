import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Categories from '@/components/home/Categories';
import Newsletter from '@/components/home/Newsletter';
import Testimonials from '@/components/home/Testimonials';
import { productService, Product } from '@/services/product';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/animations';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAll({ 
          limit: 8,
          sortBy: 'stock',
          sortOrder: 'asc'
        });
        setProducts(data.products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Hero />
      <Features />
      <Categories />
      
      {/* Trending Products */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-zinc-950 border-t border-neutral-200 dark:border-zinc-800/50">
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={slideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Hot Deals & Popular</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tighter text-black dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Now</span>
            </motion.h2>
            <motion.p 
              className="text-neutral-500 text-lg max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover the most coveted pieces of the season, curated just for you.
            </motion.p>
          </motion.div>
          
          {loading ? (
            <div 
              className="grid gap-6 md:gap-8 justify-center" 
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="h-[400px] w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              ))}
            </div>
          ) : (
            <>
              <motion.div 
                className="grid gap-6 md:gap-8 mb-12 justify-center"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {products.map((product, index) => (
                  <div key={product.id} className="w-full">
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </motion.div>
              
              {products.length > 0 && (
                <motion.div 
                  className="text-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={() => navigate('/products')}
                      variant="outline"
                      size="lg"
                      className="h-16 px-12 text-lg rounded-full border-2 border-neutral-200 dark:border-zinc-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-900 shadow-sm transition-all font-black tracking-widest uppercase text-black dark:text-white"
                    >
                      Explore All Pieces
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default Home;
