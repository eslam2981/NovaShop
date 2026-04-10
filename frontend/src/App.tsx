import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from './lib/animations';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import OrdersPage from './pages/Orders';
import Wishlist from './pages/Wishlist';
import AdminLayout from './components/layouts/AdminLayout';
import MainLayout from './components/layouts/MainLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminOrders from './pages/admin/Orders';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes wrapped in MainLayout */}
        <Route path="/" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><Home /></MainLayout>
          </motion.div>
        } />
        <Route path="/products" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><ProductList /></MainLayout>
          </motion.div>
        } />
        <Route path="/products/:id" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><ProductDetails /></MainLayout>
          </motion.div>
        } />
        <Route path="/cart" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><CartPage /></MainLayout>
          </motion.div>
        } />
        <Route path="/checkout" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><Checkout /></MainLayout>
          </motion.div>
        } />
        <Route path="/orders" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><OrdersPage /></MainLayout>
          </motion.div>
        } />
        
        {/* Auth Routes (No Layout or Custom Layout) */}
        <Route path="/login" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Login />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Register />
          </motion.div>
        } />
        <Route path="/wishlist" element={
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <MainLayout><Wishlist /></MainLayout>
          </motion.div>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import ScrollToTop from './components/ScrollToTop';
import { ThemeSync } from './components/ThemeSync';
import { useThemeStore, resolveDark } from './store/themeStore';

function ThemedToaster() {
  const preference = useThemeStore((s) => s.preference);
  const dark = resolveDark(preference);
  return <Toaster position="top-center" richColors theme={dark ? 'dark' : 'light'} />;
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <ThemeSync />
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300">
        <AnimatedRoutes />
        <ThemedToaster />
      </div>
    </Router>
  );
}

export default App;
