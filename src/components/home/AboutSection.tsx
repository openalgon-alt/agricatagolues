import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BookOpen,
    title: 'Peer-Reviewed Research',
    description: 'Rigorous double-blind peer review ensuring high-quality, credible publications.',
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with researchers, academicians, and professionals from 50+ countries.',
  },
  {
    icon: Globe,
    title: 'Open Access Options',
    description: 'Flexible publishing models to maximize research visibility and impact.',
  },
];

export const AboutSection = () => {
  return (
    <section className="section-spacing bg-white">
      <div className="container-magazine">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Main Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[#1a365d] mt-2 mb-6 font-serif text-3xl font-bold border-l-4 border-[#c53030] pl-4">
              About the Magazine
            </h2>
            <p className="text-slate-700 text-lg mb-6 leading-relaxed text-justify">
              Agri Catalogues – An International Monthly Agriculture E-Magazine aims to serve as a comprehensive
              digital platform dedicated to agriculture and allied sciences. Our mission is to disseminate the
              latest advancements, innovative practices, research findings, market trends and success stories
              in the agricultural sector.
            </p>
            <p className="text-slate-700 mb-8 leading-relaxed text-justify">
              We strive to connect farmers, researchers, agri-entrepreneurs, policymakers and students by
              providing credible, insightful and practical information. The magazine seeks to promote sustainable
              farming, agri-innovation and knowledge exchange to empower stakeholders at every level. Through
              curated articles, expert opinions and interactive features, Agri Catalogues aspires to be a go-to
              resource for the evolving world of agriculture.
            </p>

            <a
              href="https://chat.whatsapp.com/DY9YdMyfufbLbexQfc2Tjc?mode=ems_copy%20%20_c%20"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-6 h-6" />
              Join Our WhatsApp Group
            </a>
          </motion.div>

          {/* Magazine Details Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="bg-[#1a365d] text-white p-4">
              <h3 className="text-xl font-bold font-serif">Magazine Details</h3>
            </div>
            <div className="divide-y divide-slate-200 text-sm">
              {[
                { label: "Title", value: "Agri Catalogues - An International Monthly Agriculture E-Magazine" },
                { label: "Frequency", value: "Monthly" },
                { label: "ISSN", value: "3108-124X" },
                { label: "Year of Starting", value: "2025" },
                { label: "Subject", value: "Agriculture and Allied Sciences" },
                { label: "Language", value: "English" },
                { label: "Mode of Publication", value: "Online" },
                { label: "Email", value: "editor@agricatalogues.in", isLink: true, href: "mailto:editor@agricatalogues.in" },
                { label: "Contact Number", value: "+91 9148942104", isLink: true, href: "tel:+919148942104" },
                { label: "Website", value: "https://agricatalogues.in/", isLink: true, href: "https://agricatalogues.in/" },
                { label: "Publisher Address", value: "Saddahalli, Palicherlu, Sidlaghatta- Chikkaballapur, 562105, Karnataka", isLink: true, href: "https://maps.app.goo.gl/CPvR3pLL13tmUA1u9?g_st=ac" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 hover:bg-slate-100 transition-colors">
                  <div className="p-3 font-semibold text-[#1a365d] sm:border-r border-slate-200 bg-slate-100/50">{row.label}</div>
                  <div className="p-3 sm:col-span-2 text-slate-700 break-words">
                    {row.isLink ? (
                      <a href={row.href} className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-100 border-t border-slate-200 text-center">
              <p className="font-bold text-[#1a365d] text-lg">Editorials</p>
              <p className="text-slate-600">editor@agricatalogues.in</p>
              <p className="text-slate-600">+91 9148942104</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
