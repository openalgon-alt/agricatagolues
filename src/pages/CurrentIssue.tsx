import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import issueCover from '@/assets/current-issue-cover.jpg';

const articles = [
  {
    title: 'Climate-Resilient Crop Varieties: A Comprehensive Review of Drought-Tolerant Wheat Genotypes',
    authors: 'Mitchell, S., Chen, J., & Williams, R.',
    pages: '1-18',
    doi: '10.1234/agriscience.2024.001',
  },
  {
    title: 'Sustainable Soil Management Practices in Organic Farming Systems',
    authors: 'Chen, J., Santos, M., & Kumar, R.',
    pages: '19-35',
    doi: '10.1234/agriscience.2024.002',
  },
  {
    title: 'Digital Agriculture: IoT Applications in Precision Farming',
    authors: 'Santos, M., Park, K., & Thompson, L.',
    pages: '36-52',
    doi: '10.1234/agriscience.2024.003',
  },
  {
    title: 'Economic Impact of Sustainable Agriculture Policies in Developing Nations',
    authors: 'Williams, R., Okonkwo, E., & Mwangi, G.',
    pages: '53-71',
    doi: '10.1234/agriscience.2024.004',
  },
  {
    title: 'Integrated Pest Management Strategies for Smallholder Farms',
    authors: 'Okonkwo, E., Hassan, A., & Bergström, A.',
    pages: '72-88',
    doi: '10.1234/agriscience.2024.005',
  },
  {
    title: 'Advances in CRISPR Technology for Crop Improvement: A Critical Analysis',
    authors: 'Thompson, L., Tanaka, H., & Petrova, E.',
    pages: '89-112',
    doi: '10.1234/agriscience.2024.006',
  },
  {
    title: 'Water Conservation Techniques in Semi-Arid Agriculture Systems',
    authors: 'Hassan, A., Al-Hassan, F., & Diallo, A.',
    pages: '113-128',
    doi: '10.1234/agriscience.2024.007',
  },
];

const CurrentIssue = () => {
  return (
    <>
      <Helmet>
        <title>Current Issue - Volume 12, Issue 4 | AgriScience Research Journal</title>
        <meta 
          name="description" 
          content="Read the latest issue of AgriScience Research Journal (Volume 12, Issue 4, December 2024). Access peer-reviewed agricultural research articles on crop science, sustainable farming, and agribusiness." 
        />
        <link rel="canonical" href="https://agrisciencejournal.org/current-issue" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PublicationIssue",
            "issueNumber": "4",
            "datePublished": "2024-12",
            "isPartOf": {
              "@type": "PublicationVolume",
              "volumeNumber": "12",
              "isPartOf": {
                "@type": "Periodical",
                "name": "AgriScience Research Journal"
              }
            }
          })}
        </script>
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
                December 2024
              </span>
              <h1 className="text-primary-foreground mb-4">Current Issue</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Volume 12, Issue 4 — Featuring the latest peer-reviewed research in 
                agricultural science and sustainable farming practices.
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
                      src={issueCover}
                      alt="AgriScience Research Journal Volume 12 Issue 4 Cover - December 2024"
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="p-6">
                      <h2 className="font-display font-bold text-foreground text-xl mb-2">
                        Volume 12, Issue 4
                      </h2>
                      <p className="text-muted-foreground mb-4">December 2024</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        ISSN: 1234-5678 (Print)<br />
                        ISSN: 1234-5679 (Online)
                      </p>
                      <div className="space-y-3">
                        <Button className="w-full gap-2">
                          <Download className="w-4 h-4" />
                          Download Full Issue (PDF)
                        </Button>
                        <Button variant="outline" className="w-full gap-2" asChild>
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
                    {articles.map((article, index) => (
                      <motion.article
                        key={article.doi}
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
                              <a href={`#${article.doi}`} className="hover:underline">
                                {article.title}
                              </a>
                            </h3>
                            <p className="text-muted-foreground text-sm mb-3">
                              {article.authors}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span>Pages: {article.pages}</span>
                              <span className="flex items-center gap-1">
                                DOI: 
                                <a 
                                  href={`https://doi.org/${article.doi}`}
                                  className="text-primary hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {article.doi}
                                </a>
                              </span>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <Button size="sm" variant="outline" className="text-xs h-8">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Online
                              </Button>
                              <Button size="sm" variant="ghost" className="text-xs h-8">
                                <Download className="w-3 h-3 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
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
