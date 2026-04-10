import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService, Order } from '@/services/order';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await orderService.getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order tracking info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black mb-2 text-black dark:text-white">Order Not Found</h2>
        <p className="text-neutral-500 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/orders" className="text-primary font-bold hover:underline">Return to Orders</Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  
  const steps = [
    { id: 'PENDING', title: 'Order Placed', icon: Clock, description: 'We have received your order.' },
    { id: 'PROCESSING', title: 'Processing', icon: Package, description: 'Your order is being prepared.' },
    { id: 'SHIPPED', title: 'Shipped', icon: Truck, description: 'Your order is on the way.' },
    { id: 'DELIVERED', title: 'Delivered', icon: CheckCircle, description: 'Your order has been delivered.' },
  ];

  const currentStepIndex = isCancelled ? -1 : steps.findIndex(s => s.id === order.status);
  // Default to step 0 if pending, etc. Actually, it will match exact status.
  const activeStep = isCancelled ? -1 : (currentStepIndex >= 0 ? currentStepIndex : 0);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/50 dark:bg-zinc-950/50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/orders" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white mb-8 transition-colors font-semibold text-sm uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter text-black dark:text-white">Track Order</h1>
          <p className="text-neutral-500 font-medium">Order #{order.id.slice(-6).toUpperCase()}</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200 dark:border-zinc-800/50 mb-8 overflow-hidden relative">
          
          {/* Glassmorphic decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          {isCancelled ? (
            <div className="text-center py-12 relative z-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-black dark:text-white mb-2">Order Cancelled</h3>
              <p className="text-neutral-500 font-medium max-w-sm mx-auto">This order has been cancelled and cannot be tracked.</p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between relative mt-8 md:mt-12 mb-8">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-1 bg-neutral-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                {steps.map((step, index) => {
                  const isCompleted = index <= activeStep;
                  const isCurrent = index === activeStep;
                  const Icon = step.icon;

                  return (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex flex-row md:flex-col items-center md:text-center mb-8 md:mb-0 relative z-10 group"
                    >
                      {/* Mobile Line */}
                      {index !== steps.length - 1 && (
                        <div className="md:hidden absolute top-[60px] left-[28px] bottom-[-20px] w-1 bg-neutral-100 dark:bg-zinc-900 overflow-hidden">
                          <motion.div 
                            className="w-full bg-gradient-to-b from-primary to-blue-500"
                            initial={{ height: '0%' }}
                            animate={{ height: isCompleted ? '100%' : '0%' }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      )}

                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 mb-0 md:mb-4 transition-all duration-500 border-4 ${
                        isCompleted 
                          ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' 
                          : 'bg-white dark:bg-zinc-950 border-neutral-100 dark:border-zinc-800 text-neutral-400 dark:text-neutral-600'
                      }`}>
                        <Icon className={`w-6 h-6 ${isCurrent && 'animate-pulse'}`} />
                      </div>

                      <div className="ml-6 md:ml-0 flex-1 md:w-32">
                        <h4 className={`font-black text-base md:text-lg mb-1 ${
                          isCompleted ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-neutral-600'
                        }`}>{step.title}</h4>
                        <p className={`text-xs font-medium ${
                          isCompleted ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-300 dark:text-neutral-700'
                        }`}>{step.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details Snippet */}
        <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-6 md:p-8 shadow-sm border border-neutral-200 dark:border-zinc-800/50">
          <h3 className="font-black text-xl mb-6 text-black dark:text-white tracking-tighter">Order Summary</h3>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-zinc-800/50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-zinc-900 rounded-lg overflow-hidden shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-black dark:text-white">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-neutral-500 font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-black text-sm">
                  ${Number(item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-zinc-800/50 flex justify-between items-center">
            <span className="font-bold text-neutral-500 uppercase tracking-widest text-xs">Total</span>
            <span className="text-2xl font-black text-black dark:text-white">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
