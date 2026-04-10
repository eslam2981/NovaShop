import { useEffect, useState } from 'react';
import api from '@/services/api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, MapPin, CreditCard } from 'lucide-react';

interface Order {
  id: string;
  user: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  shippingAddress: string; // JSON string
  items: any[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
      case 'SHIPPED': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'PROCESSING': return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
      case 'CANCELLED': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'PENDING': return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400';
      default: return 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight font-sans">Orders Management</h1>
        <p className="text-neutral-500 font-medium">Review and process customer orders.</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-neutral-200 dark:border-zinc-800/50 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/50 dark:bg-zinc-900/30 border-b border-neutral-200 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5 font-bold tracking-wider">Order ID</th>
                <th className="px-6 py-5 font-bold tracking-wider">Customer</th>
                <th className="px-6 py-5 font-bold tracking-wider">Date</th>
                <th className="px-6 py-5 font-bold tracking-wider">Total</th>
                <th className="px-6 py-5 font-bold tracking-wider">Payment</th>
                <th className="px-6 py-5 font-bold tracking-wider">Shipping</th>
                <th className="px-8 py-5 font-bold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-zinc-800/50">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-neutral-500 font-medium">No orders found.</td></tr>
              ) : orders.map((order) => {
                const userName = typeof order.user === 'object' ? order.user?.name : order.user;
                const userEmail = typeof order.user === 'object' ? order.user?.email : 'N/A';
                return (
                <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-primary">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col min-w-0 max-w-[200px]">
                      <span className="font-bold text-black dark:text-white truncate">{typeof userName === 'string' ? userName : 'Guest'}</span>
                      <span className="text-xs text-neutral-500 truncate">{typeof userEmail === 'string' ? userEmail : ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-neutral-600 dark:text-neutral-400">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-5 font-black text-base text-black dark:text-white">${Number(order.total).toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm font-bold">{order.paymentMethod || 'CASH'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400" title={order.shippingAddress}>
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="text-xs truncate max-w-[150px] font-medium font-mono">
                        {order.shippingAddress ? parseAddress(order.shippingAddress) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className={`w-[130px] rounded-full border-0 font-bold text-xs uppercase tracking-wider h-9 ${getStatusBadge(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-xl">
                        <SelectItem value="PENDING" className="font-bold hover:bg-neutral-100">PENDING</SelectItem>
                        <SelectItem value="PROCESSING" className="font-bold hover:bg-neutral-100">PROCESSING</SelectItem>
                        <SelectItem value="SHIPPED" className="font-bold hover:bg-neutral-100">SHIPPED</SelectItem>
                        <SelectItem value="DELIVERED" className="font-bold hover:bg-neutral-100">DELIVERED</SelectItem>
                        <SelectItem value="CANCELLED" className="font-bold hover:bg-neutral-100">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
