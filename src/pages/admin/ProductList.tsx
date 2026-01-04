import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash, Package, Loader2 } from 'lucide-react';
import { dataService, Product } from '@/services/dataService';
import { useToast } from '@/components/ui/use-toast';

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await dataService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products:", error);
            toast({
                title: "Error",
                description: "Failed to load products.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await dataService.deleteProduct(id);
            toast({
                title: "Success",
                description: "Product deleted successfully."
            });
            loadProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast({
                title: "Error",
                description: "Failed to delete product.",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shop Products</h1>
                    <p className="text-muted-foreground">Manage your shop items</p>
                </div>
                <Button asChild>
                    <Link to="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No products found. Add one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    className="w-12 h-12 object-cover rounded-md bg-muted"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.title}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {product.category || 'Uncategorized'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                            {product.description}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to={`/admin/products/${product.id}`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(product.id, product.title)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductList;
