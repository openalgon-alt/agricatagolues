import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-wheat.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col">
      {/* Mock Test Notice Scrolling Banner - Dark Green */}
      <a href="/exam" target="_blank" rel="noopener noreferrer" className="block bg-forest text-white py-2 overflow-hidden relative z-40 w-full shrink-0 shadow-md border-b border-forest-light/30 hover:bg-forest/90 transition-colors cursor-pointer group">
        <div className="whitespace-nowrap animate-marquee flex items-center h-full">
            <span className="font-bold text-sm md:text-base mr-10 inline-flex items-center gap-2">
                <BellRing className="w-4 h-4 text-yellow-500 animate-[bounce_2s_infinite]" /> 
                Karnataka state agriculture practical mock test - 2026 is Live! 
                <span className="ml-2 bg-yellow-500 text-forest-light px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-yellow-400 transition-colors inline-block animate-[pulse_1.5s_infinite]">
                    Click Here
                </span>
            </span>
            <span className="font-bold text-sm md:text-base mr-10 inline-flex items-center gap-2" aria-hidden="true">
                <BellRing className="w-4 h-4 text-yellow-500 animate-[bounce_2s_infinite]" /> 
                Karnataka state agriculture practical mock test - 2026 is Live! 
                <span className="ml-2 bg-yellow-500 text-forest-light px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-yellow-400 transition-colors inline-block animate-[pulse_1.5s_infinite]">
                    Click Here
                </span>
            </span>
             <span className="font-bold text-sm md:text-base inline-flex items-center gap-2" aria-hidden="true">
                <BellRing className="w-4 h-4 text-yellow-500 animate-[bounce_2s_infinite]" /> 
                Karnataka state agriculture practical mock test - 2026 is Live! 
                <span className="ml-2 bg-yellow-500 text-forest-light px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider group-hover:bg-yellow-400 transition-colors inline-block animate-[pulse_1.5s_infinite]">
                    Click Here
                </span>
            </span>
        </div>
      </a>

      {/* Background Image Container */}
      <div className="absolute inset-0 top-10">
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
            <span className="inline-block py-1.5 px-4 rounded-full bg-amber-500/90 border border-amber-400 text-white font-bold tracking-wide mb-6 shadow-lg">
              ISSN: 3108-124X
            </span>
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
