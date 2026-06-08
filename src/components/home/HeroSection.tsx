import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-wheat.jpg';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export const HeroSection = () => {
  const { activeExam, isLoading } = useSiteSettings();

  // Banner config driven by global setting
  const bannerConfig = !isLoading && activeExam === 'ao-aao'
    ? {
        href: '/exam/ao-aao',
        text: 'AO / AAO Agriculture Officer Mock Test Series - 2026 is Now Live!',
        badgeClass: 'bg-blue-400 text-white group-hover:bg-blue-300',
        bellClass: 'text-blue-300',
      }
    : {
        href: '/exam',
        text: 'Karnataka Agriculture Practical Mock Test - 2026 is Live!',
        badgeClass: 'bg-yellow-500 text-forest-light group-hover:bg-yellow-400',
        bellClass: 'text-yellow-500',
      };

  return (
    <section className="relative min-h-[85vh] flex flex-col">
      {/* Scrolling Banner — content driven by active exam setting */}
      <div className="block bg-forest text-white py-1.5 sm:py-2 overflow-hidden relative z-40 w-full shrink-0 shadow-md border-b border-forest-light/30">
        <div className="whitespace-nowrap animate-marquee flex items-center h-full">
          {/* Repeat 4× for seamless loop */}
          {[...Array(4)].map((_, i) => (
            <a
              key={i}
              href={bannerConfig.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-xs sm:text-sm md:text-base mr-10 sm:mr-16 inline-flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity group"
              aria-hidden={i > 0 ? "true" : undefined}
            >
              <BellRing className={`w-3 h-3 sm:w-4 sm:h-4 ${bannerConfig.bellClass} animate-[bounce_2s_infinite] shrink-0`} />
              {bannerConfig.text}
              <span className={`ml-1 sm:ml-2 ${bannerConfig.badgeClass} px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors inline-block animate-[pulse_1.5s_infinite]`}>
                Start Free
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Background Image */}
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
