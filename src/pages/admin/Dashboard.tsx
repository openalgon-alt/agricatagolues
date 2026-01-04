import { useEffect, useState } from "react";
import { dataService, Issue } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Archive, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        current: null as Issue | null,
        archived: 0,
        drafts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const issues = await dataService.getIssues();
                const current = await dataService.getCurrentIssue();

                setStats({
                    total: issues.length,
                    current: current || null,
                    archived: issues.filter(i => i.status === 'Archived').length,
                    drafts: issues.filter(i => i.status === 'Draft').length
                });
            } catch (error) {
                console.error("Failed to load stats");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button asChild>
                    <Link to="/admin/issues/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Issue
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Issue</CardTitle>
                        <Radio className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.current ? `${stats.current.month} ${stats.current.year}` : "None"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.current ? stats.current.title : "No active issue"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Archived</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.archived}</div>
                        <p className="text-xs text-muted-foreground">
                            Past issues available
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-8 border-t">
                <div className="flex items-center justify-between p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                    <div>
                        <h3 className="font-bold">Debug / Maintenance</h3>
                        <p className="text-sm">Use this to clear all local data if you are facing synchronization issues.</p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (window.confirm("Are you sure? This will wipe ALL issues and articles.")) {
                                dataService.resetData();
                                window.location.reload();
                            }
                        }}
                    >
                        Reset System Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
