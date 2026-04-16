import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { examDataService, MockTest, API_BASE_URL } from "@/services/examDataService";

export default function ExamList() {
    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadTests = async () => {
        try {
            // Fetch all tests (including inactive)
            const res = await fetch(`${API_BASE_URL}/api/mock-tests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeOnly: false })
            });
            const data = await res.json();
            setTests(data.map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                category: t.category,
                price: parseFloat(t.price ?? 0),
                isActive: t.is_active,
                imageUrl: t.image_url,
            })));
        } catch (error: any) {
            console.error("ExamList load error:", error);
            toast.error(`Load Error: ${error?.message || String(error)}`);
            // Add a giant red alert div for debugging if needed but toast should be enough
            setTests([{ id: 'error-debug', title: `ERROR: ${error?.message || String(error)}`, description: error?.stack || 'No stack trace', category: 'Error', price: 0, isActive: false }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    const handleDelete = async (id: number | string) => {
        if (!window.confirm("Delete this mock test and all its questions permanently?")) return;
        setActionLoading(String(id));
        try {
            await examDataService.deleteMockTest(id);
            toast.success("Mock test deleted");
            await loadTests();
        } catch (error) {
            toast.error("Failed to delete mock test");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Exams</h1>
                <Button asChild>
                    <Link to="/admin/exams/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Test
                    </Link>
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No mock tests found. Create your first one!
                                </TableCell>
                            </TableRow>
                        ) : (
                            tests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.title}</TableCell>
                                    <TableCell>{test.category || "-"}</TableCell>
                                    <TableCell>{test.price === 0 ? <Badge className="bg-green-500">Free</Badge> : `₹${test.price}`}</TableCell>
                                    <TableCell>
                                        {test.isActive
                                            ? <Badge className="bg-blue-500">Active</Badge>
                                            : <Badge variant="secondary">Inactive</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    {actionLoading === String(test.id) ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/admin/exams/${test.id}`}>Edit / Add Questions</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDelete(test.id)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
