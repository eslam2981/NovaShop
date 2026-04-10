import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService, Order } from '@/services/order';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': 
      case 'COMPLETED': return 'text-emerald-500 bg-emerald-500/10 border-transparent';
      case 'SHIPPED': return 'text-cyan-500 bg-cyan-500/10 border-transparent';
      case 'PROCESSING': return 'text-blue-500 bg-blue-500/10 border-transparent';
      case 'PENDING': return 'text-orange-500 bg-orange-500/10 border-transparent';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10 border-transparent';
      default: return 'text-neutral-500 bg-neutral-500/10 border-transparent';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED': return CheckCircle;
      case 'SHIPPED': return Package;
      case 'PROCESSING': 
      case 'PENDING': return Clock;
      case 'CANCELLED': return XCircle;
      default: return Package;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/50 dark:bg-zinc-950/50 py-12 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter text-black dark:text-white text-center">My Orders</h1>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm rounded-[2rem] animate-pulse border border-neutral-200 dark:border-zinc-800/50" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-950/80 backdrop-blur-xl rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 shadow-xl shadow-black/5 dark:shadow-none">
            <Package className="h-16 w-16 mx-auto text-neutral-300 dark:text-zinc-700 mb-6" />
            <h3 className="text-2xl font-black text-black dark:text-white mb-2">No orders yet</h3>
            <p className="text-neutral-500 font-medium">Start shopping to see your orders here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-950 rounded-[2rem] p-6 md:p-8 shadow-sm border border-neutral-200 dark:border-zinc-800/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-neutral-100 dark:border-zinc-800/50">
                    <div>
                      <div className="text-xs font-bold text-neutral-500 mb-1 uppercase tracking-widest">Order #{String(order.id).slice(0, 8)}</div>
                      <div className="font-black text-xl">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="font-bold text-xs uppercase tracking-widest">{order.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                        <div className="h-16 w-16 bg-neutral-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-zinc-800/50">
                          {item.product?.images?.[0]?.url ? (
                            <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-bold font-sans">IMG</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-base md:text-lg">{item.product?.name || 'Product'}</div>
                          <div className="text-sm font-semibold text-neutral-500">Qty: <span className="text-black dark:text-white">{item.quantity}</span></div>
                        </div>
                        <div className="font-black text-lg">${Number(item.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-50 dark:bg-zinc-900/30 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-[2rem]">
                    <div>
                      <span className="block font-bold text-neutral-500 uppercase tracking-widest text-xs mb-1">Total Amount</span>
                      <span className="text-2xl md:text-3xl font-black text-black dark:text-white">${Number(order.total).toFixed(2)}</span>
                    </div>
                    {order.status !== 'CANCELLED' && (
                      <Link 
                        to={`/orders/track/${order.id}`}
                        className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg w-full sm:w-auto text-center"
                      >
                        Track Order
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
