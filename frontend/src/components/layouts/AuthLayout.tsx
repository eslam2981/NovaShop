import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        {/* Darkening gradient for professional contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/80 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center -z-10" />

        <div className="relative z-10 w-full max-w-lg text-white drop-shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            <h1 className="text-6xl md:text-7xl font-black tracking-[0.05em] leading-tight mb-4 drop-shadow-lg text-white">
              NOVA<br />SHOP
            </h1>
            <div className="w-16 h-2 bg-primary mb-6 shadow-sm rounded-full shadow-primary/20" />
            <p className="text-xl text-white/90 font-bold tracking-wide">
              Redefining the art of digital commerce.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex w-full items-center justify-center bg-white dark:bg-zinc-950 p-8 lg:w-1/2">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h2 className="text-4xl font-black mb-3 tracking-tighter text-black dark:text-white">{title}</h2>
            <p className="text-base font-bold text-neutral-500 uppercase tracking-widest">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
