import { useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, Heart, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { bounce } from '@/lib/animations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: ReactNode;
}

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl theme-transition"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl">
          <Logo className="h-10 w-10 shrink-0 drop-shadow-md" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">NovaShop</span>
        </Link>

        <motion.div
          className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/" className={`relative py-2 transition-colors hover:text-black dark:hover:text-white ${isActive('/') ? 'text-black dark:text-white' : ''}`}>
            Home
            {isActive('/') && (
              <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary drop-shadow-[0_0_8px_rgba(100,100,255,0.8)]" />
            )}
          </Link>
          <Link to="/products" className={`relative py-2 transition-colors hover:text-black dark:hover:text-white ${isActive('/products') ? 'text-black dark:text-white' : ''}`}>
            Shop
            {isActive('/products') && (
              <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary drop-shadow-[0_0_8px_rgba(100,100,255,0.8)]" />
            )}
          </Link>
          <Link to="/orders" className={`relative py-2 transition-colors hover:text-black dark:hover:text-white ${isActive('/orders') ? 'text-black dark:text-white' : ''}`}>
            Orders
            {isActive('/orders') && (
              <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary drop-shadow-[0_0_8px_rgba(100,100,255,0.8)]" />
            )}
          </Link>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Link to="/wishlist">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
          <Link to="/cart">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      variants={bounce}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-950 shadow-2xl border border-neutral-200 dark:border-zinc-800/50 rounded-2xl">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/orders')}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={async () => {
                  try {
                    await authService.logout();
                  } catch (error) {
                    console.error('Logout error', error);
                  }
                  logout();
                  navigate('/login', { state: { fromLogout: true } });
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm">Login</Button>
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm">Sign Up</Button>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[100] flex w-[80vw] max-w-[320px] flex-col bg-white dark:bg-zinc-950 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-l border-neutral-200 dark:border-zinc-800/50 md:hidden p-6"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-zinc-800/50">
                <span className="font-black text-2xl tracking-tight">NovaShop</span>
                <Button variant="outline" size="icon" className="rounded-full bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-black uppercase tracking-widest p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-center ${isActive('/') ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-500'}`}>Home</Link>
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-black uppercase tracking-widest p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-center ${isActive('/products') ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-500'}`}>Shop Collection</Link>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-black uppercase tracking-widest p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-center ${isActive('/orders') ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-500'}`}>My Orders</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-zinc-800/50 bg-neutral-50 dark:bg-zinc-950 py-20 text-neutral-500 theme-transition">
      <div className="container mx-auto px-4">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-6 flex items-center gap-3 text-2xl font-black text-black dark:text-white">
              <Logo className="h-10 w-10 shrink-0 drop-shadow-md" animate={false} />
              <span>NovaShop</span>
            </div>
            <p className="text-sm leading-relaxed font-medium max-w-xs">
              Premium products, secure checkout, and support that respects your time.
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-black dark:text-white">Shop</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li>
                <Link to="/products" className="transition-colors hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition-colors hover:text-primary">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="transition-colors hover:text-primary">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-black dark:text-white">Support</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li>
                <Link to="/orders" className="transition-colors hover:text-primary">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="transition-colors hover:text-primary">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-black dark:text-white">Newsletter</h3>
            <p className="mb-4 text-sm font-medium">Offers and new arrivals, no spam.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-3 text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
              />
              <Button size="default" className="shrink-0 rounded-full font-bold px-6">
                Join
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-zinc-800/50 pt-10 text-center text-xs font-bold uppercase tracking-widest text-neutral-500">
          © 2026 NovaShop. Developed by Eslam Gamil.
        </div>
      </div>
    </footer>
  );
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 theme-transition">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
