import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle2, Crown, Users, BookOpen, GraduationCap, Award, Mail, Phone } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Membership = () => {
    const benefits = [
        { text: "Official Membership Certificate", icon: Award },
        { text: "Free publication of up to 5 articles per year", icon: BookOpen },
        { text: "Priority consideration in editorial and review-related activities", icon: Crown },
        { text: "Enhanced visibility for your academic and professional work", icon: Users },
        { text: "Connection with a multidisciplinary academic community", icon: GraduationCap },
    ];

    const eligibility = [
        "UG, PG and PhD students",
        "Researchers and academicians",
        "Scientists, professionals and subject experts",
        "Authors and science communicators"
    ];

    return (
        <>
            <Helmet>
                <title>Membership | AgriScience Research Journal</title>
                <meta name="description" content="Join our magazine community. Annual membership for academicians, researchers, and students." />
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
                                Invitation for Annual Membership
                            </h1>
                            <p className="text-primary-foreground/90 text-xl leading-relaxed max-w-2xl mx-auto">
                                Join Our Magazine Community. We warmly invite academicians, researchers, students and professionals to become Annual Members of our magazine and be part of a growing scholarly platform.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="section-spacing bg-background">
                    <div className="container-magazine">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">

                            {/* Membership Details */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-8"
                            >
                                {/* Benefits */}
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Crown className="text-primary w-6 h-6" />
                                        Membership Benefits
                                    </h2>
                                    <div className="grid gap-4">
                                        {benefits.map((benefit, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-lg bg-card shadow-sm border border-border">
                                                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <benefit.icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{benefit.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Eligibility */}
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Users className="text-primary w-6 h-6" />
                                        Who Can Apply?
                                    </h2>
                                    <div className="bg-secondary/50 rounded-xl p-6">
                                        <ul className="space-y-3">
                                            {eligibility.map((item, index) => (
                                                <li key={index} className="flex items-center gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                                    <span className="text-foreground/90">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pricing & CTA - Sticky */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lg:sticky lg:top-28"
                            >
                                <Card className="border-primary/20 shadow-elevated overflow-hidden relative">
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        Recommended
                                    </div>
                                    <CardHeader className="text-center bg-primary/5 pb-8 pt-10">
                                        <CardTitle className="text-2xl font-bold text-foreground">Annual Membership</CardTitle>
                                        <CardDescription className="text-lg mt-2">Valid for 1 Year</CardDescription>
                                        <div className="mt-4 flex items-center justify-center text-primary">
                                            <span className="text-4xl font-bold">₹1,000</span>
                                            <span className="ml-1 text-muted-foreground">/ only</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-6 md:p-8">
                                        <div className="text-center space-y-2">
                                            <h3 className="font-bold text-lg">How to Apply</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Simple 2-step process to join our community
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Complete Payment</p>
                                                    <p className="text-sm text-muted-foreground">Pay the membership fee of ₹1,000</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Share Details</p>
                                                    <p className="text-sm text-muted-foreground">Send your CV and payment proof via Email or WhatsApp</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 pt-4">
                                            <Button className="w-full gap-2" size="lg" asChild>
                                                <a href="mailto:editor@agricatalogues.in?subject=Annual Membership Application">
                                                    <Mail className="w-4 h-4" />
                                                    Email: editor@agricatalogues.in
                                                </a>
                                            </Button>
                                            <Button variant="outline" className="w-full gap-2" size="lg" asChild>
                                                <a href="https://wa.me/919148942104?text=I'm interested in Annual Membership" target="_blank" rel="noopener noreferrer">
                                                    <Phone className="w-4 h-4" />
                                                    WhatsApp: 9148942104
                                                </a>
                                            </Button>
                                        </div>

                                        <p className="text-center text-sm font-medium text-emerald-600">
                                            👉 Become a member today and publish, share and grow with us!
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default Membership;
