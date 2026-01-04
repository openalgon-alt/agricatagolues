import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { dataService, Issue } from '@/services/dataService';
import { Skeleton } from '@/components/ui/skeleton';

const Archives = () => {
  const [archives, setArchives] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const loadArchives = async () => {
    try {
      const data = await dataService.getIssues({ status: 'Archived' });
      setArchives(data);

      // Extract years
      const years = Array.from(new Set(data.map(i => i.year))).sort((a, b) => b - a);
      setAvailableYears(years);
    } catch (error) {
      console.error("Failed to load archives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();

    // Auto refresh logic
    const handleUpdate = () => loadArchives();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const filteredData = selectedYear
    ? archives.filter(item => item.year === selectedYear)
    : archives;

  if (loading) {
    return (
      <Layout>
        <div className="container-magazine py-20 space-y-8">
          <h1 className="text-3xl font-bold">Archives</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Archives | AgriScience Research Journal</title>
        <meta
          name="description"
          content="Browse the complete archive of AgriScience Research Journal. Access past issues featuring peer-reviewed agricultural research articles."
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
                Explore our collection of past published issues.
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
                {availableYears.map((year) => (
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
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No archives found.</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredData.map((item, index) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
                        className="group"
                      >
                        {/* We don't have detailed issue page yet, but could point to CurrentIssue with context or just re-use /current-issue if it supported ID params? 
                            Actually, 'CurrentIssue.tsx' reads from current. We might need '/issues/:id' public page.
                            For now, let's just make it NOT link anywhere or link to '#' as placeholder 
                            unless I update App.tsx to have a Public Issue View page.
                            Wait, the user requirement said "Each issue page lists all article PDFs".
                            So I DO need a public view for specific issues.
                            I can reuse 'CurrentIssue' component logic but for a specific ID.
                            Let's link to `/issues/${item.id}` and update App.tsx to handle it.
                        */}
                        <Link
                          to={`/issues/${item.id}`} // Need to implement this route!
                          className="block bg-card rounded-xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all"
                        >
                          <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center p-6 relative">
                            {item.coverImage ? (
                              <img src={item.coverImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <>
                                <Calendar className="w-12 h-12 text-primary/40 mb-4" />
                                <span className="text-4xl font-display font-bold text-primary">
                                  {item.month.slice(0, 3)}
                                </span>
                              </>
                            )}
                            <span className="text-lg text-muted-foreground z-10 bg-white/80 px-2 rounded">{item.year}</span>
                          </div>
                          <div className="p-4">
                            <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.articles?.length || 0} Articles
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
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: (index % 10) * 0.03 }}
                      >
                        <Link
                          to={`/issues/${item.id}`}
                          className="group flex items-center gap-4 bg-card rounded-lg p-4 shadow-subtle hover:shadow-elevated transition-all"
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                            {item.coverImage ? (
                              <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <span className="text-lg font-display font-bold text-primary">
                                  {item.month.slice(0, 3)}
                                </span>
                                <span className="text-xs text-muted-foreground">{item.year}</span>
                              </>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                              {item.title} ({item.month} {item.year})
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.articles?.length || 0} Articles
                            </p>
                          </div>
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Archives;
