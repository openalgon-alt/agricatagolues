import { useEffect, useState } from "react";
import { dataService, Issue } from "@/services/dataService";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

export default function IssueList() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadIssues = async () => {
        try {
            const data = await dataService.getIssues();
            setIssues(data);
        } catch (error) {
            toast.error("Failed to load issues");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIssues();
    }, []);

    const handlePublish = async (id: string) => {
        setActionLoading(id);
        try {
            await dataService.publishIssue(id);
            toast.success("Issue published successfully");
            await loadIssues();
        } catch (error) {
            toast.error("Failed to publish issue");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this issue?")) return;

        setActionLoading(id);
        try {
            await dataService.deleteIssue(id);
            toast.success("Issue deleted");
            await loadIssues();
        } catch (error) {
            toast.error("Failed to delete issue");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Current':
                return <Badge className="bg-green-500">Current</Badge>;
            case 'Archived':
                return <Badge variant="secondary">Archived</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Issues</h1>
                <Button asChild>
                    <Link to="/admin/issues/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New
                    </Link>
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Issue Title</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Published Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No issues found. Create your first one!
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue) => (
                                <TableRow key={issue.id}>
                                    <TableCell className="font-medium">{issue.title}</TableCell>
                                    <TableCell>{issue.month} {issue.year}</TableCell>
                                    <TableCell>{getStatusBadge(issue.status)}</TableCell>
                                    <TableCell>
                                        {issue.publishDate ? format(new Date(issue.publishDate), "MMM d, yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    {actionLoading === issue.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/admin/issues/${issue.id}`}>Edit Details</Link>
                                                </DropdownMenuItem>
                                                {issue.status !== 'Current' && (
                                                    <DropdownMenuItem onClick={() => handlePublish(issue.id)}>
                                                        Publish as Current
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDelete(issue.id)}
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
