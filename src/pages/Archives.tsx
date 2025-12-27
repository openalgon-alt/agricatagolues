import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText, ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const years = [2024, 2023, 2022, 2021, 2020, 2019];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const generateArchiveData = () => {
  const data: { year: number; month: string; issue: number; volume: number; articleCount: number }[] = [];
  let issueCounter = 48;
  
  years.forEach((year) => {
    const volume = year - 2012;
    for (let i = 11; i >= 0; i--) {
      if (year === 2024 && i > 11) continue;
      data.push({
        year,
        month: months[i],
        issue: (i % 4) + 1,
        volume,
        articleCount: Math.floor(Math.random() * 5) + 6,
      });
      issueCounter--;
    }
  });
  
  return data;
};

const archiveData = generateArchiveData();

const Archives = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredData = selectedYear 
    ? archiveData.filter(item => item.year === selectedYear)
    : archiveData;

  return (
    <>
      <Helmet>
        <title>Archives | AgriScience Research Journal</title>
        <meta 
          name="description" 
          content="Browse the complete archive of AgriScience Research Journal. Access past issues from 2012 to present, featuring peer-reviewed agricultural research articles." 
        />
        <link rel="canonical" href="https://agrisciencejournal.org/archives" />
      </Helmet>
      <Layout>
        {/* Header */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container-magazine">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-primary-foreground mb-4">Archives</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Explore our complete collection of published issues dating back to 2012. 
                Access cutting-edge agricultural research from leading experts worldwide.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-secondary border-b border-border">
          <div className="container-magazine">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Year Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedYear === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedYear(null)}
                >
                  All Years
                </Button>
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Archive Grid/List */}
        <section className="section-spacing bg-background">
          <div className="container-magazine">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map((item, index) => (
                  <motion.article
                    key={`${item.year}-${item.month}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
                    className="group"
                  >
                    <Link
                      to={`/archives/${item.year}/${item.month.toLowerCase()}`}
                      className="block bg-card rounded-xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all"
                    >
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center p-6">
                        <Calendar className="w-12 h-12 text-primary/40 mb-4" />
                        <span className="text-4xl font-display font-bold text-primary">
                          {item.month.slice(0, 3)}
                        </span>
                        <span className="text-lg text-muted-foreground">{item.year}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                          Volume {item.volume}, Issue {item.issue}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.articleCount} Articles
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((item, index) => (
                  <motion.article
                    key={`${item.year}-${item.month}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: (index % 10) * 0.03 }}
                  >
                    <Link
                      to={`/archives/${item.year}/${item.month.toLowerCase()}`}
                      className="group flex items-center gap-4 bg-card rounded-lg p-4 shadow-subtle hover:shadow-elevated transition-all"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-lg font-display font-bold text-primary">
                          {item.month.slice(0, 3)}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.year}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.month} {item.year}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Volume {item.volume}, Issue {item.issue} • {item.articleCount} Articles
                        </p>
                      </div>
                      <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No archives found for the selected filters.</p>
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Archives;
