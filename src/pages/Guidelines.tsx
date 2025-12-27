import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Shield, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Guidelines = () => {
  return (
    <>
      <Helmet>
        <title>Author Guidelines | AgriScience Research Journal</title>
        <meta 
          name="description" 
          content="Complete submission guidelines for AgriScience Research Journal. Learn about manuscript formatting, review process, publication ethics, and how to submit your agricultural research." 
        />
        <link rel="canonical" href="https://agrisciencejournal.org/guidelines" />
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
              <h1 className="text-primary-foreground mb-4">Guidelines for Authors</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Everything you need to know about submitting your research to AgriScience 
                Research Journal. Follow our guidelines to ensure a smooth publication process.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="section-spacing bg-background">
          <div className="container-magazine">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar Navigation */}
              <aside className="lg:col-span-1">
                <nav className="sticky top-24 space-y-2">
                  <p className="font-display font-bold text-foreground mb-4">Quick Links</p>
                  {[
                    { id: 'submit', label: 'Submission Process', icon: FileText },
                    { id: 'formatting', label: 'Formatting Guidelines', icon: CheckCircle },
                    { id: 'review', label: 'Review Policy', icon: Clock },
                    { id: 'ethics', label: 'Publication Ethics', icon: Shield },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </aside>

              {/* Main Content */}
              <article className="lg:col-span-3 space-y-12">
                {/* Submission Process */}
                <section id="submit" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-foreground text-2xl md:text-3xl">Submission Process</h2>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 md:p-8 shadow-subtle">
                    <p className="text-muted-foreground mb-6">
                      We welcome original research articles, review papers, and short communications 
                      in all areas of agricultural science. Follow these steps to submit your manuscript:
                    </p>
                    
                    <ol className="space-y-4">
                      {[
                        'Prepare your manuscript according to our formatting guidelines',
                        'Ensure all authors have reviewed and approved the final version',
                        'Write a cover letter addressing the editor-in-chief',
                        'Submit via email to submissions@agrisciencejournal.org',
                        'Receive confirmation within 48 hours of submission',
                      ].map((step, index) => (
                        <li key={index} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="text-foreground pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-8 p-4 bg-accent/20 rounded-lg">
                      <p className="text-sm text-foreground">
                        <strong>Need help?</strong> Contact our editorial office at{' '}
                        <Link to="/contact" className="text-primary hover:underline">
                          editor@agrisciencejournal.org
                        </Link>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Formatting Guidelines */}
                <section id="formatting" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-foreground text-2xl md:text-3xl">Formatting Guidelines</h2>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 md:p-8 shadow-subtle space-y-6">
                    <div>
                      <h3 className="font-display font-bold text-foreground text-xl mb-3">
                        General Requirements
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          File format: Microsoft Word (.docx) or LaTeX
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Font: Times New Roman, 12pt
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Line spacing: Double-spaced
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Margins: 1 inch on all sides
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Word limit: 6,000-8,000 words (excluding references)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-foreground text-xl mb-3">
                        Manuscript Structure
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Title page (title, authors, affiliations, corresponding author)
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Abstract (250-300 words)
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Keywords (5-7 relevant terms)
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Introduction, Materials & Methods, Results, Discussion
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">•</span>
                          Conclusion, Acknowledgments, References
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-foreground text-xl mb-3">
                        References
                      </h3>
                      <p className="text-muted-foreground">
                        Use APA 7th edition citation style. All references must be cited in the 
                        text and listed alphabetically in the reference section. DOIs should be 
                        included where available.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Review Policy */}
                <section id="review" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-foreground text-2xl md:text-3xl">Review Policy</h2>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 md:p-8 shadow-subtle">
                    <p className="text-muted-foreground mb-6">
                      All submissions undergo rigorous double-blind peer review to ensure the 
                      highest quality of published research.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: 'Initial Screening', duration: '1-2 weeks' },
                        { label: 'Peer Review', duration: '4-6 weeks' },
                        { label: 'Revision Period', duration: '2-4 weeks' },
                        { label: 'Final Decision', duration: '1-2 weeks' },
                      ].map((phase) => (
                        <div key={phase.label} className="p-4 bg-muted rounded-lg">
                          <p className="font-semibold text-foreground">{phase.label}</p>
                          <p className="text-sm text-muted-foreground">{phase.duration}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                      Average time from submission to first decision: <strong className="text-foreground">6-8 weeks</strong>
                    </p>
                  </div>
                </section>

                {/* Publication Ethics */}
                <section id="ethics" className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-foreground text-2xl md:text-3xl">Publication Ethics</h2>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 md:p-8 shadow-subtle space-y-6">
                    <p className="text-muted-foreground">
                      AgriScience Research Journal adheres to the highest standards of publication 
                      ethics as outlined by COPE (Committee on Publication Ethics).
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          title: 'Originality',
                          desc: 'All submissions must be original work not published or under consideration elsewhere.',
                        },
                        {
                          title: 'Plagiarism',
                          desc: 'All manuscripts are screened for plagiarism. Similarity above 15% may result in rejection.',
                        },
                        {
                          title: 'Authorship',
                          desc: 'All listed authors must have made substantial contributions to the research.',
                        },
                        {
                          title: 'Conflicts of Interest',
                          desc: 'Authors must disclose any financial or personal conflicts that could influence their work.',
                        },
                        {
                          title: 'Data Integrity',
                          desc: 'Authors must ensure the accuracy of data and may be asked to provide raw data upon request.',
                        },
                      ].map((item) => (
                        <div key={item.title} className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* CTA */}
                <div className="bg-primary rounded-xl p-8 text-center">
                  <h3 className="font-display font-bold text-primary-foreground text-2xl mb-4">
                    Ready to Submit Your Research?
                  </h3>
                  <p className="text-primary-foreground/80 mb-6">
                    Join our community of researchers advancing agricultural science.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="hero" size="lg" asChild>
                      <a href="mailto:submissions@agrisciencejournal.org" className="gap-2">
                        <Mail className="w-4 h-4" />
                        Submit Manuscript
                      </a>
                    </Button>
                    <Button variant="heroOutline" size="lg" asChild>
                      <Link to="/contact">Contact Editorial</Link>
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Guidelines;
