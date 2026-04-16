// Import Trophy/TrendingUp for stats
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Crown, LogOut, Lock, Clock, HelpCircle, ArrowRight, BookOpen, Star, Trophy, TrendingUp, BarChart3, Layers, ChevronLeft, UserCircle, Pencil, X, MapPin } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dataService } from "@/services/dataService";
import { MockTest, UserPurchase, ExamSubmission, examDataService, OfflineCoachingCenter } from "@/services/examDataService";
import { cn } from "@/lib/utils";
import mainLogoImg from "@/assets/main-logo.png";


interface ExamDashboardProps {
    userDetails: any;
    onLogout: () => void;
    onEditProfile?: () => void;
    activeTests: MockTest[];
    purchases: UserPurchase[];
    submissions?: ExamSubmission[];
    onSelectTest: (test: MockTest, retake?: boolean) => void;
    onViewResult: (submission: any) => void;
    onBuyBundle: () => void;
    onOpenPremium: () => void;
    userId?: string;
}

export function ExamDashboard({ 
    userDetails, 
    onLogout,
    onEditProfile,
    activeTests = [], 
    purchases = [], 
    submissions = [],
    onSelectTest,
    onViewResult,
    onBuyBundle,
    onOpenPremium,
    userId
}: ExamDashboardProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [offlineCenters, setOfflineCenters] = useState<OfflineCoachingCenter[]>([]);
    const [performanceStats, setPerformanceStats] = useState<any>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const hasBundleAccess = examDataService.hasBundleAccess(purchases);

    useEffect(() => {
        examDataService.getOfflineCoachingCenters().then(setOfflineCenters);
    }, []);

    const [performanceLoading, setPerformanceLoading] = useState(true);

    useEffect(() => {
        if (userDetails?.id) {
            setPerformanceLoading(true);
            examDataService.getUserPerformanceStats(userDetails.id).then((stats: any) => {
                console.log('[Dashboard] Performance stats:', stats);
                setPerformanceStats(stats);
                setPerformanceLoading(false);
            }).catch(() => setPerformanceLoading(false));
        }
    }, [userDetails?.id]);

    // Close dropdown when clicking outside (but not when the logout dialog is open)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (logoutDialogOpen) return; // keep dropdown rendered while dialog is up
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [logoutDialogOpen]);
    
    const freeTests = activeTests.filter(t => Number(t.price) === 0 && Number(t.id) !== -1);
    
    // Hardcoded fallback if Mock Test 1 isn't fetching correctly from the database
    if (freeTests.length === 0) {
        freeTests.push({
            id: 'mock-1-hardcoded',
            title: 'Mock Test 1',
            description: 'Free introductory mock test covering agricultural specimen identification. Includes 50 practical questions.',
            category: 'Agriculture',
            price: 0,
            isActive: true
        });
    }

    // ── Stats: ALL values come from the single backend aggregate query ───────────
    // Never fall back to local submissions — ensures all 3 metrics are from same dataset
    const totalAttempts = performanceStats?.totalAttempts ?? 0;
    const averageScore  = performanceStats?.averageScore  ?? 0;
    const bestScore     = performanceStats?.bestScore     ?? 0;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-3 px-6 shrink-0 shadow-sm sticky top-0 z-20">
                <div className="container-magazine flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <img
                            src={mainLogoImg}
                            alt="AgriCatalogues Logo"
                            className="h-10 md:h-12 w-auto object-contain"
                         />
                    </div>
                    {userDetails && (
                        <div className="relative" ref={profileRef}>
                            {/* Avatar Button */}
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
                            >
                                <div className="h-9 w-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                                    {userDetails.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <div className="text-sm font-bold text-gray-900 leading-tight line-clamp-1 max-w-[120px]">
                                        {userDetails.name}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-1 max-w-[120px]">
                                        {userDetails.college || "Agriculture Student"}
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {/* Profile Summary */}
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-white border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                                                {userDetails.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-900 truncate">{userDetails.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{userDetails.email}</div>
                                                <div className="text-xs text-green-700 font-medium truncate">{userDetails.college || "Agriculture Student"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Rows */}
                                    <div className="px-4 py-3 space-y-1 border-b border-gray-100">
                                        {userDetails.mobile && (
                                            <div className="text-xs text-gray-600"><span className="font-medium text-gray-800">Mobile:</span> {userDetails.mobile}</div>
                                        )}
                                        {userDetails.district && (
                                            <div className="text-xs text-gray-600"><span className="font-medium text-gray-800">District:</span> {userDetails.district}</div>
                                        )}
                                        {userDetails.guardianName && (
                                            <div className="text-xs text-gray-600"><span className="font-medium text-gray-800">Guardian:</span> {userDetails.guardianName}</div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="p-2 space-y-1">
                                        {onEditProfile && (
                                            <button
                                                onClick={() => { setProfileOpen(false); onEditProfile(); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Edit Profile
                                            </button>
                                        )}
                                        <AlertDialog open={logoutDialogOpen} onOpenChange={(open) => { setLogoutDialogOpen(open); if (!open) setProfileOpen(false); }}>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={() => setLogoutDialogOpen(true)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        You will need to sign in again to access your dashboard and exams.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white">
                                                        Logout
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 container-magazine py-8 space-y-8">
                
                {/* 1. Compact Welcome Banner */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {userDetails?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Ready to practice? Attempt a mock test or review your improved performance.
                        </p>
                    </div>
                    {/* Status Section Removed */}
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column: Test Selection (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                         <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-600" /> Available Tests
                         </h2>
                         
                         <div className="grid md:grid-cols-2 gap-6">
                            {/* Free Tests */}
                            {freeTests.map((test) => (
                                <Card key={test.id} className="border border-green-200 shadow-sm hover:shadow-md transition-all group bg-white cursor-pointer" onClick={() => onSelectTest(test)}>
                                    <div className="h-2 bg-green-500 w-full"></div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={test.title}>{test.title}</h3>
                                        <p className="text-gray-500 text-xs mb-4 line-clamp-1">{test.description || "Essential practice for beginners."}</p>
                                        
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 200 Marks</span>
                                             <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> 50 Qs</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <TestActionButton 
                                            userId={userId} 
                                            test={test} 
                                            submissions={submissions} 
                                            onSelectTest={onSelectTest}
                                            onViewResult={onViewResult}
                                        />
                                    </CardFooter>
                                </Card>
                            ))}

                            {/* Paid Tests / Bundle */}
                            {hasBundleAccess ? (
                                    // 1. Show "Access All Tests" Card (Folder View)
                                    <Card 
                                        className="border border-green-200 shadow-sm hover:shadow-md transition-all group bg-white"
                                    >
                                        <div className="h-2 bg-gradient-to-r from-green-500 to-green-700 w-full"></div>
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">All Unlocked</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">All Practical Exams</h3>
                                            <p className="text-gray-500 text-xs mb-4">You have access to 20+ full-length exams.</p>
                                            
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                 <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 20+ Tests</span>
                                                 <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> 1000+ Qs</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0">
                                            <Button 
                                                onClick={onOpenPremium}
                                                className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                            >
                                                Open
                                            </Button>
                                        </CardFooter>
                                    </Card>
                            ) : (
                                // Show Bundle Unlock Card
                                <Card className="border transition-all group cursor-pointer relative overflow-hidden bg-gray-50 border-gray-200">
                                    <div className="h-2 w-full bg-gray-300"></div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                                                <Crown className="w-5 h-5" />
                                            </div>
                                            <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">All Modules</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">Practical Exam Access</h3>
                                        <p className="text-gray-500 text-xs mb-4">Access 20+ mock tests & 1000+ questions.</p>
                                        
                                         <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Expert</span>
                                            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> 1000+ Qs</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={onBuyBundle}>Unlock</Button>
                                    </CardFooter>
                                </Card>
                            )}
                         </div>

                         {/* Offline Coaching Centers */}
                         {offlineCenters.length > 0 && (
                             <div className="pt-6 mt-6 border-t border-gray-100">
                                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                                     <MapPin className="w-5 h-5 text-red-500" /> Offline Coaching Centers
                                 </h2>
                                 <div className="space-y-1">
                                     {offlineCenters.map(center => (
                                         <div key={center.id} className="flex items-center justify-between py-2.5 px-3 border-b border-gray-100 last:border-0 hover:bg-red-50/50 rounded-lg transition-colors">
                                             <div className="flex items-center gap-2 md:gap-3 min-w-0 pr-4">
                                                 <div className="h-2 w-2 rounded-full bg-red-400 shrink-0 hidden sm:block"></div>
                                                 <span className="font-bold text-gray-800 text-sm md:text-base truncate">{center.name}</span>
                                                 <span className="text-gray-400 hidden sm:block">•</span>
                                                 <span className="text-gray-500 text-xs md:text-sm truncate">{center.address}</span>
                                             </div>
                                             {center.mapUrl && (
                                                 <Button variant="outline" size="sm" asChild className="shrink-0 h-7 md:h-8 text-xs text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 bg-white">
                                                     <a href={center.mapUrl} target="_blank" rel="noopener noreferrer">
                                                         <MapPin className="w-3 h-3 mr-1" /> Map
                                                     </a>
                                                 </Button>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                    </div>

                    {/* Right Column: Performance Analysis (New!) */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Performance Analysis
                        </h2>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-gray-500 text-xs font-medium mb-1">Tests Taken</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {performanceLoading ? <span className="text-gray-300 animate-pulse">—</span> : totalAttempts}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-gray-500 text-xs font-medium mb-1">Avg. Score</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {performanceLoading ? <span className="text-gray-300 animate-pulse">—</span> : averageScore}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm col-span-2 flex items-center justify-between">
                                <div>
                                    <div className="text-gray-500 text-xs font-medium mb-1">Best Performance</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {performanceLoading ? <span className="text-gray-300 animate-pulse">—</span> : bestScore}
                                    </div>
                                </div>
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Trophy className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Subject Performance Graph */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-purple-600" /> Subject Analysis
                                </h3>
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Based on all tests</span>
                            </div>
                            
                            <div className="space-y-3">
                                {performanceLoading ? (
                                    <div className="space-y-3 animate-pulse">
                                        {[1,2,3].map(i => (
                                            <div key={i}>
                                                <div className="flex justify-between mb-1">
                                                    <div className="h-3 bg-gray-200 rounded w-32" />
                                                    <div className="h-3 bg-gray-200 rounded w-8" />
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full w-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : performanceStats?.subjectPerformance?.length > 0 ? (
                                    performanceStats.subjectPerformance.map((item: any, index: number) => {
                                        const colors = [
                                            { text: "text-green-600",  bg: "bg-green-500",  barBg: "bg-gray-100" },
                                            { text: "text-blue-600",   bg: "bg-blue-500",   barBg: "bg-gray-100" },
                                            { text: "text-yellow-600", bg: "bg-yellow-400", barBg: "bg-gray-100" },
                                            { text: "text-purple-600", bg: "bg-purple-500", barBg: "bg-gray-100" },
                                            { text: "text-rose-600",   bg: "bg-rose-500",   barBg: "bg-gray-100" }
                                        ];
                                        const colorTheme = colors[index % colors.length];
                                        const pct = Math.min(100, Math.max(0, item.percentage || 0));

                                        return (
                                            <div key={item.subject} className="mb-3">
                                                <div className="flex justify-between text-xs font-medium mb-1">
                                                    <span className="text-gray-600 truncate max-w-[70%]">{item.subject}</span>
                                                    <span className={colorTheme.text}>{pct}%</span>
                                                </div>
                                                <div className={`h-2 w-full ${colorTheme.barBg} rounded-full overflow-hidden`}>
                                                    <div
                                                        className={`h-full ${colorTheme.bg} rounded-full transition-all duration-500`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                   })
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">Take a test to see your subject analysis.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}

{/* Advanced Action Button for Resume/Retake/View Result Logic */}
function TestActionButton({ 
    userId, 
    test, 
    submissions, 
    onSelectTest, 
    onViewResult 
}: { 
    userId?: string, 
    test: MockTest, 
    submissions: any[],
    onSelectTest: (t: MockTest, retake?: boolean) => void,
    onViewResult: (s: any) => void
}) {
    const [hasProgress, setHasProgress] = useState(false);
    
    // Find if this specific test has been submitted before
    const pastSubmission = submissions.find(s => 
        String(s.mockTestId) === String(test.id) || s.testTitle === test.title
    );

    useEffect(() => {
        if (userId && test && !pastSubmission) {
            const storageKey = `exam_progress_${userId}_${test.id}`;
            const exists = !!localStorage.getItem(storageKey);
            setHasProgress(exists);
        }
    }, [userId, test, pastSubmission]);

    // Case 1: Already Submitted
    if (pastSubmission) {
        return (
            <div className="flex gap-2 w-full">
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewResult(pastSubmission);
                    }}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                >
                    View Result
                </Button>
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Do you want to retake this test? Current progress will be lost.")) {
                            onSelectTest(test, true);
                        }
                    }}
                    className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                >
                    Retake
                </Button>
            </div>
        );
    }

    // Case 2: Resume Test
    if (hasProgress) {
        return (
            <Button 
                onClick={(e) => {
                    e.stopPropagation();
                    onSelectTest(test);
                }}
                className="w-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200"
            >
                Resume Test
            </Button>
        );
    }

    // Case 3: Start Fresh
    return (
        <Button 
            onClick={(e) => {
                e.stopPropagation();
                onSelectTest(test);
            }}
            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
        >
            Take Test
        </Button>
    );
}
