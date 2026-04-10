import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products">
          <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/50 dark:bg-zinc-950/50 py-12 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter text-black dark:text-white">Shopping Cart ({items.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white dark:bg-zinc-950 p-6 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-none border border-neutral-200 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-6 items-center hover:border-primary/50 transition-colors"
                >
                  <div className="h-32 w-32 sm:h-24 sm:w-24 bg-neutral-100 dark:bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-xl mb-2 text-black dark:text-white">{item.name}</h3>
                    <p className="text-primary font-black text-lg">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-neutral-50 dark:bg-zinc-900/50 rounded-2xl p-2 border border-neutral-100 dark:border-zinc-800/50">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-colors text-black dark:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold w-6 text-center text-black dark:text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-colors text-black dark:text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl h-12 w-12 shrink-0 mb-4 sm:mb-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-none border border-neutral-200 dark:border-zinc-800/50 sticky top-24">
              <h2 className="text-2xl font-black mb-8 tracking-tighter text-black dark:text-white">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-bold text-neutral-500">
                  <span>Subtotal</span>
                  <span className="text-black dark:text-white">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-500">
                  <span>Shipping</span>
                  <span className="text-emerald-500">Free</span>
                </div>
                <div className="border-t border-neutral-100 dark:border-zinc-800/50 pt-6 mt-6 flex justify-between items-center">
                  <span className="font-black text-xl text-black dark:text-white uppercase tracking-tighter">Total</span>
                  <span className="font-black text-3xl text-primary">${total().toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg rounded-xl font-bold bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
                onClick={() => navigate('/checkout')}
              >
                Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
