import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MockTest, MockQuestion, examDataService, UserPurchase, API_BASE_URL } from "@/services/examDataService";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { ZoomableImage } from "@/components/exam/ZoomableImage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Circle, XCircle, HelpCircle, BookOpen, Clock, Award, BrainCircuit, ArrowRight, Maximize2, Minimize2, Lock, LogOut, Printer, Crown, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ExamAuthModal } from "@/components/auth/ExamAuthModal";
import { ExamDashboard } from "@/components/exam/ExamDashboard";
import { ExamPurchaseView } from "@/components/exam/ExamPurchaseView";
import { PremiumTestsList } from "@/components/exam/PremiumTestsList";
import { UserDetailsModal } from "@/components/exam/UserDetailsModal";
import { useExamAuth } from "@/context/ExamAuthContext";
import { useStrictExamMode } from "@/hooks/useStrictExamMode";
import mainLogoImg from "@/assets/main-logo.png";

// ─── AO/AAO Landing Page ──────────────────────────────────────────────────────
function AoAaoLanding({ onStart, onLogin }: { onStart: () => void; onLogin?: () => void }) {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* Hero */}
            <div className="relative overflow-hidden bg-blue-900 text-white pt-10 pb-16 lg:pt-16 lg:pb-24">
                <div className="absolute top-4 right-4 z-50 md:top-6 md:right-6">
                    <Button
                        onClick={onLogin}
                        className="bg-white text-blue-800 hover:bg-blue-50 shadow-md font-bold text-sm md:text-base px-4 py-2 h-auto"
                    >
                        Sign In / Sign Up
                    </Button>
                </div>

                <div className="absolute inset-0 z-0 select-none pointer-events-none bg-gradient-to-b from-blue-900/90 via-blue-900/80 to-white" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 mt-12 md:mt-0 text-center space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <img src={mainLogoImg} alt="AgriCatalogues Logo" className="h-16 md:h-20 w-auto drop-shadow-lg" />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-800/50 text-blue-100 text-sm font-bold border border-blue-700/50 backdrop-blur-sm shadow-sm mb-4">
                        <ShieldCheck className="w-4 h-4" /> AO / AAO Mock Test Series 2026
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-lg">
                        Agriculture Officer &<br className="hidden md:block" />
                        <span className="text-blue-300">Assistant Agriculture Officer</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                        Prepare for the most competitive agricultural recruitment exams in Karnataka with our curated AO/AAO mock test series.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto py-6 text-left">
                        <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                            <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg text-blue-300">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Exam-Pattern Based</h4>
                                <p className="text-sm text-blue-100/80 leading-snug">Aligned with official AO/AAO syllabus</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                            <div className="mt-1 bg-yellow-500/20 p-1.5 rounded-lg text-yellow-300">
                                <BrainCircuit className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Subject-wise Analysis</h4>
                                <p className="text-sm text-yellow-100/80 leading-snug">Detailed performance insights</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:bg-white/15 transition-colors">
                            <div className="mt-1 bg-purple-500/20 p-1.5 rounded-lg text-purple-300">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Timed Exam Mode</h4>
                                <p className="text-sm text-purple-100/80 leading-snug">Simulate real exam conditions</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                        <Button
                            onClick={onStart}
                            className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold text-xl h-16 px-10 rounded-full shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 w-full sm:w-auto transform hover:-translate-y-1"
                        >
                            Start Free AO/AAO Test <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="border-y border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-wrap justify-center gap-y-4 gap-x-8 md:gap-16 text-center text-gray-600 font-medium text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            <span>AO / AAO Official Pattern Coverage</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span><strong className="text-gray-900">100+</strong> Questions per Test</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <span><strong className="text-gray-900">500+</strong> Questions (All Topics)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="py-24 bg-white text-center">
                <div className="max-w-3xl mx-auto px-4 space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        Ready to crack the AO/AAO exam?
                    </h2>
                    <p className="text-xl text-gray-600">
                        Start your AO/AAO preparation today with our specially crafted mock tests.
                    </p>
                    <Button
                        onClick={onStart}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg h-14 px-10 rounded-full shadow-xl shadow-blue-700/30 transition-all hover:scale-105"
                    >
                        Start Free AO/AAO Test
                    </Button>
                </div>
            </div>

            <footer className="bg-gray-50 border-t py-12 text-center">
                <div className="max-w-2xl mx-auto px-4 space-y-4">
                    <p className="text-gray-500 text-sm">
                        <strong>Disclaimer:</strong> This is a mock test platform designed for educational purposes.
                        It is not affiliated with the official examination authority.
                    </p>
                    <p className="text-gray-400 text-xs">
                        &copy; 2025 AgriCatalogues. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

// ─── AO/AAO Exam Page ─────────────────────────────────────────────────────────
const AO_AAO_CATEGORY = "AO/AAO";

export default function AoAaoExamPage() {
    const [activeTests, setActiveTests] = useState<MockTest[]>([]);
    const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
    const [questions, setQuestions] = useState<MockQuestion[]>([]);
    const [purchases, setPurchases] = useState<UserPurchase[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const { examUser: user, isExamAuthenticated: isAuthenticated, isExamLoading: isAuthLoading, examLogout: logout, updateUserDisplayName } = useExamAuth();

    const [userDetails, setUserDetails] = useState<any>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
    const [showLanding, setShowLanding] = useState(true);
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
    const [isProfileFetching, setIsProfileFetching] = useState(false);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [viewResultData, setViewResultData] = useState<{ submission: any; questions: MockQuestion[] } | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showPurchaseView, setShowPurchaseView] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);

    useStrictExamMode(
        selectedTest
            ? (isSubmitted ? 'result' : 'exam')
            : (viewResultData ? 'result' : 'inactive'),
        userDetails
    );

    // Sync User Details from Auth Context
    useEffect(() => {
        if (!isAuthLoading) {
            if (user) {
                setIsProfileFetching(true);
                mapSessionToUser(user).finally(() => {
                    setIsProfileFetching(false);
                    setShowLanding(false);
                });
                setIsAuthOpen(false);
            } else {
                setUserDetails(null);
                const shouldOpenLogin = searchParams.get('login') === 'true';
                if (shouldOpenLogin) {
                    setIsAuthOpen(true);
                    setSearchParams(params => {
                        params.delete('login');
                        return params;
                    });
                } else {
                    setShowLanding(true);
                }
            }
        }
    }, [user, isAuthLoading, searchParams]);

    useEffect(() => {
        loadTests();

        const storedSubId = sessionStorage.getItem("aoaao_submissionId");
        const storedTestId = sessionStorage.getItem("aoaao_examTestId");

        if (storedSubId) {
            setSubmissionId(parseInt(storedSubId));
        }

        if (storedTestId && sessionStorage.getItem("examUser")) {
            loadTestQuestions(storedTestId);
            setShowLanding(false);
        }

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const mapSessionToUser = async (firebaseUser: any) => {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || "";

        const baseData = {
            id: uid,
            email,
            name: firebaseUser.displayName || email.split('@')[0] || "",
            phone: "",
            mobile: "",
            college: "",
            category: "General",
        };
        setUserDetails(baseData);

        const localKey = `profile_completed_${uid}`;
        const localFlag = localStorage.getItem(localKey) === 'true';

        let profileFound = false;
        try {
            const res = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get-profile',
                    payload: { firebase_uid: uid }
                })
            });

            if (res.ok) {
                const json = await res.json();
                if (json.profile) {
                    profileFound = true;
                    const p = json.profile;
                    const merged = {
                        ...baseData,
                        name: p.name || baseData.name,
                        phone: p.mobile || "",
                        mobile: p.mobile || "",
                        college: p.college || "",
                        category: p.category || "",
                    };
                    setUserDetails(merged);
                    localStorage.setItem(localKey, 'true');
                    setIsProfileIncomplete(false);
                    return;
                }
            }
        } catch (e) {
            console.warn("[AoAaoExamAuth] Profile fetch error:", e);
        }

        if (localFlag) {
            setIsProfileIncomplete(false);
            return;
        }

        if (!profileFound) {
            try {
                await fetch(`${API_BASE_URL}/api`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                            action: 'save-profile',
                            payload: {
                                firebase_uid: uid,
                                email,
                                name: baseData.name,
                                mobile: "",
                                college: "",
                                category: "General",
                            }
                        })
                });
            } catch (e) {
                console.warn("[AoAaoExamAuth] Could not auto-create profile:", e);
            }
        }

        setIsProfileIncomplete(true);
        setTimeout(() => setShowUserDetailsModal(true), 250);
    };

    useEffect(() => {
        if (userDetails?.id) {
            Promise.all([
                examDataService.getUserPurchases(userDetails.id),
                userDetails.email ? examDataService.getUserPurchases(userDetails.email) : Promise.resolve([])
            ]).then(([p1, p2]) => {
                const map = new Map();
                p1.forEach(p => map.set(p.mockTestId, p));
                p2.forEach(p => map.set(p.mockTestId, p));
                setPurchases(Array.from(map.values()));
            });

            examDataService.getUserSubmissions(userDetails.id).then(subs => {
                if (subs.length === 0 && userDetails.email) {
                    examDataService.getUserSubmissions(userDetails.email).then(setSubmissions);
                } else {
                    setSubmissions(subs);
                }
            });
        } else {
            setPurchases([]);
            setSubmissions([]);
        }
    }, [userDetails?.id, userDetails?.email]);

    const loadTests = async () => {
        setLoading(true);
        try {
            const tests = await examDataService.getMockTests(true);
            // Filter to only show AO/AAO category tests
            const filtered = tests.filter(t =>
                Number(t.id) !== -1 &&
                t.category?.trim().toUpperCase() === AO_AAO_CATEGORY.toUpperCase()
            );
            setActiveTests(filtered);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load available tests.");
        } finally {
            setLoading(false);
        }
    };

    const loadTestQuestions = async (testId: string | number) => {
        setLoading(true);
        try {
            const test = await examDataService.getMockTestById(testId);
            if (test && test.questions) {
                setSelectedTest(test);
                setQuestions(test.questions);
                setTimeLeft(prev => prev > 0 ? prev : 3000);
            }
        } catch (error) {
            console.error("Error loading questions", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    };

    const handleBuyBundle = () => {
        setShowPurchaseView(true);
    };

    const handleProcessPayment = () => {
        if (!userDetails) {
            setIsAuthOpen(true);
            return;
        }
    };

    const handleViewResult = async (submission: any) => {
        setLoading(true);
        try {
            const test = await examDataService.getMockTestById(submission.mockTestId);
            if (test && test.questions) {
                setSelectedTest(test);
                setAnswers(submission.answers || {});
                setScore(submission.score || 0);
                setIsSubmitted(true);
                setViewResultData({ submission, questions: test.questions });
                setQuestions(test.questions);
            }
        } catch (e) {
            toast.error('Failed to load result');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTest = async (test: MockTest, retake = false) => {
        setSearchParams({});
        if (!userDetails) {
            setIsAuthOpen(true);
            return;
        }

        if (isProfileIncomplete) {
            toast.warning("Please complete your profile before starting an exam.");
            setShowUserDetailsModal(true);
            return;
        }

        setQuestions([]);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setSubmissionId(null);
        setTimeLeft(0);
        setViewResultData(null);

        const isPurchased = purchases.some(p => p.mockTestId === test.id && p.status === 'active');
        const hasBundle = examDataService.hasBundleAccess(purchases);

        if (test.price > 0 && !isPurchased && !hasBundle) {
            return;
        }

        const storageKey = `aoaao_exam_progress_${userDetails.id}_${test.id}`;
        if (retake) {
            localStorage.removeItem(storageKey);
        }

        const savedState = localStorage.getItem(storageKey);

        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.timeLeft > 0 && !parsed.isSubmitted) {
                    setAnswers(parsed.answers || {});
                    setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
                    setTimeLeft(parsed.timeLeft);
                    setSubmissionId(parsed.submissionId);

                    setSelectedTest(test);
                    sessionStorage.setItem("aoaao_examTestId", test.id.toString());
                    if (parsed.submissionId) sessionStorage.setItem("aoaao_submissionId", parsed.submissionId.toString());

                    toast.success("Resumed previous session");
                    loadTestQuestions(test.id);

                    try {
                        await document.documentElement.requestFullscreen();
                    } catch (e) { console.warn("Fullscreen error", e); }

                    return;
                }
            } catch (e) {
                console.error("Failed to parse saved state", e);
                localStorage.removeItem(storageKey);
            }
        }

        setSelectedTest(test);
        sessionStorage.setItem('aoaao_examTestId', test.id.toString());
        try { await document.documentElement.requestFullscreen(); } catch (e) { console.warn(e); }

        try {
            const response = await fetch(`${API_BASE_URL}/api/start-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userDetails.id,
                    test_id: test.id,
                    retake: !!retake,
                    name: userDetails.name || '',
                    email: userDetails.email || '',
                    phone: userDetails.mobile || userDetails.phone || '',
                    college: userDetails.college || '',
                })
            });
            const responseData = await response.json();

            if (!response.ok) {
                toast.error(`Error: ${responseData.error || 'Could not start session'}`);
                return;
            }

            const aid = responseData.attempt_id;
            if (aid) {
                setSubmissionId(aid);
                sessionStorage.setItem('aoaao_submissionId', aid.toString());
            }
        } catch (err: any) {
            toast.error('Failed to initialize session: ' + (err.message || String(err)));
            return;
        }

        loadTestQuestions(test.id);
        setTimeLeft(50 * 60);
    };

    const handleOptionSelect = (option: string) => {
        if (isSubmitted) return;
        if (!questions[currentQuestionIndex]) return;
        const qId = questions[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleNavigate = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handleSubmitExam = async () => {
        if (window.confirm("Are you sure you want to submit the exam?")) {
            setIsSubmitted(true);

            if (document.fullscreenElement) {
                try {
                    await document.exitFullscreen();
                } catch (e) { console.warn(e); }
            }

            if (submissionId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/submit-test`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            submission_id: submissionId,
                            answers,
                            total_questions: questions.length,
                            user_id: userDetails.id
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setScore(data.score || 0);

                        if (data.questions && Array.isArray(data.questions)) {
                            const populatedQuestions = data.questions.map((q: any) => ({
                                id: q.id,
                                mockTestId: q.mock_test_id || q.mockTestId,
                                question: q.question_text || q.question,
                                options: q.options,
                                correctOptionIndex: q.correct_option_index ?? q.correctOptionIndex,
                                image: q.image_url || q.image,
                                marks: q.marks,
                                topic: q.topic
                            }));
                            setQuestions(populatedQuestions);
                        }

                        toast.success("Exam submitted successfully!");
                        sessionStorage.removeItem("aoaao_examTestId");
                        sessionStorage.removeItem("aoaao_submissionId");

                        if (userDetails?.id) {
                            examDataService.getUserSubmissions(userDetails.id).then(subs => {
                                if (subs.length === 0 && userDetails.email) {
                                    examDataService.getUserSubmissions(userDetails.email).then(setSubmissions);
                                } else {
                                    setSubmissions(subs);
                                }
                            });
                        }
                    } else {
                        try {
                            const errData = await response.json();
                            toast.error(`Submit Failed: ${errData.error || response.statusText}`);
                        } catch (e) {
                            toast.error("Failed to submit exam via API.");
                        }
                    }
                } catch (err) {
                    console.error("Unexpected error in handleSubmit:", err);
                }

                if (userDetails?.id && selectedTest?.id) {
                    localStorage.removeItem(`aoaao_exam_progress_${userDetails.id}_${selectedTest.id}`);
                }
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        sessionStorage.clear();
        setUserDetails(null);
        setSelectedTest(null);
        setShowLanding(true);
        toast.info("Logged out successfully");
    };

    const handleDetailsComplete = async (data: { name: string; mobile: string; email: string; college: string; category: string }) => {
        try {
            await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save-profile',
                    payload: {
                        firebase_uid: user?.uid || userDetails?.id,
                        name: data.name,
                        mobile: data.mobile,
                        email: data.email || userDetails?.email,
                        college: data.college,
                        category: data.category,
                    }
                })
            });
        } catch (e) {
            toast.error('Network error. Please check your connection.');
            return;
        }

        setUserDetails((prev: any) => ({
            ...prev,
            name: data.name,
            phone: data.mobile,
            mobile: data.mobile,
            email: data.email || prev?.email,
            college: data.college,
            category: data.category,
        }));

        if (user?.uid || userDetails?.id) {
            localStorage.setItem(`profile_completed_${user?.uid || userDetails?.id}`, 'true');
        }

        setIsProfileIncomplete(false);
        setShowUserDetailsModal(false);
    };

    // Timer Effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (selectedTest && !isSubmitted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [selectedTest, isSubmitted, timeLeft]);

    // Autosave Effect
    useEffect(() => {
        if (selectedTest && userDetails?.id && !isSubmitted && submissionId) {
            const storageKey = `aoaao_exam_progress_${userDetails.id}_${selectedTest.id}`;
            const stateToSave = {
                answers,
                currentQuestionIndex,
                timeLeft,
                submissionId,
                isSubmitted: false,
                timestamp: Date.now()
            };
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        }
    }, [answers, currentQuestionIndex, timeLeft, selectedTest, userDetails, isSubmitted, submissionId]);

    // ─── Render Content ───────────────────────────────────────────────────────
    const renderContent = () => {
        if (isAuthLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-3">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-500 text-sm font-medium">Verifying Credentials...</p>
                </div>
            );
        }

        if (isProfileFetching) {
            return (
                <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-500">Retrieving Account Details...</p>
                </div>
            );
        }

        if (showLanding) {
            return (
                <AoAaoLanding
                    onStart={() => {
                        if (!userDetails) {
                            setIsAuthOpen(true);
                        } else {
                            setShowLanding(false);
                        }
                    }}
                    onLogin={() => { setAuthMode("signin"); setIsAuthOpen(true); }}
                />
            );
        }

        if (loading && !selectedTest && activeTests.length === 0) {
            return <div className="min-h-screen flex items-center justify-center">Loading AO/AAO Exam Portal...</div>;
        }

        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        if (!selectedTest && showPurchaseView) {
            return (
                <ExamPurchaseView
                    tests={activeTests.filter(t => t.price > 0)}
                    price={examDataService.BUNDLE_PRICE}
                    onBack={() => setShowPurchaseView(false)}
                    onPay={handleProcessPayment}
                    isAoAao={true}
                />
            );
        }

        // Dashboard / Test Selection
        if (!selectedTest) {
            // Show AO/AAO dashboard
            return (
                <ExamDashboard
                    userDetails={userDetails}
                    onLogout={handleLogout}
                    onEditProfile={() => setShowUserDetailsModal(true)}
                    activeTests={activeTests}
                    purchases={purchases}
                    submissions={submissions}
                    onSelectTest={handleSelectTest}
                    onViewResult={handleViewResult}
                    onBuyBundle={handleBuyBundle}
                    onOpenPremium={() => setSearchParams({ view: 'premium' })}
                    userId={userDetails?.id}
                    hidePerformanceAnalysis={true}
                />
            );
        }

        // Results / Submitted View
        if (isSubmitted) {
            return (
                <div className="min-h-screen flex flex-col font-sans">
                    <header className="bg-white border-b border-gray-200 py-3 px-6 shrink-0">
                        <div className="container-magazine flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src={mainLogoImg} alt="AgriCatalogues Logo" className="h-10 md:h-12 w-auto object-contain" />
                            </div>
                            <Button variant="ghost" onClick={() => {
                                setIsSubmitted(false);
                                setAnswers({});
                                setScore(0);
                                setSelectedTest(null);
                                sessionStorage.removeItem("aoaao_submissionId");
                                sessionStorage.removeItem("aoaao_examTestId");
                                loadTests();
                            }}>
                                Back to AO/AAO Tests
                            </Button>
                        </div>
                    </header>
                    <div className="flex-1 min-h-screen bg-blue-50 flex flex-col items-center p-8 space-y-8 animate-in fade-in duration-500">
                        <Card className="max-w-3xl w-full p-8 text-center space-y-6 shadow-md border-blue-100">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-200 blur-xl opacity-50 rounded-full" />
                                    <CheckCircle2 className="w-24 h-24 text-blue-500 relative z-10" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold text-blue-900">Exam Submitted!</h1>
                            <p className="text-xl text-gray-600">
                                Great job, <span className="font-semibold text-gray-900">{userDetails?.name}</span>!
                            </p>

                            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-3xl font-bold text-gray-900">{questions.length}</div>
                                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">Total</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                                    <div className="text-3xl font-bold text-blue-700">{Object.keys(answers).length}</div>
                                    <div className="text-sm text-blue-600 font-medium uppercase tracking-wide mt-1">Attempted</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                                    <div className="text-3xl font-bold text-green-700">{score}</div>
                                    <div className="text-sm text-green-600 font-medium uppercase tracking-wide mt-1">Score</div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 border-t border-gray-100 pt-8 mt-4">
                                <Button onClick={() => window.location.reload()} variant="outline" className="print:hidden">
                                    Take Exam Again
                                </Button>
                            </div>
                        </Card>

                        {/* Detailed Analysis */}
                        <div className="max-w-3xl w-full space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Detailed Analysis</h2>
                            {questions.map((q: any) => {
                                const rawAnswer = answers[q.id] ?? answers[String(q.id)];
                                const userIndex = parseInt(String(rawAnswer ?? ''), 10);
                                const correctIndex = parseInt(String(q.correctOptionIndex ?? ''), 10);
                                const isSkipped = rawAnswer === undefined || rawAnswer === null || rawAnswer === '' || isNaN(userIndex);
                                const isCorrect = !isSkipped && !isNaN(correctIndex) && userIndex === correctIndex;
                                const isWrong = !isSkipped && !isCorrect;
                                const userOptionText = !isSkipped ? (q.options[userIndex] ?? '') : '';
                                const correctOptionText = !isNaN(correctIndex) ? (q.options[correctIndex] ?? '') : '';

                                return (
                                    <Card
                                        key={q.id}
                                        className={cn(
                                            "p-6 border-l-4 shadow-sm overflow-hidden transition-all hover:shadow-md",
                                            isCorrect ? "border-l-blue-500 bg-blue-50/30" :
                                                isWrong ? "border-l-red-500 bg-red-50/30" :
                                                    "border-l-gray-300 bg-gray-50/30"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="font-semibold text-gray-800 text-sm flex-1">{q.question}</p>
                                            {isCorrect && <CheckCircle2 className="text-blue-500 shrink-0 w-5 h-5 mt-0.5" />}
                                            {isWrong && <XCircle className="text-red-500 shrink-0 w-5 h-5 mt-0.5" />}
                                            {isSkipped && <HelpCircle className="text-gray-400 shrink-0 w-5 h-5 mt-0.5" />}
                                        </div>
                                        {q.image && (
                                            <div className="mt-3">
                                                <ZoomableImage src={q.image} alt="Question Image" className="max-h-48 rounded-lg object-contain" />
                                            </div>
                                        )}
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {q.options.map((opt: string, oIdx: number) => (
                                                <div
                                                    key={oIdx}
                                                    className={cn(
                                                        "flex items-center gap-2 text-sm p-2 rounded-lg",
                                                        oIdx === correctIndex ? "bg-blue-100 text-blue-800 font-semibold" :
                                                            oIdx === userIndex && isWrong ? "bg-red-100 text-red-700" :
                                                                "text-gray-500"
                                                    )}
                                                >
                                                    <span className="text-xs border rounded w-5 h-5 flex items-center justify-center shrink-0 font-medium">
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </span>
                                                    {opt}
                                                    {oIdx === correctIndex && <span className="text-[10px] bg-blue-200 px-1.5 rounded ml-auto">Correct</span>}
                                                </div>
                                            ))}
                                        </div>
                                        {isSkipped && (
                                            <p className="text-xs text-gray-400 mt-2 italic">Not attempted.</p>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        // Exam in Progress
        return (
            <div className={cn("min-h-screen flex flex-col bg-gray-100 font-sans", isFullscreen && "bg-white")}>
                {/* Exam Header */}
                <header className="bg-blue-800 text-white py-2 px-4 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <img src={mainLogoImg} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
                        <div>
                            <div className="font-bold text-sm line-clamp-1">{selectedTest.title}</div>
                            <div className="text-xs text-blue-200">AO/AAO Mock Test</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">

                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-blue-700">
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        <Button
                            onClick={handleSubmitExam}
                            className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold text-sm px-4 py-1.5 h-auto"
                        >
                            Submit
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Question Panel */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                            </div>
                        ) : questions.length > 0 ? (
                            <QuestionCard
                                key={questions[currentQuestionIndex].id}
                                question={questions[currentQuestionIndex] as any}
                                selectedOption={answers[questions[currentQuestionIndex]?.id] || null}
                                onSelect={handleOptionSelect}
                                currentQuestionIndex={currentQuestionIndex}
                            />
                        ) : (
                             <div className="flex items-center justify-center h-full flex-col gap-4">
                                 <div className="text-gray-500 text-lg">No questions available for this test yet.</div>
                                 <Button onClick={() => { setSelectedTest(null); sessionStorage.removeItem("aoaao_examTestId"); }}>Back to Dashboard</Button>
                             </div>
                        )}
                        {/* Navigation Buttons */}
                        {questions.length > 0 && (
                            <div className="flex justify-between mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => handleNavigate(Math.max(0, currentQuestionIndex - 1))}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => handleNavigate(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </main>

                    {/* Question Navigator Sidebar */}
                    <aside className="w-56 border-l bg-white hidden md:block shrink-0">
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Question Navigator</p>
                        </div>
                        <ScrollArea className="h-[calc(100vh-120px)]">
                            <div className="p-3 grid grid-cols-4 gap-1.5">
                                {questions.map((q, idx) => {
                                    const isAnswered = answers[q.id] !== undefined;
                                    const isCurrent = idx === currentQuestionIndex;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleNavigate(idx)}
                                            className={cn(
                                                "h-8 w-8 rounded text-xs font-medium transition-colors",
                                                isCurrent ? "bg-blue-600 text-white ring-2 ring-blue-300" :
                                                    isAnswered ? "bg-blue-100 text-blue-800" :
                                                        "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </aside>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}

            {/* Auth Modal */}
            <ExamAuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode={authMode}
                onSuccess={() => {
                    setIsAuthOpen(false);
                }}
            />

            {/* User Details Modal */}
            {showUserDetailsModal && (
                <UserDetailsModal
                    isOpen={showUserDetailsModal}
                    userEmail={userDetails?.email || ""}
                    initialData={userDetails ? {
                        name: userDetails.name || "",
                        mobile: userDetails.mobile || "",
                        email: userDetails.email || "",
                        college: userDetails.college || "",
                        category: userDetails.category || "",
                    } : undefined}
                    onComplete={handleDetailsComplete}
                    onCancel={handleLogout}
                />
            )}
        </>
    );
}
