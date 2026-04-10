import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    queryName: 'Electronics',
    image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200',
    description: 'Immersive sound and cutting-edge devices.',
    className: 'md:col-span-2 md:row-span-2 h-[500px]',
  },
  {
    id: 'fashion',
    name: 'Clothing',
    queryName: 'Clothing',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
    description: 'Curated fashion pieces.',
    className: 'md:col-span-1 md:row-span-1 h-[240px]',
  },
  {
    id: 'home',
    name: 'Home',
    queryName: 'Home',
    image: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?auto=format&fit=crop&q=80&w=800',
    description: 'Minimalist interior objects.',
    className: 'md:col-span-1 md:row-span-1 h-[240px]',
  },
  {
    id: 'sports',
    name: 'Sports',
    queryName: 'Sports',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800',
    description: 'High-performance gear.',
    className: 'md:col-span-2 md:row-span-1 h-[240px]',
  },
];

const Categories = () => {
  return (
    <section className="py-32 bg-white dark:bg-zinc-950">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center text-center md:text-left md:items-end mb-16 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-4 tracking-tighter text-black dark:text-white">Collections.</h2>
            <p className="text-xl text-neutral-500 max-w-md font-medium">Discover categories crafted carefully for mode</p>
          </div>
          <Link to="/products" className="hidden md:inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={category.id} to={`/products?category=${encodeURIComponent(category.queryName)}`} className={category.className}>
              <motion.div
                className="group relative w-full h-full rounded-[2rem] overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:from-black/90" />
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-110"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 sm:p-10 text-center md:text-left items-center md:items-start">
                  <h3 className="text-3xl font-black tracking-tight text-white mb-3 transform transition-transform duration-300 group-hover:-translate-y-2">{category.name}</h3>
                  <div className="overflow-hidden">
                    <p className="text-white/80 text-lg transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out font-medium">
                      {category.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
          <Link to="/products" className="md:hidden mt-6 inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            View All Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
