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
            <span className="inline-block px-4 py-1.5 bg-accent/90 text-accent-foreground text-sm font-semibold rounded-full mb-6">
              Volume 12 • Issue 4 • December 2024
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-primary-foreground mb-6 leading-tight"
          >
            Advancing Agricultural Research for a Sustainable Future
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed"
          >
            AgriScience Journal publishes cutting-edge research in crop science, 
            soil management, sustainable agriculture, and agribusiness. Join our 
            community of researchers, academicians, and industry professionals.
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { value: '500+', label: 'Articles Published' },
              { value: '12', label: 'Years of Excellence' },
              { value: '50+', label: 'Countries Reached' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-display font-bold text-accent">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-primary-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
