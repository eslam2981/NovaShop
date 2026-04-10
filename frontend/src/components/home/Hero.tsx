import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef, useState } from 'react';
import { productService } from '@/services/product';

const AnimatedNumber = ({ value, suffix = "", decimals = 0, format = false }: { value: number, suffix?: string, decimals?: number, format?: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(val) {
          let formattedValue = val.toFixed(decimals);
          if (format && decimals === 0) {
            formattedValue = new Intl.NumberFormat('en-US').format(Math.floor(val));
          }
          setDisplay(formattedValue);
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, decimals, format]);

  return <span ref={ref}>{display}{suffix}</span>;
};

const Hero = () => {
  const { user } = useAuthStore();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 300]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [stats, setStats] = useState({ productsCount: 0, usersCount: 0 });

  useEffect(() => {
    productService.getPublicStats()
      .then(data => {
        setStats(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="relative min-h-[95vh] w-full overflow-hidden bg-white dark:bg-zinc-950 flex flex-col justify-end pb-12 lg:pb-24">
      {/* Background Image Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0 origin-top"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop')" }}
        />
        {/* Soft, ultra-premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 dark:to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto md:px-8 mt-48 lg:mt-64 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase mb-8 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>The Premium Collection 2026</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.9] text-black dark:text-white mb-6">
            Future of <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Commerce.</span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl font-medium leading-relaxed mb-10">
            A curated selection of the world's most stunning pieces. Redefining digital retail with unmatched quality and exceptional design.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full sm:w-auto">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-bold">
                Explore Collection <ShoppingBag className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl border-2 hover:bg-foreground/5 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                  Join Exclusive <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Floating Stats Glass Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col gap-8 p-8 md:p-10 rounded-[3rem] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl min-w-[320px]"
        >
          {[
            { label: 'Curated Products', component: <AnimatedNumber value={stats.productsCount} suffix="+" format={true} /> },
            { label: 'Active Members', component: <AnimatedNumber value={stats.usersCount} suffix="+" format={true} /> },
            { label: 'Global Satisfaction', component: <AnimatedNumber value={4.9} suffix="/5" decimals={1} /> },
          ].map((stat, index) => (
             <div key={index} className="flex flex-col">
               <span className="text-4xl xl:text-5xl font-black text-black dark:text-white mb-2">{stat.component}</span>
               <span className="text-sm font-bold tracking-[0.2em] text-neutral-500 uppercase">{stat.label}</span>
             </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
