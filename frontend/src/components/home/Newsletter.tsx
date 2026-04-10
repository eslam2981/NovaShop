import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="relative overflow-hidden py-32 mt-20">
      {/* Background Graphic Context */}
      <div className="absolute inset-0 bg-zinc-900 z-0" />
      <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-transparent z-10" />
      
      <div className="container px-4 mx-auto relative z-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl w-full"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-[2rem] bg-primary/20 backdrop-blur-md border border-primary/30 text-primary mb-8 shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)]">
            <Mail className="h-7 w-7" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tighter">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Exclusive.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Subscribe to our private mailing list. Gain early access to limited drops, architectural insights, and special invites.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="relative w-full">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="h-14 md:h-16 w-full text-lg bg-black/40 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full px-6 transition-all font-medium"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 md:h-16 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase tracking-wider">
              Unlock Access
            </Button>
          </form>
          
          <p className="text-xs text-white/40 mt-8 uppercase tracking-widest font-semibold">
            Unsubscribe at any moment. Zero spam guaranteed.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
