import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BookOpen,
    title: 'Peer-Reviewed Research',
    description: 'Rigorous double-blind peer review ensuring high-quality, credible publications.',
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with researchers, academicians, and professionals from 50+ countries.',
  },
  {
    icon: Globe,
    title: 'Open Access Options',
    description: 'Flexible publishing models to maximize research visibility and impact.',
  },
];

export const AboutSection = () => {
  return (
    <section className="section-spacing bg-background">
      <div className="container-magazine">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              About Our Journal
            </span>
            <h2 className="text-foreground mt-2 mb-6">
              Pioneering Agricultural Research Since 2012
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              AgriScience Research Journal is a leading peer-reviewed publication dedicated to 
              advancing agricultural science, sustainable farming practices, and food security research. 
              We provide a platform for researchers, academicians, policymakers, and industry 
              professionals to share groundbreaking discoveries and evidence-based solutions.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our journal covers diverse topics including crop science, soil management, 
              agricultural technology, climate-smart agriculture, agribusiness economics, 
              and rural development. We are committed to promoting research that addresses 
              global food challenges while supporting environmental sustainability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link to="/current-issue">Read Current Issue</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/guidelines">Author Guidelines</Link>
              </Button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex gap-4 p-6 bg-card rounded-xl shadow-subtle"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-xl mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { label: 'Impact Factor', value: '3.45' },
                { label: 'Acceptance Rate', value: '28%' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-display font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
