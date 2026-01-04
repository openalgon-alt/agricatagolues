import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Book, FileText, Lightbulb, Star, Users, ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const PublishWithUs = () => {
    const services = [
        {
            title: "Book Publishing",
            icon: Book,
            description: "Publication of academic, scientific and popular science books",
            features: [
                "Suitable for students, researchers, teachers and professionals",
                "Affordable and transparent pricing",
                "Support for ISBN registration, cover design, formatting and editing",
                "Print and digital (e-book) publishing options",
                "Wide academic and online distribution support"
            ]
        },
        {
            title: "Research & Review Paper Assistance",
            icon: FileText,
            description: "Guidance in writing, structuring and improving manuscripts",
            features: [
                "Support for research articles, review papers and popular articles",
                "Language editing and formatting as per journal or magazine standards",
                "Ethical and plagiarism-check guidance",
                "Suitable for UG, PG, PhD scholars and early-career researchers"
            ]
        },
        {
            title: "Patent Support & Assistance",
            icon: Lightbulb,
            description: "Assistance in idea documentation and patent drafting",
            features: [
                "Support in preparing patent specifications and technical descriptions",
                "Guidance for Indian and international patent filing procedures",
                "Ideal for innovators, researchers, startups and institutions"
            ]
        }
    ];

    const whyChooseUs = [
        "Affordable publication services for all disciplines",
        "Author-friendly and transparent process",
        "Dedicated editorial and technical support",
        "Timely processing and professional handling",
        "Focus on knowledge dissemination over profit"
    ];

    const whoCanPublish = [
        "Students and research scholars",
        "Academicians and scientists",
        "Innovators and entrepreneurs",
        "Independent authors and institutions"
    ];

    return (
        <>
            <Helmet>
                <title>Publish With Us | AgriCatalogues</title>
                <meta name="description" content="Publish your books, research papers, and patents with AgriCatalogues. Affordable services for academicians, researchers, and students." />
            </Helmet>
            <Layout>
                {/* Hero Section */}
                <section className="bg-primary py-16 md:py-24">
                    <div className="container-magazine text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto"
                        >
                            <h1 className="text-primary-foreground mb-6 font-display font-bold text-3xl md:text-5xl">
                                Publish with Us
                            </h1>
                            <p className="text-primary-foreground/90 text-xl leading-relaxed max-w-3xl mx-auto">
                                We invite academicians, researchers, students, and professionals to publish with us and transform their ideas, research, and innovations into impactful publications. We are committed to quality publishing at affordable costs, with end-to-end support throughout the publication journey.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="section-spacing bg-background">
                    <div className="container-magazine">

                        {/* Services Grid */}
                        <div className="grid md:grid-cols-3 gap-8 mb-20">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                                        <CardHeader>
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                                <service.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
                                            <CardDescription className="text-base mt-2">{service.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {service.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2.5">
                                                        <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1" />
                                                        <span className="text-sm text-foreground/80">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Why & Who Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
                                    <Star className="text-amber-500 w-8 h-8 fill-current" />
                                    Why Publish with Us?
                                </h2>
                                <div className="space-y-4">
                                    {whyChooseUs.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                                            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                            <span className="font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
                                    <Users className="text-blue-500 w-8 h-8" />
                                    Who Can Publish with Us?
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {whoCanPublish.map((item, index) => (
                                        <div key={index} className="flex items-center justify-center text-center p-6 rounded-lg bg-card border border-border shadow-sm hover:border-primary/30 transition-colors h-full">
                                            <span className="font-medium text-lg">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* CTA Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 relative z-10">Get Started Today</h2>
                            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto relative z-10">
                                Publish your knowledge. Protect your ideas. Share your research with the world.
                                Our editorial team will guide you at every step.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Button size="xl" variant="secondary" className="w-full sm:w-auto gap-2" asChild>
                                    <a href="mailto:editor@agricatalogues.com?subject=Publication Inquiry">
                                        <Mail className="w-5 h-5" />
                                        Email: editor@agricatalogues.com
                                    </a>
                                </Button>
                                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                                    <a href="https://wa.me/919148942104?text=I'm interested in publishing" target="_blank" rel="noopener noreferrer">
                                        <Phone className="w-5 h-5" />
                                        WhatsApp: 9148942104
                                    </a>
                                </Button>
                            </div>
                        </motion.div>

                    </div>
                </section>
            </Layout>
        </>
    );
};

export default PublishWithUs;
