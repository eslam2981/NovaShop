import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Director',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: "NovaShop has completely redefined the standard for digital retail. The seamless intersection of aesthetic and functionality is simply unparalleled in today's market.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Tech Reviewer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    content: "An absolute masterclass in e-commerce. From the curated selection to the incredibly fluid interface, every detail feels meticulously engineered.",
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Interior Designer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    content: "The aesthetic curation is stunning. Every single piece I've acquired feels premium and immediately elevates the atmosphere of my spaces.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-white dark:bg-zinc-950 border-t border-neutral-200 dark:border-zinc-800/50">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none" />

      <div className="container px-4 mx-auto max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tighter text-black dark:text-white">
            Voices of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Excellence.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="p-10 rounded-[3rem] relative group flex flex-col items-center text-center md:items-start md:text-left bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800/50"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.7, type: "spring", stiffness: 100 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="flex items-center justify-center md:justify-start gap-1 mb-8 w-full">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-lg md:text-xl font-medium text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 border-t border-neutral-200 dark:border-zinc-800/50 pt-6 mt-auto w-full">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="h-14 w-14 rounded-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 shadow-md"
                />
                <div className="text-center md:text-left mt-2 md:mt-0">
                  <h4 className="font-black text-black dark:text-white uppercase tracking-wider">{testimonial.name}</h4>
                  <p className="text-xs font-bold text-neutral-500 tracking-[0.2em] uppercase">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
