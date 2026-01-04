import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Key, Shirt, Box, PenTool, Type, ShoppingBag, Phone, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { dataService, Product } from '@/services/dataService';

const getIconForCategory = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('key')) return Key;
    if (cat.includes('shirt') || cat.includes('wear')) return Shirt;
    if (cat.includes('model') || cat.includes('3d')) return Box;
    if (cat.includes('drawing') || cat.includes('illustration')) return PenTool;
    if (cat.includes('chart') || cat.includes('alphabet')) return Type;
    return ShoppingBag;
};

const getColorForCategory = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('key')) return "bg-amber-100 text-amber-600";
    if (cat.includes('shirt')) return "bg-blue-100 text-blue-600";
    if (cat.includes('model')) return "bg-emerald-100 text-emerald-600";
    if (cat.includes('drawing')) return "bg-purple-100 text-purple-600";
    if (cat.includes('chart')) return "bg-rose-100 text-rose-600";
    return "bg-slate-100 text-slate-600";
};

// Fallback data if DB is empty 
const DEMO_PRODUCTS = [
    {
        title: "Insect Resin Key Chains",
        category: "Key Chain",
        description: "Realistic and artistic insect resin key chains",
        features: [
            "Ideal for gifts, collections and souvenirs",
            "Durable, lightweight and visually appealing"
        ]
    },
    {
        title: "Insect Printed T-Shirts",
        category: "T-Shirt",
        description: "High-quality T-shirts with insect designs and prints",
        features: [
            "Suitable for students, researchers and nature enthusiasts",
            "Available in multiple designs and sizes"
        ]
    },
    {
        title: "Insect 3D Images & Models",
        category: "3D Model",
        description: "Educational 3D insect images and models",
        features: [
            "Useful for teaching, learning, exhibitions, and displays",
            "Scientifically accurate and visually engaging"
        ]
    },
    {
        title: "Insect Drawings & Illustrations",
        category: "Illustration",
        description: "Hand-drawn and digital insect illustrations",
        features: [
            "Suitable for posters, presentations, books and decor",
            "Custom orders available on request"
        ]
    },
    {
        title: "Insect Alphabet Charts",
        category: "Chart",
        description: "Alphabet charts featuring insects (A-Z)",
        features: [
            "Best for schools, colleges, and early science education",
            "Colourful, informative and child-friendly designs"
        ]
    }
];

const Shop = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const dbProducts = await dataService.getProducts();
                if (dbProducts.length > 0) {
                    setProducts(dbProducts);
                } else {
                    setProducts(DEMO_PRODUCTS);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setProducts(DEMO_PRODUCTS);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <>
            <Helmet>
                <title>Shop | AgriCatalogues</title>
                <meta name="description" content="Discover our unique collection of insect-inspired educational and creative products. Key chains, T-shirts, models, and more." />
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
                                Shop from Us
                            </h1>
                            <p className="text-primary-foreground/90 text-xl leading-relaxed max-w-3xl mx-auto">
                                Discover our unique collection of insect-inspired educational and creative products, specially designed for students, educators, researchers and insect lovers.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="section-spacing bg-background">
                    <div className="container-magazine">

                        {/* Products Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                            {products.map((product, index) => {
                                const Icon = getIconForCategory(product.category);
                                const colorClass = getColorForCategory(product.category);

                                return (
                                    <motion.div
                                        key={product.id || product.title}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Card className="h-full flex flex-col hover:shadow-elevated transition-shadow duration-300 border-border/50 overflow-hidden">
                                            <div className={`h-48 flex items-center justify-center ${colorClass} mb-0 relative group`}>
                                                {/* Product Image or Icon */}
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Icon className="w-20 h-20 opacity-80" />
                                                )}
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold line-clamp-1">{product.title}</CardTitle>
                                                <CardDescription className="text-foreground/80 font-medium mt-2">
                                                    {product.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <ul className="space-y-2">
                                                    {(product.features || []).map((feature: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Button className="w-full gap-2" variant="outline" asChild>
                                                    <a href="https://wa.me/919148942104?text=I'm interested in ordering products" target="_blank" rel="noopener noreferrer">
                                                        <ShoppingBag className="w-4 h-4" />
                                                        Order Now
                                                    </a>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Contact / Order CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-secondary/30 rounded-3xl p-8 md:p-16 text-center border border-primary/10"
                        >
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Contact Us to Order</h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                For pricing, customization and bulk orders, feel free to contact us.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
                                <a href="tel:+919148942104" className="flex items-center gap-3 text-xl font-semibold hover:text-primary transition-colors bg-background px-6 py-4 rounded-xl shadow-sm border border-border">
                                    <Phone className="w-6 h-6 text-primary" />
                                    +91 9148942104
                                </a>
                                <a href="tel:+918555070247" className="flex items-center gap-3 text-xl font-semibold hover:text-primary transition-colors bg-background px-6 py-4 rounded-xl shadow-sm border border-border">
                                    <Phone className="w-6 h-6 text-primary" />
                                    +91 8555070247
                                </a>
                            </div>

                            <div className="inline-block px-6 py-2 rounded-full bg-primary/10 text-primary font-bold text-lg">
                                👉 Learn with insects. Wear science. Gift nature.
                            </div>
                        </motion.div>

                    </div>
                </section>
            </Layout>
        </>
    );
};

export default Shop;
