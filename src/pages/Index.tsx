import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { LatestArticles } from '@/components/home/LatestArticles';
import { PopularArticles } from '@/components/home/PopularArticles';
import { AboutSection } from '@/components/home/AboutSection';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AgriScience Research Journal | Peer-Reviewed Agricultural Research</title>
        <meta 
          name="description" 
          content="AgriScience Research Journal publishes peer-reviewed agricultural research on crop science, sustainable farming, soil management, and agribusiness. Access cutting-edge research from global experts." 
        />
        <meta name="keywords" content="agricultural research, crop science, sustainable agriculture, farming research, agribusiness, soil management, peer-reviewed journal" />
        <link rel="canonical" href="https://agrisciencejournal.org" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Periodical",
            "name": "AgriScience Research Journal",
            "description": "A peer-reviewed academic journal dedicated to advancing agricultural research and sustainable farming practices worldwide.",
            "url": "https://agrisciencejournal.org",
            "publisher": {
              "@type": "Organization",
              "name": "AgriScience Publications"
            },
            "issn": "1234-5678"
          })}
        </script>
      </Helmet>
      <Layout>
        <HeroSection />
        <LatestArticles />
        <PopularArticles />
        <AboutSection />
      </Layout>
    </>
  );
};

export default Index;
