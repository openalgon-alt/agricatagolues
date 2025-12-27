import { ArticleCard } from './ArticleCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const articles = [
  {
    title: 'Climate-Resilient Crop Varieties: A Comprehensive Review of Drought-Tolerant Wheat Genotypes',
    excerpt: 'This study examines the genetic diversity and adaptation mechanisms of wheat varieties developed for arid and semi-arid regions, highlighting promising cultivars for climate change mitigation.',
    author: 'Dr. Sarah Mitchell',
    date: 'Dec 15, 2024',
    category: 'Crop Science',
    slug: 'climate-resilient-wheat',
    views: 2340,
    featured: true,
  },
  {
    title: 'Sustainable Soil Management Practices in Organic Farming Systems',
    excerpt: 'An analysis of soil health indicators and regenerative practices that improve long-term agricultural productivity.',
    author: 'Prof. James Chen',
    date: 'Dec 12, 2024',
    category: 'Soil Science',
    slug: 'sustainable-soil-management',
    views: 1890,
  },
  {
    title: 'Digital Agriculture: IoT Applications in Precision Farming',
    excerpt: 'Exploring the role of sensor networks and data analytics in optimizing resource use and crop yields.',
    author: 'Dr. Maria Santos',
    date: 'Dec 10, 2024',
    category: 'AgriTech',
    slug: 'digital-agriculture-iot',
    views: 1567,
  },
  {
    title: 'Economic Impact of Sustainable Agriculture Policies',
    excerpt: 'A policy analysis examining the financial implications of transitioning to sustainable farming methods.',
    author: 'Dr. Robert Williams',
    date: 'Dec 8, 2024',
    category: 'Agribusiness',
    slug: 'economic-impact-sustainable',
    views: 1234,
  },
  {
    title: 'Integrated Pest Management Strategies for Smallholder Farms',
    excerpt: 'Cost-effective and environmentally friendly approaches to pest control for resource-limited farming operations.',
    author: 'Dr. Emily Okonkwo',
    date: 'Dec 5, 2024',
    category: 'Plant Protection',
    slug: 'integrated-pest-management',
    views: 1102,
  },
];

export const LatestArticles = () => {
  return (
    <section className="section-spacing bg-background">
      <div className="container-magazine">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-foreground mb-2">Latest Research Articles</h2>
            <p className="text-muted-foreground text-lg">
              Explore our most recent peer-reviewed publications
            </p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0" asChild>
            <Link to="/archives" className="gap-2">
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <ArticleCard key={article.slug} {...article} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
