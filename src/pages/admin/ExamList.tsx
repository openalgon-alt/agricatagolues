import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { MoreHorizontal, Plus, Loader2, BookOpen, GraduationCap, LayoutGrid, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { examDataService, MockTest, API_BASE_URL } from "@/services/examDataService";

// ─── Category constants ─────────────────────────────────────────────────────
const CATEGORY_ALL = "All";
const CATEGORY_PRACTICAL = "Practical Exam";
const CATEGORY_AO_AAO = "AO/AAO";

type ExamCategory = typeof CATEGORY_ALL | typeof CATEGORY_PRACTICAL | typeof CATEGORY_AO_AAO;

const categoryTabs: { label: string; value: ExamCategory; icon: React.ElementType; color: string; activeColor: string }[] = [
    {
        label: "All Exams",
        value: CATEGORY_ALL,
        icon: LayoutGrid,
        color: "text-gray-600 border-gray-200 hover:bg-gray-50",
        activeColor: "bg-gray-800 text-white border-gray-800",
    },
    {
        label: "Practical Exam",
        value: CATEGORY_PRACTICAL,
        icon: BookOpen,
        color: "text-green-700 border-green-200 hover:bg-green-50",
        activeColor: "bg-green-600 text-white border-green-600",
    },
    {
        label: "AO / AAO",
        value: CATEGORY_AO_AAO,
        icon: GraduationCap,
        color: "text-blue-700 border-blue-200 hover:bg-blue-50",
        activeColor: "bg-blue-600 text-white border-blue-600",
    },
];

export default function ExamList() {
    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    // Pre-select category from URL query ?category=AO%2FAAO or ?category=Practical+Exam
    const getInitialCategory = (): ExamCategory => {
        const cat = searchParams.get('category')?.trim();
        if (cat?.toUpperCase() === CATEGORY_AO_AAO.toUpperCase()) return CATEGORY_AO_AAO;
        if (cat?.toUpperCase() === CATEGORY_PRACTICAL.toUpperCase()) return CATEGORY_PRACTICAL;
        return CATEGORY_ALL;
    };

    const [selectedCategory, setSelectedCategory] = useState<ExamCategory>(getInitialCategory);

    const loadTests = async () => {
        try {
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
            setTests([{ id: 'error-debug', title: `ERROR: ${error?.message || String(error)}`, description: error?.stack || 'No stack trace', category: 'Error', price: 0, isActive: false }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    useEffect(() => {
        setSelectedCategory(getInitialCategory());
    }, [searchParams]);

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

    // Filter tests by selected category
    const filteredTests = selectedCategory === CATEGORY_ALL
        ? tests
        : tests.filter(t =>
            t.category?.trim().toUpperCase() === selectedCategory.toUpperCase()
        );

    // Counts for badge display
    const countAll = tests.length;
    const countPractical = tests.filter(t => t.category?.trim().toUpperCase() === CATEGORY_PRACTICAL.toUpperCase()).length;
    const countAoAao = tests.filter(t => t.category?.trim().toUpperCase() === CATEGORY_AO_AAO.toUpperCase()).length;

    const getCategoryCount = (cat: ExamCategory) => {
        if (cat === CATEGORY_ALL) return countAll;
        if (cat === CATEGORY_PRACTICAL) return countPractical;
        if (cat === CATEGORY_AO_AAO) return countAoAao;
        return 0;
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Manage Exams</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage all mock tests. Use the category tabs to filter by exam type.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/admin/exams/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Test
                    </Link>
                </Button>
            </div>

            {/* Exam Type Selector — the key feature! */}
            <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-gray-700">Select Exam Type to Display</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {categoryTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = selectedCategory === tab.value;
                        const count = getCategoryCount(tab.value);
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setSelectedCategory(tab.value)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all
                                    ${isActive ? tab.activeColor : tab.color}
                                `}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                                <span className={`
                                    inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full font-bold min-w-[20px]
                                    ${isActive ? "bg-white/25 text-inherit" : "bg-gray-100 text-gray-600"}
                                `}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Quick links to exam pages */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-dashed">
                    <span className="text-xs text-muted-foreground self-center">Preview exam pages →</span>
                    <a
                        href="/exam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        Practical Exam Page
                        <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                    <a
                        href="/exam/ao-aao"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                        <GraduationCap className="h-3.5 w-3.5" />
                        AO/AAO Exam Page
                        <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                </div>
            </div>

            {/* Tests Table */}
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
                        {filteredTests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    {selectedCategory === CATEGORY_ALL
                                        ? "No mock tests found. Create your first one!"
                                        : `No "${selectedCategory}" exams found. Create one or assign the category in the exam editor.`
                                    }
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.title}</TableCell>
                                    <TableCell>
                                        {test.category ? (
                                            <Badge
                                                className={
                                                    test.category.toUpperCase() === CATEGORY_AO_AAO.toUpperCase()
                                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                                        : test.category.toUpperCase() === CATEGORY_PRACTICAL.toUpperCase()
                                                            ? "bg-green-100 text-green-800 border-green-200"
                                                            : "bg-gray-100 text-gray-700"
                                                }
                                                variant="outline"
                                            >
                                                {test.category}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {test.price === 0
                                            ? <Badge className="bg-green-500">Free</Badge>
                                            : `₹${test.price}`
                                        }
                                    </TableCell>
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
