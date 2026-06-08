import { useEffect, useState } from "react";
import { dataService, Issue } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Archive, Radio, BookOpen, GraduationCap, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings, ActiveExam } from "@/context/SiteSettingsContext";
import { toast } from "sonner";

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        current: null as Issue | null,
        archived: 0,
        drafts: 0
    });
    const [loading, setLoading] = useState(true);
    const { activeExam, setActiveExam, isLoading: settingsLoading } = useSiteSettings();
    const [saving, setSaving] = useState(false);

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

    const handleExamSwitch = async (exam: ActiveExam) => {
        if (exam === activeExam || saving) return;
        setSaving(true);
        try {
            await setActiveExam(exam);
            toast.success(
                exam === "practical"
                    ? "✅ Switched to Practical Exam portal"
                    : "✅ Switched to AO/AAO Exam portal",
                { description: "The exam page, banner & popup will now show the selected exam." }
            );
        } catch (e) {
            toast.error("Failed to update exam setting");
        } finally {
            setSaving(false);
        }
    };

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

    const examOptions: {
        id: ActiveExam;
        label: string;
        sublabel: string;
        icon: React.ElementType;
        activeGradient: string;
        activeBorder: string;
        activeText: string;
        inactiveBg: string;
        inactiveBorder: string;
        inactiveText: string;
        badgeText: string;
        badgeBg: string;
        previewUrl: string;
    }[] = [
        {
            id: "practical",
            label: "Practical Exam",
            sublabel: "Karnataka Ag-B.Sc Practical Mock Test 2026",
            icon: BookOpen,
            activeGradient: "from-green-500 to-green-700",
            activeBorder: "border-green-400",
            activeText: "text-white",
            inactiveBg: "bg-white",
            inactiveBorder: "border-gray-200",
            inactiveText: "text-gray-700",
            badgeText: "LIVE",
            badgeBg: "bg-green-500",
            previewUrl: "/exam",
        },
        {
            id: "ao-aao",
            label: "AO / AAO Exam",
            sublabel: "Agriculture Officer / Asst. Agriculture Officer 2026",
            icon: GraduationCap,
            activeGradient: "from-blue-500 to-blue-700",
            activeBorder: "border-blue-400",
            activeText: "text-white",
            inactiveBg: "bg-white",
            inactiveBorder: "border-gray-200",
            inactiveText: "text-gray-700",
            badgeText: "NEW",
            badgeBg: "bg-blue-500",
            previewUrl: "/exam/ao-aao",
        },
    ];

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

            {/* ─── Exam Portal Selector ─────────────────────────────────────── */}
            <Card className="border-2 border-dashed border-primary/30 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Radio className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Active Exam Portal</CardTitle>
                            <CardDescription className="text-xs">
                                Select which exam is featured on the homepage, banner, popup & exam page.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {settingsLoading ? (
                        <div className="flex items-center gap-3 py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Loading current setting…</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {examOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    const isActive = activeExam === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleExamSwitch(opt.id)}
                                            disabled={saving}
                                            className={`
                                                relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200
                                                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                                ${isActive
                                                    ? `bg-gradient-to-br ${opt.activeGradient} ${opt.activeBorder} shadow-lg scale-[1.02]`
                                                    : `${opt.inactiveBg} ${opt.inactiveBorder} hover:border-gray-300 hover:shadow-md`
                                                }
                                                ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                            `}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle2 className="h-5 w-5 text-white drop-shadow" />
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className={`
                                                    p-2.5 rounded-lg shrink-0
                                                    ${isActive ? "bg-white/20" : "bg-gray-100"}
                                                `}>
                                                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-900"}`}>
                                                            {opt.label}
                                                        </span>
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full text-white ${opt.badgeBg}`}>
                                                            {opt.badgeText}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs mt-0.5 leading-snug ${isActive ? "text-white/80" : "text-gray-500"}`}>
                                                        {opt.sublabel}
                                                    </p>
                                                    {isActive && (
                                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                            Currently Active
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* What changes info */}
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
                                <p className="font-semibold">Switching affects:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                                    <li>Homepage scrolling banner announcement</li>
                                    <li>Popup modal (shown to new visitors)</li>
                                    <li>Which exam page is linked from navigation</li>
                                </ul>
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-amber-600 font-medium">Preview active page →</span>
                                    <a
                                        href={examOptions.find(o => o.id === activeExam)?.previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline font-semibold text-amber-900 hover:text-amber-700"
                                    >
                                        Open in new tab
                                    </a>
                                </div>
                            </div>

                            {saving && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving…
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ─── Stats Cards ──────────────────────────────────────────────── */}
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
