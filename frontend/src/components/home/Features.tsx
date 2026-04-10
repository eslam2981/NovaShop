import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';
import { slideUp } from '@/lib/animations';

const features = [
  {
    icon: Truck,
    title: 'Global Delivery',
    description: 'Lightning fast worldwide shipping on all orders over $100.',
    colSpan: 'md:col-span-2',
    bg: 'bg-neutral-100 dark:bg-zinc-900',
    text: 'text-black dark:text-white',
    iconGlow: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShieldCheck,
    title: 'Absolute Security',
    description: 'Military-grade encryption for all your transactions.',
    colSpan: 'md:col-span-1',
    bg: 'bg-white dark:bg-zinc-950',
    border: 'border border-neutral-200 dark:border-zinc-800/50',
    text: 'text-black dark:text-white',
    iconGlow: 'from-emerald-500 to-teal-500'
  },
  {
    icon: RefreshCw,
    title: 'Seamless Returns',
    description: '30-day money-back guarantee. No questions asked.',
    colSpan: 'md:col-span-1',
    bg: 'bg-white dark:bg-zinc-950',
    border: 'border border-neutral-200 dark:border-zinc-800/50',
    text: 'text-black dark:text-white',
    iconGlow: 'from-orange-500 to-amber-500'
  },
  {
    icon: Headphones,
    title: '24/7 Concierge',
    description: 'Dedicated support team ready to assist you anytime, anywhere.',
    colSpan: 'md:col-span-2',
    bg: 'bg-primary/10',
    text: 'text-black dark:text-white',
    iconGlow: 'from-primary to-purple-500'
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.div 
          className="mb-16 flex flex-col items-center text-center md:items-start md:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tighter text-black dark:text-white">
            Expect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Excellence.</span>
          </h2>
          <p className="text-xl text-neutral-500 max-w-xl font-medium">
            We don't just sell products, we deliver an uncompromising premium experience from checkout to your doorstep.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={slideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 0.98,
                transition: { duration: 0.4, ease: 'easeOut' }
              }}
              className={`${feature.colSpan} ${feature.bg} ${feature.text} ${feature.border || 'border border-transparent'} p-10 rounded-[3rem] flex flex-col justify-between overflow-hidden relative group`}
            >
              {/* Subtle gradient overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${feature.iconGlow} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none`} />

              <motion.div 
                className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md bg-white/50 dark:bg-black/20 shadow-sm mx-auto md:mx-0 border border-white/20 dark:border-zinc-800`}
              >
                <feature.icon className="h-8 w-8" />
              </motion.div>
              
              <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                <h3 className="text-2xl font-black mb-2.5 tracking-tight">
                  {feature.title}
                </h3>
                <p className="opacity-70 text-lg leading-relaxed max-w-[90%] font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
