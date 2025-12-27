import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  slug: string;
  views?: number;
  featured?: boolean;
  index?: number;
}

export const ArticleCard = ({
  title,
  excerpt,
  author,
  date,
  category,
  slug,
  views,
  featured = false,
  index = 0,
}: ArticleCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`card-article group ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <Link to={`/article/${slug}`} className="block h-full">
        <div className={`p-6 h-full flex flex-col ${featured ? 'md:p-8' : ''}`}>
          {/* Category Badge */}
          <span className="inline-block self-start px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
            {category}
          </span>

          {/* Title */}
          <h3 className={`font-display font-bold text-foreground group-hover:text-primary transition-colors mb-3 ${
            featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
          }`}>
            {title}
          </h3>

          {/* Excerpt */}
          <p className={`text-muted-foreground mb-4 flex-1 ${
            featured ? 'text-base md:text-lg' : 'text-sm line-clamp-3'
          }`}>
            {excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {date}
              </span>
              {views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {views.toLocaleString()}
                </span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
