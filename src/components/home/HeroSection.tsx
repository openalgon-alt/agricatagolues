import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-wheat.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Golden wheat field stretching to the horizon under morning light - representing agricultural research and sustainable farming"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>

      {/* Content */}
      <div className="container-magazine relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge removed to match new clean look or can be kept if desired. Keeping empty for now */}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-primary-foreground mb-6 leading-tight font-serif"
          >
            Agri Catalogues - An International Monthly Agriculture E-Magazine
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed font-light"
          >
            Your trusted source for agriculture articles. We serve as a comprehensive digital platform dedicated to agriculture and allied sciences, connecting farmers, researchers, and policymakers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/current-issue" className="gap-2">
                <BookOpen className="w-5 h-5" />
                Read Current Issue
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/guidelines" className="gap-2">
                Submit Manuscript
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>


        </div>
      </div>
    </section>
  );
};
