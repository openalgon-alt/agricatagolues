import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import issueCover from '@/assets/current-issue-cover.jpg'; // Default/Fallback
import { dataService, Issue } from '@/services/dataService';
import { Skeleton } from '@/components/ui/skeleton';

const CurrentIssue = () => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIssue = async () => {
    try {
      const current = await dataService.getCurrentIssue();
      setIssue(current || null);
    } catch (error) {
      console.error("Failed to fetch current issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();

    // Listen for updates from other tabs (Admin)
    const handleStorageChange = () => fetchIssue();
    window.addEventListener('storage', handleStorageChange);

    // Also poll on focus to be super sure
    const onFocus = () => fetchIssue();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container-magazine py-20 space-y-8">
          <Skeleton className="h-40 w-full mb-8" />
          <div className="grid lg:grid-cols-3 gap-12">
            <Skeleton className="h-[400px] lg:col-span-1" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!issue) {
    return (
      <Layout>
        <div className="container-magazine py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">No Current Issue Published</h1>
          <p className="text-muted-foreground mb-8">Please check back later or view our archives.</p>
          <Button asChild>
            <Link to="/archives">View Archives</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Current Issue - {issue.title} | AgriScience Research Journal</title>
        <meta
          name="description"
          content={`Read the latest issue: ${issue.title} (${issue.month} ${issue.year}). ${issue.description}`}
        />
        <link rel="canonical" href="https://agrisciencejournal.org/current-issue" />
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
              <span className="inline-block px-4 py-1.5 bg-accent/90 text-accent-foreground text-sm font-semibold rounded-full mb-4">
                {issue.month} {issue.year}
              </span>
              <h1 className="text-primary-foreground mb-4">Current Issue</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                {issue.title} — {issue.description || "Featuring the latest peer-reviewed research."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Issue Content */}
        <section className="section-spacing bg-background">
          <div className="container-magazine">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cover & Info */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-24">
                  <div className="bg-card rounded-xl overflow-hidden shadow-elevated">
                    <img
                      src={issue.coverImage || issueCover}
                      alt={`${issue.title} Cover`}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="p-6">
                      <h2 className="font-display font-bold text-foreground text-xl mb-2">
                        {issue.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">{issue.month} {issue.year}</p>

                      <div className="space-y-3">
                        <Button className="w-full gap-2" variant="outline" asChild>
                          <Link to="/archives">
                            View Past Issues
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>

              {/* Table of Contents */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="font-display font-bold text-foreground text-2xl mb-8">
                    Table of Contents
                  </h2>

                  <div className="space-y-4">
                    {issue.articles?.map((article, index) => (
                      <motion.article
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group bg-card rounded-xl p-6 shadow-subtle hover:shadow-elevated transition-all"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-foreground text-lg group-hover:text-primary transition-colors mb-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-3">
                              {article.authors}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2">
                              {article.affiliation && (
                                <span>{article.affiliation}</span>
                              )}
                            </div>
                            <div className="flex gap-3 mt-4">
                              {article.pdfUrl ? (
                                <Button size="sm" variant="ghost" className="text-xs h-8" asChild>
                                  <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3 h-3 mr-1" />
                                    PDF
                                  </a>
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">PDF Coming Soon</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                    {(!issue.articles || issue.articles.length === 0) && (
                      <p className="text-muted-foreground italic">No articles listed in this issue yet.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default CurrentIssue;
