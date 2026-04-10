import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, Clock, TrendingUp } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Stats {
  overview?: {
    totalUsers?: number;
    totalProducts?: number;
    totalOrders?: number;
    totalRevenue?: number;
    pendingOrders?: number;
    completedOrders?: number;
  };
  growth?: {
    newUsers?: number;
    newOrders?: number;
  };
  salesData?: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  categoryData?: {
    name: any; // Can be a string or a populated Mongo object
    value: number;
  }[];
  recentOrders?: any[];
  topProducts?: any[];
  lowStockProducts?: any[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const SafeNumber = ({ value = 0, isCurrency = false }: { value?: number, isCurrency?: boolean }) => {
  const safeVal = Number(value || 0);
  if (isCurrency) {
    return <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.floor(safeVal))}</span>;
  }
  return <span>{new Intl.NumberFormat('en-US').format(Math.floor(safeVal))}</span>;
};

const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-lg">
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm text-neutral-500">
              <span className="font-medium text-black dark:text-white mr-1">{entry.name}:</span>
              {entry.name === 'Revenue' ? `$${Number(entry.value || 0).toLocaleString()}` : entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Dashboard Error:", error, errorInfo); }
  render() { 
    if (this.state.hasError) return (
      <div className="p-8 text-red-500 font-bold bg-white border border-red-500 rounded-xl m-8 shadow-2xl z-[999] relative">
        <h2 className="text-xl mb-4 text-black">React Crash Report</h2>
        <p className="font-mono text-sm break-words">{this.state.error?.toString() || 'Unknown Error'}</p>
        <p className="font-mono text-xs mt-4 text-neutral-500 break-words">{this.state.error?.stack?.substring(0, 500) || ''}</p>
      </div>
    ); 
    return this.props.children; 
  }
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response?.data?.data || {});
      } catch (error) {
        console.error('Failed to fetch stats', error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Gross Revenue',
      value: stats?.overview?.totalRevenue || 0,
      isCurrency: true,
      icon: DollarSign,
      color: 'from-emerald-400 to-emerald-600',
      bgLight: 'bg-emerald-500/10',
      bgIcon: 'text-emerald-500',
      growth: '+12.5% vs last month',
    },
    {
      label: 'Total Orders',
      value: stats?.overview?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-blue-400 to-blue-600',
      bgLight: 'bg-blue-500/10',
      bgIcon: 'text-blue-500',
      growth: `+${stats?.growth?.newOrders || 0} this month`,
    },
    {
      label: 'Active Customers',
      value: stats?.overview?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-400 to-purple-600',
      bgLight: 'bg-purple-500/10',
      bgIcon: 'text-purple-500',
      growth: `+${stats?.growth?.newUsers || 0} this month`,
    },
    {
      label: 'Product Catalog',
      value: stats?.overview?.totalProducts || 0,
      icon: Package,
      color: 'from-orange-400 to-orange-600',
      bgLight: 'bg-orange-500/10',
      bgIcon: 'text-orange-500',
      growth: `${stats?.lowStockProducts?.length || 0} items low stock`,
    },
  ];

  const salesDataReady = Array.isArray(stats?.salesData) && stats.salesData.length > 0;
  const categoryDataReady = Array.isArray(stats?.categoryData) && stats.categoryData.length > 0;

  return (
    <ErrorBoundary>
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full box-border">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight font-sans">Business Analytics</h1>
        <p className="text-neutral-500 font-medium">Real-time store telemetry and insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950 p-6 xl:p-8 shadow-sm border border-neutral-200 dark:border-zinc-800/50 group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20 transition-transform duration-500 group-hover:scale-110">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} blur-3xl`} />
            </div>
            
            <div className={`inline-flex items-center justify-center p-3 rounded-2xl ${stat.bgLight} ${stat.bgIcon} mb-6`}>
              <stat.icon className="h-6 w-6" />
            </div>
            
            <div className="flex flex-col relative z-10 box-border">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">{stat.label}</span>
              <span className="text-3xl xl:text-4xl font-black tracking-tighter text-black dark:text-white mb-4">
                <SafeNumber value={stat.value} isCurrency={stat.isCurrency} />
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span>{stat.growth}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm border border-neutral-200 dark:border-zinc-800/50 p-6 xl:p-8 overflow-hidden min-w-0">
          <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
          <div className="h-[300px] w-full min-w-0">
            <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-neutral-500 blur-sm">Chart Error</div>}>
              {salesDataReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">Not enough data to display</div>
              )}
            </ErrorBoundary>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm border border-neutral-200 dark:border-zinc-800/50 p-6 xl:p-8 flex flex-col min-w-0">
          <h3 className="text-lg font-bold mb-4">Revenue by Category</h3>
          <div className="flex-1 flex items-center justify-center h-[200px] min-w-0 relative">
            <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-neutral-500 blur-sm">Chart Error</div>}>
              {categoryDataReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {stats.categoryData?.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">Not enough data to display</div>
              )}
            </ErrorBoundary>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {(stats?.categoryData || []).map((category, index) => {
              const catName = typeof category?.name === 'object' ? category?.name?.name : category?.name;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-medium text-neutral-500 truncate">{String(catName || 'Unknown')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className="rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm border border-neutral-200 dark:border-zinc-800/50 p-6 xl:p-8 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-3 py-1 rounded-full">View All</span>
          </div>
          
          <div className="flex flex-col gap-3 min-w-0">
            {Array.isArray(stats?.recentOrders) && stats.recentOrders.map((order, idx) => {
              const firstItem = Array.isArray(order?.items) && order.items.length > 0 ? order.items[0] : null;
              let imageUrl = null;
              if (firstItem?.product?.images && Array.isArray(firstItem.product.images) && firstItem.product.images.length > 0) {
                imageUrl = firstItem.product.images[0];
              } else if (firstItem?.image) {
                imageUrl = firstItem.image;
              }

              return (
              <div key={idx} className="flex items-center justify-between p-3 xl:p-4 rounded-xl xl:rounded-2xl hover:bg-neutral-50 dark:hover:bg-zinc-900 border border-transparent transition-colors min-w-0">
                <div className="flex items-center gap-3 xl:gap-4 min-w-0">
                  <div className="h-10 w-10 xl:h-12 xl:w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs xl:text-sm overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Order Item" className="h-full w-full object-cover" />
                    ) : (
                      `#${order?._id?.slice(-4)?.toUpperCase() || 'ORD'}`
                    )}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="font-semibold text-sm xl:text-base truncate">{order?.user?.name || 'Guest User'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <p className="text-[10px] xl:text-xs text-neutral-500 truncate">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'New'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold mb-1 text-sm xl:text-base">${Number(order?.total || order?.totalAmount || 0).toFixed(2)}</p>
                  <span className={`text-[9px] xl:text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-full ${
                    ['COMPLETED', 'DELIVERED'].includes(order?.status) ? 'bg-emerald-500/10 text-emerald-500' :
                    order?.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                    order?.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
                    order?.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>{order?.status || 'UNKNOWN'}</span>
                </div>
              </div>
              )
            })}
            {(!Array.isArray(stats?.recentOrders) || stats.recentOrders.length === 0) && (
              <p className="text-sm text-neutral-500 py-4">No recent orders found.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm border border-neutral-200 dark:border-zinc-800/50 p-6 xl:p-8 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Inventory Alerts</h3>
            <div className="h-8 w-8 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-xs font-bold text-red-500">{Array.isArray(stats?.lowStockProducts) ? stats.lowStockProducts.length : 0}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-0">
            {Array.isArray(stats?.lowStockProducts) && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 xl:p-4 rounded-xl xl:rounded-2xl hover:bg-neutral-50 dark:hover:bg-zinc-900 border border-transparent transition-colors min-w-0">
                  <div className="flex items-center gap-3 xl:gap-4 min-w-0">
                    <img src={Array.isArray(product?.images) ? product.images[0] : 'https://via.placeholder.com/150'} alt="Item" className="h-10 w-10 xl:h-12 xl:w-12 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 overflow-hidden">
                      <p className="font-semibold text-sm xl:text-base truncate">{typeof product?.name === 'object' ? product?.name?.name : product?.name || 'Unknown Item'}</p>
                      <p className="text-[10px] xl:text-xs font-semibold text-neutral-500 mt-1 uppercase tracking-widest truncate">{typeof product?.category === 'object' ? product?.category?.name : product?.category || 'General'}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full text-xs xl:text-sm">
                      {product?.stock || 0} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center mx-auto">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                  <Package className="h-6 w-6" />
                </div>
                <p className="font-semibold">Inventory is healthy</p>
                <p className="text-neutral-500 text-xs">All products have sufficient stock levels.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
