import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const boardMembers = [
  {
    name: 'Dr. Margaret Thompson',
    designation: 'Editor-in-Chief',
    institution: 'University of Agricultural Sciences, USA',
    expertise: 'Crop Physiology & Plant Breeding',
  },
  {
    name: 'Prof. Hiroshi Tanaka',
    designation: 'Associate Editor',
    institution: 'Tokyo Agricultural University, Japan',
    expertise: 'Sustainable Agriculture & Soil Science',
  },
  {
    name: 'Dr. Fatima Al-Hassan',
    designation: 'Associate Editor',
    institution: 'King Abdullah University, Saudi Arabia',
    expertise: 'Arid Land Agriculture & Water Management',
  },
  {
    name: 'Prof. Jean-Pierre Dubois',
    designation: 'Section Editor',
    institution: 'INRAE, France',
    expertise: 'Agricultural Economics & Policy',
  },
  {
    name: 'Dr. Oluwaseun Adeyemi',
    designation: 'Section Editor',
    institution: 'University of Ibadan, Nigeria',
    expertise: 'Tropical Agriculture & Food Security',
  },
  {
    name: 'Prof. Maria Gonzalez',
    designation: 'Section Editor',
    institution: 'Universidad Nacional Autónoma de México',
    expertise: 'Agroecology & Biodiversity',
  },
  {
    name: 'Dr. Rajesh Kumar',
    designation: 'Advisory Board Member',
    institution: 'Indian Agricultural Research Institute',
    expertise: 'Plant Pathology & Integrated Pest Management',
  },
  {
    name: 'Prof. Elena Petrova',
    designation: 'Advisory Board Member',
    institution: 'Russian Academy of Sciences',
    expertise: 'Agricultural Biotechnology & Genetics',
  },
  {
    name: 'Dr. Chen Wei',
    designation: 'Advisory Board Member',
    institution: 'China Agricultural University',
    expertise: 'Precision Agriculture & AgriTech',
  },
  {
    name: 'Prof. Sarah van der Berg',
    designation: 'Advisory Board Member',
    institution: 'Wageningen University, Netherlands',
    expertise: 'Climate-Smart Agriculture',
  },
  {
    name: 'Dr. Michael O\'Brien',
    designation: 'Statistical Advisor',
    institution: 'University of Melbourne, Australia',
    expertise: 'Agricultural Statistics & Data Science',
  },
  {
    name: 'Prof. Amara Diallo',
    designation: 'Advisory Board Member',
    institution: 'Université Cheikh Anta Diop, Senegal',
    expertise: 'Livestock Management & Animal Science',
  },
];

const EditorialBoard = () => {
  return (
    <>
      <Helmet>
        <title>Editorial Board | AgriScience Research Journal</title>
        <meta 
          name="description" 
          content="Meet the distinguished editorial board of AgriScience Research Journal. Our editors are leading experts in agricultural science, crop research, and sustainable farming from institutions worldwide." 
        />
        <link rel="canonical" href="https://agrisciencejournal.org/editorial-board" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "AgriScience Journal Editorial Board",
            "itemListElement": boardMembers.map((member, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Person",
                "name": member.name,
                "jobTitle": member.designation,
                "affiliation": {
                  "@type": "Organization",
                  "name": member.institution
                }
              }
            }))
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
              <h1 className="text-primary-foreground mb-4">Editorial Board</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Our distinguished editorial board comprises leading experts in agricultural 
                science from prestigious institutions around the world.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Board Members Grid */}
        <section className="section-spacing bg-background">
          <div className="container-magazine">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers.map((member, index) => (
                <motion.article
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-card rounded-xl p-6 shadow-subtle hover:shadow-elevated transition-shadow"
                  itemScope
                  itemType="https://schema.org/Person"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-display font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-display font-bold text-foreground text-lg mb-1"
                        itemProp="name"
                      >
                        {member.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm mb-2" itemProp="jobTitle">
                        {member.designation}
                      </p>
                      <p 
                        className="text-muted-foreground text-sm mb-2"
                        itemProp="affiliation"
                      >
                        {member.institution}
                      </p>
                      <p className="text-xs text-muted-foreground/80 italic">
                        {member.expertise}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default EditorialBoard;
