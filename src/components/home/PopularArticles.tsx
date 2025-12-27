import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const popularArticles = [
  {
    title: 'Advances in CRISPR Technology for Crop Improvement',
    author: 'Dr. Lisa Thompson',
    views: 5420,
    category: 'Biotechnology',
    slug: 'crispr-crop-improvement',
  },
  {
    title: 'Water Conservation Techniques in Semi-Arid Agriculture',
    author: 'Prof. Ahmed Hassan',
    views: 4890,
    category: 'Irrigation',
    slug: 'water-conservation-techniques',
  },
  {
    title: 'Organic Certification Standards: A Global Comparison',
    author: 'Dr. Anna Bergström',
    views: 4567,
    category: 'Policy',
    slug: 'organic-certification-standards',
  },
  {
    title: 'Machine Learning Applications in Crop Disease Detection',
    author: 'Dr. Kevin Park',
    views: 4234,
    category: 'AgriTech',
    slug: 'ml-crop-disease-detection',
  },
  {
    title: 'Agroforestry Systems for Carbon Sequestration',
    author: 'Prof. Grace Mwangi',
    views: 3987,
    category: 'Climate',
    slug: 'agroforestry-carbon-sequestration',
  },
];

export const PopularArticles = () => {
  return (
    <section className="section-spacing bg-secondary">
      <div className="container-magazine">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-foreground mb-0">Most Read Articles</h2>
            <p className="text-muted-foreground">Top viewed research this month</p>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {popularArticles.map((article, index) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/article/${article.slug}`}
                className="group flex items-center gap-4 p-4 bg-card rounded-lg hover:shadow-elevated transition-all"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center font-display font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-primary font-semibold uppercase tracking-wide">
                    {article.category}
                  </span>
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-lg">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{article.author}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString()}
                </div>
                <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
