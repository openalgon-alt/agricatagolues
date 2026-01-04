import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Upload } from 'lucide-react';
import { dataService, Product } from '@/services/dataService';
import { useToast } from '@/components/ui/use-toast';

const ProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [featuresText, setFeaturesText] = useState(''); // Handle features as newline-separated string
    const [price, setPrice] = useState('');
    const [displayOrder, setDisplayOrder] = useState('0');

    const isNew = !id;

    useEffect(() => {
        if (!isNew) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            // Need dataService.getProductById?
            // Actually I didn't add that to the interface, but I can use getProducts and find.
            // Or better, add getProductById to dataService? No, I added getProducts.
            // The list view fetches all. I can just fetch all and find, or assume the user came from the list.
            // But direct access needs a fetch.
            // Efficiency: Since I didn't add updateProductById in previous step, I should rely on getProducts or add it.
            // I'll just use getProducts().find() for now since the list is small (simpler than editing service again).
            // Wait, this is `ProductEditor`. If I reload the page, I need to fetch.
            // I'll fetch all products and find the one.
            const products = await dataService.getProducts();
            const product = products.find(p => p.id === id);

            if (product) {
                setTitle(product.title);
                setDescription(product.description);
                setCategory(product.category || '');
                setImageUrl(product.imageUrl || '');
                setFeaturesText((product.features || []).join('\n'));
                setPrice(product.price ? product.price.toString() : '');
                setDisplayOrder(product.displayOrder.toString());
            } else {
                toast({ title: "Error", description: "Product not found", variant: "destructive" });
                navigate('/admin/products');
            }
        } catch (error) {
            console.error("Failed to load product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const features = featuresText.split('\n').filter(f => f.trim() !== '');
            const productData: Partial<Product> = {
                title,
                description,
                category,
                imageUrl,
                features,
                price: price ? parseFloat(price) : undefined,
                displayOrder: parseInt(displayOrder) || 0
            };

            if (!isNew && id) {
                productData.id = id;
            }

            await dataService.saveProduct(productData);

            toast({
                title: "Success",
                description: `Product ${isNew ? 'created' : 'updated'} successfully.`
            });
            navigate('/admin/products');
        } catch (error) {
            console.error("Failed to save product:", error);
            toast({
                title: "Error",
                description: "Failed to save product.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Reusing member image upload or generic file upload
            const url = await dataService.uploadMemberImage(file); // Reusing this as it does generally what we want (image to bucket)
            setImageUrl(url);
            toast({ title: "Success", description: "Image uploaded successfully" });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({ title: "Error", description: "Image upload failed", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    if (loading && !isNew) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{isNew ? 'Add Product' : 'Edit Product'}</h1>
                    <p className="text-muted-foreground">{isNew ? 'Create a new item for your shop' : 'Update existing product details'}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Insect Resin Key Chains"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Key Chain, T-Shirt"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Short)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the product"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="features">Features (One per line)</Label>
                            <Textarea
                                id="features"
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                placeholder="• Ideal for gifts&#10;• Durable material"
                                rows={5}
                            />
                            <p className="text-xs text-muted-foreground">Enter each feature on a new line.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="image">Product Image</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="image"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="Image URL"
                                    />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => document.getElementById('imageUpload')?.click()}
                                            disabled={uploading}
                                        >
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                {imageUrl && (
                                    <div className="mt-2 w-32 h-32 rounded-md border overflow-hidden bg-muted">
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Product
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductEditor;
