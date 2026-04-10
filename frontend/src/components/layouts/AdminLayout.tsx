import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, FolderTree, Tag, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  const navItems = [
    { icon: LayoutDashboard, label: 'Analytics', path: '/admin' },
    { icon: Package, label: 'Inventory', path: '/admin/products' },
    { icon: FolderTree, label: 'Collections', path: '/admin/categories' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Tag, label: 'Promotions', path: '/admin/coupons' },
    { icon: Users, label: 'Customers', path: '/admin/users' },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-8">
        <Logo className="h-10 w-10 shrink-0 drop-shadow-md" animate={false} />
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">NovaShop</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Admin Portal</p>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      </div>

      <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="block relative group">
              {isActive && (
                <motion.div
                  layoutId="active-admin-nav"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl border border-primary/20 dark:border-primary/30"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}>
                <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="tracking-wide text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-3xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@novashop.com'}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start rounded-xl h-10 border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 font-semibold">
                <Home className="mr-2 h-4 w-4" /> Storefront
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="w-full justify-start rounded-xl h-10 font-semibold"
              onClick={async () => {
                try {
                  await authService.logout();
                } catch (error) {
                  console.error('Logout error', error);
                }
                logout();
                navigate('/login', { state: { fromLogout: true } });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#050505] theme-transition font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-neutral-200 dark:border-neutral-800/50 bg-white dark:bg-[#0a0a0a] shadow-sm md:flex z-10 relative">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="flex md:hidden h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl px-4 z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold tracking-tight">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Global Action Header (Desktop Only) */}
        <header className="hidden md:flex h-20 items-center justify-end px-8 border-b border-neutral-200 dark:border-neutral-800/50 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer (Strictly Scoped) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md md:hidden block"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[100] flex w-[85vw] max-w-[320px] flex-col border-r border-neutral-800 bg-white dark:bg-[#09090b] shadow-[0_0_50px_rgba(0,0,0,0.5)] md:hidden"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-50 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
