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
import { ExamLanding } from "@/components/exam/ExamLanding";
import { ExamDashboard } from "@/components/exam/ExamDashboard";
import { ExamPurchaseView } from "@/components/exam/ExamPurchaseView";
import { PremiumTestsList } from "@/components/exam/PremiumTestsList";
import { UserDetailsModal } from "@/components/exam/UserDetailsModal";
import { useExamAuth } from "@/context/ExamAuthContext";
import mainLogoImg from "@/assets/main-logo.png";

export default function ExamPage() {
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
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submissionId, setSubmissionId] = useState<number | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0); // Timer State moved here
    const [showPurchaseView, setShowPurchaseView] = useState(false);

    // Sync User Details from Auth Context
    useEffect(() => {
        if (!isAuthLoading) {
            if (user) {
                mapSessionToUser(user);
                setShowLanding(false);
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
        
        const storedSubId = sessionStorage.getItem("submissionId");
        const storedTestId = sessionStorage.getItem("examTestId");

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
        const baseData = {
            id: firebaseUser.uid || firebaseUser.id,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "",
            phone: "",
            mobile: "",
            college: "",
            district: "",
            guardianName: "",
            guardianProfession: "",
            guardianContact: "",
        };
        setUserDetails(baseData);

        // Fetch saved profile from the database
        try {
            const res = await fetch(`${API_BASE_URL}/api/save-profile?firebase_uid=${encodeURIComponent(baseData.id)}`);
            if (res.ok) {
                const json = await res.json();
                if (json.profile) {
                    const p = json.profile;
                    const merged = {
                        ...baseData,
                        name: p.name || baseData.name,
                        phone: p.mobile || "",
                        mobile: p.mobile || "",
                        college: p.college || "",
                        district: p.district || "",
                        guardianName: p.guardian_name || "",
                        guardianProfession: p.guardian_profession || "",
                        guardianContact: p.guardian_contact || "",
                    };
                    setUserDetails(merged);
                    // Profile complete if all essential fields are filled
                    const isComplete = !!(merged.mobile && merged.college && merged.district && merged.guardianName);
                    setIsProfileIncomplete(!isComplete);
                    if (!isComplete) {
                        setTimeout(() => setShowUserDetailsModal(true), 250);
                    }
                    return;
                }
            }
        } catch (e) {
            console.warn("Could not fetch saved profile:", e);
        }

        // No saved profile — mark incomplete so modal opens
        setIsProfileIncomplete(true);
        setTimeout(() => setShowUserDetailsModal(true), 250);
    };

    const handleProfileComplete = (user: any) => {
        mapSessionToUser(user); // Re-map to update state and clear modal
    };

    const handleLogoutFromModal = async () => {
        await handleLogout();
        setShowUserDetailsModal(false);
    };

    const handleSignupSuccess = () => {
        setIsAuthOpen(false);
        setShowLanding(false);
        setTimeout(() => setShowUserDetailsModal(true), 250);
    };

    const handleDetailsComplete = async (data: { name: string; mobile: string; email: string; college: string; district: string; guardianName: string; guardianProfession: string; guardianContact: string }) => {
        // 1. Persist display name to Firebase
        try {
            await updateUserDisplayName(data.name);
        } catch (e) {
            console.warn("Could not update Firebase display name", e);
        }

        // 2. Save profile to Supabase via API
        try {
            const res = await fetch(`${API_BASE_URL}/api/save-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebase_uid: user?.uid || userDetails?.id,
                    name: data.name,
                    mobile: data.mobile,
                    email: data.email || userDetails?.email,
                    college: data.college,
                    district: data.district,
                    guardian_name: data.guardianName,
                    guardian_profession: data.guardianProfession,
                    guardian_contact: data.guardianContact,
                })
            });
            const json = await res.json();
            if (!res.ok) {
                console.error('Profile save failed:', json.error);
                toast.error('Failed to save profile. Please try again.');
                return; // Don't proceed if save failed
            }
            toast.success('Profile created successfully!');
        } catch (e) {
            console.error('Network error saving profile:', e);
            toast.error('Network error. Please check your connection.');
            return;
        }

        // 3. Update local userDetails state
        setUserDetails((prev: any) => ({
            ...prev,
            name: data.name,
            phone: data.mobile,
            mobile: data.mobile,
            email: data.email || prev?.email,
            college: data.college,
            district: data.district,
            guardianName: data.guardianName,
            guardianProfession: data.guardianProfession,
            guardianContact: data.guardianContact,
        }));
        setIsProfileIncomplete(false);
        setShowUserDetailsModal(false);
    };

    const handleStartFromLanding = () => {
        if (!userDetails) {
            setIsAuthOpen(true);
        } else {
             // If user is already logged in (edge case), just hide landing
             setShowLanding(false);
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



    useEffect(() => {
        if (userDetails?.id || userDetails?.email) {
            Promise.all([
                userDetails.id ? examDataService.getUserPurchases(userDetails.id) : Promise.resolve([]),
                userDetails.email ? examDataService.getUserPurchases(userDetails.email) : Promise.resolve([])
            ]).then(([p1, p2]) => {
                const map = new Map();
                p1.forEach(p => map.set(p.mockTestId, p));
                p2.forEach(p => map.set(p.mockTestId, p));
                const finalPurchases = Array.from(map.values());
                setPurchases(finalPurchases);
            });

            // Fetch submissions using email as the key (as per current DB schema)
            if (userDetails.email) {
                examDataService.getUserSubmissions(userDetails.email).then(setSubmissions);
            }
        } else {
            setPurchases([]);
            setSubmissions([]);
        }
    }, [userDetails?.id, userDetails?.email]);


    const loadTests = async () => {
        setLoading(true);
        try {
            const tests = await examDataService.getMockTests(true);
            // Hide the bundle (-1) completely from all frontend views
            setActiveTests(tests.filter(t => Number(t.id) !== -1));
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
                // Initialize timer if not already set (reloading page scenario)
                setTimeLeft(prev => prev > 0 ? prev : 3000);
            }
        } catch (error) {
            console.error("Error loading questions", error);
        } finally {
            setLoading(false);
        }
    }

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

        // handleRazorpayPayment( // Commented out as per instruction
        //     examDataService.BUNDLE_PRICE,
        //     userDetails,
        //     "Premium All-Access Pass",
        //     "Unlock all 20+ Mock Tests permanently.",
        //     async (response: any) => {
        //         toast.success("Payment Successful! All Tests Unlocked.");
        //         try {
        //             await examDataService.grantUserAccess(userDetails.id, examDataService.BUNDLE_ACCESS_ID, examDataService.BUNDLE_PRICE);
        //             const updatedPurchases = await examDataService.getUserPurchases(userDetails.id);
        //             setPurchases(updatedPurchases);
        //             setShowPurchaseView(false); // Close view on success
        //             toast.success("Premium Access Active!");
        //         } catch (e) {
        //              console.error("Grant Access Error", e);
        //              toast.error("Contact Admin to activate Bundle.");
        //         }
        //     },
        //     (err) => toast.error("Payment Cancelled")
        // );
    };

    const handleSelectTest = async (test: MockTest) => {
        setSearchParams({}); // Clear 'view=premium' to ensure exam view renders
        if (!userDetails) {
            setIsAuthOpen(true);
            return;
        }

        if (isProfileIncomplete) {
            toast.warning("Please complete your profile before starting an exam.");
            setShowUserDetailsModal(true);
            return;
        }

        // RESET STATE IMMEDIATELY to prevent crosstalk between tests
        setQuestions([]); 
        setAnswers({}); 
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setSubmissionId(null);
        setTimeLeft(0);

        const isPurchased = purchases.some(p => p.mockTestId === test.id && p.status === 'active');
        const hasBundle = examDataService.hasBundleAccess(purchases);

        if (test.price > 0 && !isPurchased && !hasBundle) {
            // Initiate Razorpay Payment
            // handleRazorpayPayment( // Commented out as per instruction
            //     test.price,
            //     userDetails,
            //     test.title,
            //     `Access to ${test.title}`,
            //     async (response: any) => {
            //         console.log("Payment Success", response);
            //         toast.success("Payment Successful! Access Granted.");
            //         try {
            //             await examDataService.grantUserAccess(userDetails.id, test.id, test.price);
            //             // Refresh purchases
            //             const updatedPurchases = await examDataService.getUserPurchases(userDetails.id);
            //             setPurchases(updatedPurchases);
            //             // Auto-start or ask user? Let's ask user to click Start again to be safe/clear
            //             toast.success("You can now start the exam!");
            //         } catch (e) {
            //              console.error("Grant Access Error", e);
            //              toast.error("Payment recorded but access grant failed. Contact Admin.");
            //         }
            //     },
            //     (error) => {
            //         console.error("Payment Failed", error);
            //         toast.error("Payment Failed: " + (error.description || "Unknown error"));
            //     }
            // );
            return;
        }

        const storageKey = `exam_progress_${userDetails.id}_${test.id}`;
        const savedState = localStorage.getItem(storageKey);

        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                // Validate if it's a valid save (not submitted / expired)
                if (parsed.timeLeft > 0 && !parsed.isSubmitted) {
                    setAnswers(parsed.answers || {});
                    setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
                    setTimeLeft(parsed.timeLeft);
                    setSubmissionId(parsed.submissionId);
                    
                    setSelectedTest(test);
                    sessionStorage.setItem("examTestId", test.id.toString());
                    if (parsed.submissionId) sessionStorage.setItem("submissionId", parsed.submissionId.toString());
                    
                    toast.success("Resumed previous session");
                    
                    // IMPORTANT: Must load questions for the resumed test!
                    loadTestQuestions(test.id);

                    try {
                        await document.documentElement.requestFullscreen();
                    } catch (e) { console.warn("Fullscreen error", e); }
                    
                    return; // EXIT EARLY - RESUMED
                }
            } catch (e) {
                console.error("Failed to parse saved state", e);
                localStorage.removeItem(storageKey); // Clear corrupted
            }
        }

        // Start New Test Logic
        // State is already reset above
        setSelectedTest(test);
        sessionStorage.setItem("examTestId", test.id.toString());
        try {
            await document.documentElement.requestFullscreen();
        } catch (e) { console.warn("Fullscreen error", e); }

        try {
             const response = await fetch(`${API_BASE_URL}/api/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'start-test',
                    payload: {
                        user_id: userDetails.id,
                        test_id: test.id,
                        name: userDetails.name,
                        phone: userDetails.phone,
                        email: userDetails.email,
                        college: userDetails.college,
                        score: 0,
                        total_questions: test.questions?.length || 50
                    }
                })
             });
             const responseData = await response.json();

            if (!response.ok) {
                console.error("API Error starting test:", responseData.error || response.statusText);
                toast.error(`Error: ${responseData.error || "Could not start session"}`);
                return;
            }

            if (responseData && responseData.attempt_id) {
                setSubmissionId(responseData.attempt_id);
                sessionStorage.setItem("submissionId", responseData.attempt_id.toString());
            } else if (responseData && responseData.submission_id) {
                setSubmissionId(responseData.submission_id);
                sessionStorage.setItem("submissionId", responseData.submission_id.toString());
            } else if (responseData && responseData.id) {
                setSubmissionId(responseData.id);
                sessionStorage.setItem("submissionId", responseData.id.toString());
            }
        } catch (err: any) {
            console.error("Error starting test session:", err);
            toast.error("Failed to initialize session: " + (err.message || String(err)));
            return;
        }

        loadTestQuestions(test.id);
        setTimeLeft(50 * 60); // 50 minutes
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

    const [submissions, setSubmissions] = useState<any[]>([]);

    useEffect(() => {
        // Redundant fetch block, keeping in sync just in case
        if (userDetails?.id || userDetails?.email) {
            Promise.all([
                userDetails.id ? examDataService.getUserPurchases(userDetails.id) : Promise.resolve([]),
                userDetails.email ? examDataService.getUserPurchases(userDetails.email) : Promise.resolve([])
            ]).then(([p1, p2]) => {
                const map = new Map();
                p1.forEach(p => map.set(p.mockTestId, p));
                p2.forEach(p => map.set(p.mockTestId, p));
                setPurchases(Array.from(map.values()));
            });
            if (userDetails.email) {
                examDataService.getUserSubmissions(userDetails.email).then(setSubmissions);
            }
        } else {
            setPurchases([]);
            setSubmissions([]);
        }
    }, [userDetails?.id, userDetails?.email]);


    const handleSubmitExam = async () => {
        if (window.confirm("Are you sure you want to submit the exam?")) {
            setIsSubmitted(true);
            
            // Exit fullscreen
            if (document.fullscreenElement) {
                try {
                    await document.exitFullscreen();
                } catch (e) { console.warn(e); }
            }

            // Save Result & Calculate Score via Backend
            if (submissionId) {
                try {
                     const response = await fetch(`${API_BASE_URL}/api/index`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'submit-test',
                            payload: {
                                submission_id: submissionId,
                                answers: answers, // Send all answers mapping { question_id: option_text }
                                total_questions: questions.length,
                                user_id: userDetails.id
                            }
                        })
                     });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setScore(data.score || 0);
                        
                        // Backend should return populated questions (with correct_option_index) 
                        if (data.questions && Array.isArray(data.questions)) {
                            // Map the returned questions to the expected structure
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
                        sessionStorage.removeItem("examTestId");
                        sessionStorage.removeItem("submissionId");
                    } else {
                        toast.error("Failed to submit exam via API.");
                    }
                    
                } catch (err) {
                    console.error("Unexpected error in handleSubmit:", err);
                }

                // Clear Autosave
                if (userDetails?.id && selectedTest?.id) {
                     localStorage.removeItem(`exam_progress_${userDetails.id}_${selectedTest.id}`);
                }
            }
        }
    };

    // Timer Effect (Moved here to be unconditional)
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (selectedTest && !isSubmitted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitExam(); // Auto submit
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
            const storageKey = `exam_progress_${userDetails.id}_${selectedTest.id}`;
            const stateToSave = {
                answers,
                currentQuestionIndex,
                timeLeft,
                submissionId,
                isSubmitted: false, // Explicitly not submitted
                timestamp: Date.now()
            };
            
            console.log("Autosave: Saving...", storageKey, Object.keys(answers).length);
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } else {
             if (selectedTest && !isSubmitted) {
                 console.log("Autosave: Skipped. Reason:", { 
                     hasTest: !!selectedTest, 
                     hasUser: !!userDetails?.id, 
                     notSubmitted: !isSubmitted, 
                     hasSubId: !!submissionId 
                 });
             }
        }
    }, [answers, currentQuestionIndex, timeLeft, selectedTest, userDetails, isSubmitted, submissionId]);

    // Clear autosave on unmount/submit handled in handleSubmitExam logic mostly,
    // but we need to ensure clear on successful submit.

    // --- RENDER MODES ---

    const renderContent = () => {

    // -2. Auth Check Loading
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-3">
                <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                <p className="text-gray-500 text-sm font-medium">Verifying Credentials...</p>
            </div>
        );
    }
    
    // -1. Landing Page
    if (showLanding) {
        return (
            <ExamLanding 
                onStart={handleStartFromLanding} 
                onLogin={() => { setAuthMode("signin"); setIsAuthOpen(true); }}
                onSignup={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
            />
        );
    }

    // 0. Loading
    if (loading && !selectedTest && activeTests.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Loading Exam Portal...</div>;
    }

    // Timer Logic - helper function
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    // -0.5 Purchase View
    if (!selectedTest && showPurchaseView) {
        return (
            <ExamPurchaseView 
                tests={activeTests.filter(t => t.price > 0)}
                price={examDataService.BUNDLE_PRICE}
                onBack={() => setShowPurchaseView(false)}
                onPay={handleProcessPayment}
            />
        );
    }

    // -0.25 Premium List View
    const isPremiumView = searchParams.get('view') === 'premium';
    if (!selectedTest && isPremiumView) {
        return (
            <PremiumTestsList 
                tests={activeTests.filter(t => t.price > 0)}
                onSelectTest={handleSelectTest}
                onBack={() => setSearchParams({})}
                userId={userDetails?.id}
            />
        );
    }


    // 1. Test Selection Mode (Dashboard)
    if (!selectedTest) {
         return (
             <ExamDashboard 
                 userDetails={userDetails}
                 onLogout={handleLogout}
                 onEditProfile={() => setShowUserDetailsModal(true)}
                 activeTests={activeTests}
                 purchases={purchases}
                 onSelectTest={handleSelectTest}
                 onBuyBundle={handleBuyBundle}
                 onOpenPremium={() => {
                     setSearchParams({ view: 'premium' });
                 }}
                 userId={userDetails?.id}
             />
         );
    }

    // 3. Submission Result Mode
    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col font-jakarta">
                {/* Minimal Header */}
                <header className="bg-white border-b border-gray-200 py-3 px-6 shrink-0">
                    <div className="container-magazine flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <img
                                src={mainLogoImg}
                                alt="AgriCatalogues Logo"
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                         </div>
                         <Button variant="ghost" onClick={() => {
                             // Reset test state but keep user logged in
                             setIsSubmitted(false);
                             setAnswers({});
                             setScore(0);
                             setSelectedTest(null);
                             sessionStorage.removeItem("submissionId");
                             sessionStorage.removeItem("examTestId");
                             loadTests();
                         }}>
                             Back
                         </Button>
                    </div>
                </header>
                <div className="flex-1 min-h-screen bg-green-50 flex flex-col items-center p-8 space-y-8 animate-in fade-in duration-500">
                    <Card className="max-w-3xl w-full p-8 text-center space-y-6 shadow-md border-green-100">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-200 blur-xl opacity-50 rounded-full" />
                                <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-green-900">Exam Submitted!</h1>
                        <p className="text-xl text-gray-600">
                            Great job, <span className="font-semibold text-gray-900">{userDetails?.name}</span>!
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-3xl font-bold text-gray-900">{questions.length}</div>
                                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">Total</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                                <div className="text-3xl font-bold text-green-700">{Object.keys(answers).length}</div>
                                <div className="text-sm text-green-600 font-medium uppercase tracking-wide mt-1">Attempted</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="text-3xl font-bold text-blue-700">{score}</div>
                                <div className="text-sm text-blue-600 font-medium uppercase tracking-wide mt-1">Score</div>
                            </div>
                        </div>

                        {/* Topic Analysis */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-left">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-purple-600" /> Topic-wise Performance
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(questions.reduce((acc: any, q) => {
                                    const topic = selectedTest?.title || 'General';
                                    
                                    if (!acc[topic]) acc[topic] = { total: 0, correct: 0 };
                                    acc[topic].total++;
                                    if (answers[q.id] === q.options[q.correctOptionIndex]) acc[topic].correct++;
                                    return acc;
                                }, {})).map(([topic, data]: [string, any]) => {
                                    const percent = Math.round((data.correct / data.total) * 100);
                                    let color = "bg-red-500";
                                    if (percent >= 70) color = "bg-green-500";
                                    else if (percent >= 40) color = "bg-yellow-500";
                                    
                                    return (
                                        <div key={topic} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-700">{topic}</span>
                                                <span className="text-gray-500">{data.correct}/{data.total} ({percent}%)</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${color} transition-all duration-500`} 
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            {percent < 50 && (
                                                <div className="text-xs text-red-600 font-medium mt-1">
                                                    * Need more focus on {topic}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Premium Upsell CTA */}
                        {selectedTest && Number(selectedTest.price) === 0 && (
                            <div className="mt-10 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 md:p-8 rounded-2xl border border-yellow-200/50 shadow-lg relative overflow-hidden text-left print:hidden">
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/80 text-yellow-800 text-xs font-bold uppercase tracking-wider mb-4 border border-yellow-200">
                                        <Lock className="w-4 h-4" /> Limited Access Preview
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">Master all 1000+ Practical Questions</h3>
                                    <p className="text-gray-700 mb-6 text-lg">
                                        You've just completed 1 of our 20 premium mock tests. Top rankers use our full bundle to practice real specimen identification and time management.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                                        <Button 
                                            onClick={() => setShowPurchaseView(true)} 
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg md:text-xl px-8 py-6 h-auto shadow-xl shadow-green-600/30 w-full sm:w-auto transform transition-transform hover:-translate-y-1"
                                        >
                                            Unlock All Mock Tests for ₹2000
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4 flex items-center gap-1.5 font-medium"><ShieldCheck className="w-4 h-4 text-green-600" /> Secure payment via Razorpay. Instant Access.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-4 border-t border-gray-100 pt-8 mt-4">
                            <Button onClick={() => window.location.reload()} variant="outline" className="print:hidden">
                                Take Exam Again
                            </Button>
                            <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 print:hidden text-white shadow-md">
                                <Printer className="w-4 h-4 mr-2" /> Download Report
                            </Button>
                        </div>
                    </Card>

                    <style>{`
                        @media print {
                            header, button, .print\\:hidden { display: none !important; }
                            body { background: white; }
                            .min-h-screen { height: auto; }
                            .bg-green-50 { background: white !important; }
                        }
                    `}</style>

                    {/* Detailed Analysis */}
                    <div className="max-w-3xl w-full space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Detailed Analysis</h2>
                        {questions.map((q: any) => {
                            const userAnswer = answers[q.id];
                            const correctIndex = q.correctOptionIndex;
                            const correctOption = correctIndex !== undefined ? q.options[correctIndex] : null;
                            const isCorrect = userAnswer === correctOption;
                            const isSkipped = !userAnswer;
                            const isWrong = !isSkipped && !isCorrect;

                            return (
                                <Card
                                    key={q.id}
                                    className={cn(
                                        "p-6 border-l-4 shadow-sm overflow-hidden transition-all hover:shadow-md",
                                        isCorrect ? "border-l-green-500 bg-green-50/30" :
                                            isWrong ? "border-l-red-500 bg-red-50/30" :
                                                "border-l-gray-400 bg-gray-50/30"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 shrink-0">
                                            {isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                                            {isWrong && <XCircle className="w-6 h-6 text-red-600" />}
                                            {isSkipped && <HelpCircle className="w-6 h-6 text-gray-400" />}
                                        </div>
                                        <div className="flex-1 space-y-3 min-w-0">
                                            {q.image && (
                                                <div className="flex flex-wrap gap-4 mb-4">
                                                    <ZoomableImage
                                                        src={q.image}
                                                        alt="Question Image"
                                                        className="block"
                                                        imageClassName="max-h-48 rounded border border-gray-200 object-contain w-auto bg-white"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="font-semibold text-lg text-gray-900 leading-snug">
                                                    <span className="text-gray-500 mr-2 font-mono text-base">Q{q.id}.</span>
                                                    {q.question}
                                                </h3>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0",
                                                    isCorrect ? "bg-green-100 text-green-700" :
                                                        isWrong ? "bg-red-100 text-red-700" :
                                                            "bg-gray-100 text-gray-600"
                                                )}>
                                                    {isCorrect ? "Correct" : isWrong ? "Incorrect" : "Skipped"}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mt-4">
                                                {q.options.map((option: string, optIdx: number) => {
                                                    const isSelected = userAnswer === option;
                                                    const isThisCorrect = option === correctOption;

                                                    let styles = "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
                                                    let badge = null;

                                                    if (isThisCorrect) {
                                                        styles = "border-green-500 bg-green-50 text-green-900 font-medium ring-1 ring-green-500";
                                                        badge = <span className="text-green-700 text-xs font-bold flex items-center gap-1 shrink-0"><CheckCircle2 className="w-3 h-3" /> Correct Answer</span>;
                                                    } else if (isSelected && !isThisCorrect) {
                                                        styles = "border-red-500 bg-red-50 text-red-900 font-medium ring-1 ring-red-500";
                                                        badge = <span className="text-red-700 text-xs font-bold flex items-center gap-1 shrink-0"><XCircle className="w-3 h-3" /> Your Choice</span>;
                                                    } else {
                                                        styles = "opacity-80";
                                                    }

                                                    return (
                                                        <div key={optIdx} className={cn(
                                                            "flex justify-between items-center p-3 rounded-lg border text-sm transition-all gap-3",
                                                            styles
                                                        )}>
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className={cn(
                                                                    "w-6 h-6 flex items-center justify-center rounded-full border text-xs font-mono shadow-sm shrink-0",
                                                                    isThisCorrect ? "bg-green-100 border-green-300 text-green-700" :
                                                                        isSelected ? "bg-red-100 border-red-300 text-red-700" :
                                                                            "bg-gray-50 border-gray-200 text-gray-500"
                                                                )}>
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span className="truncate whitespace-normal">{option}</span>
                                                            </div>
                                                            {badge}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // 4. Exam Interface Mode (Active) - NO LAYOUT, Minimal UI
    // Wait for questions to load
    if (questions.length === 0) {
        return (
             <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                 <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                 <p className="text-gray-500">Loading Questions...</p>
             </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return <div>Error: Index out of bounds</div>;
    const qId = currentQuestion.id;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-50/50">
            {/* Minimal Exam Toolbar / Status Bar */}
            <div className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between shadow-sm shrink-0 z-10 sticky top-0">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {userDetails?.name?.charAt(0) || "U"}
                    </div>
                    <span className="hidden sm:inline">{userDetails?.name}</span>
                    <span className="text-xs text-gray-400 mx-2">|</span>
                    <span className="text-sm text-gray-600 max-w-[150px] truncate" title={selectedTest.title}>{selectedTest.title}</span>
                </div>



                <div className="flex items-center space-x-4 text-sm font-medium text-gray-600">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-gray-900 gap-1 flex"
                        onClick={() => {
                            // Go Back to Dashboard (Autosave handles state preservation)
                            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                            setSelectedTest(null);
                            sessionStorage.removeItem("examTestId");
                             // submissionId persists in session to prevent creating new one immediately if they click resume, 
                             // but handleSelectTest logic will check localStorage anyway.
                             // Actually better to clear session specific hooks so handleSelectTest runs fresh checks
                             sessionStorage.removeItem("submissionId");
                             loadTests(); // Refresh list potentially
                        }}
                    >
                        <LogOut className="w-4 h-4 rotate-180" /> {/* Using LogOut rotated as "Back" or just ArrowLeft */}
                        <span className="hidden sm:inline">Exit</span>
                    </Button>
                    {/* Timer Badge */}
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-colors",
                         timeLeft < 300 ? "bg-red-50 text-red-700 border-red-200 animate-pulse" : "bg-gray-900 text-white border-gray-800 shadow-inner"
                    )}>
                        <Clock className={cn("w-4 h-4", timeLeft < 300 ? "text-red-600" : "text-gray-300")} />
                        <span className="font-mono font-bold text-base min-w-[60px] text-center tracking-wider">
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3 hidden md:flex">
                        <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-md border border-green-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Answered:</span>
                            <strong>{answeredCount}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200">
                            <Circle className="w-4 h-4" />
                            <span className="hidden sm:inline">Remaining:</span>
                            <strong>{questions.length - answeredCount}</strong>
                        </span>
                    </div>
                        
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content: Question */}
                <div className="flex-1 p-2 md:p-4 overflow-hidden flex flex-col items-center">
                    <div className="max-w-5xl w-full flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-hidden">
                             {/*
                                We need to adapt the QuestionCard to work with the new interface
                                OR map the fields.
                                The QuestionCard expects `question` object with `id, question, options, image`.
                                My MockQuestion interface has these fields (mapped in dataService).
                                So passing `currentQuestion` directly should work if types align.
                              */}
                            <QuestionCard
                                key={currentQuestion.id}
                                question={currentQuestion as any} 
                                selectedOption={answers[qId] || null}
                                onSelect={handleOptionSelect}
                                currentQuestionIndex={currentQuestionIndex}
                            />
                        </div>

                        {/* Navigation Bar */}
                        <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                            <Button
                                variant="outline"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => handleNavigate(currentQuestionIndex - 1)}
                                className="w-28 md:w-32"
                            >
                                Previous
                            </Button>

                            <div className="text-sm font-medium text-gray-500 hidden sm:block">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </div>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white w-28 md:w-32 shadow-lg shadow-green-900/10"
                                    onClick={handleSubmitExam}
                                >
                                    Submit
                                </Button>
                            ) : (
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-28 md:w-32 shadow-lg shadow-blue-900/10"
                                    onClick={() => handleNavigate(currentQuestionIndex + 1)}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </div>



                {/* Sidebar: Question Palette */}
                <div className="w-72 bg-white border-l border-gray-200 hidden lg:flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-gray-100 font-semibold text-gray-800 bg-gray-50/50 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-blue-500" />
                        Question Palette
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCurrent = idx === currentQuestionIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => handleNavigate(idx)}
                                        className={cn(
                                            "aspect-square rounded-md flex items-center justify-center text-sm font-semibold transition-all shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
                                            isCurrent ? "ring-2 ring-blue-600 ring-offset-2 z-10 scale-110" : "",
                                            isAnswered
                                                ? "bg-green-600 text-white border-transparent shadow-green-600/20"
                                                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-gray-200 space-y-3 bg-gray-50/50 text-sm">
                         <div className="flex items-center space-x-3 text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-green-600 rounded-sm shadow-sm flex items-center justify-center text-white text-[10px]"><CheckCircle2 className="w-3 h-3" /></div>
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-white border border-gray-300 rounded-sm shadow-sm"></div>
                            <span>Unanswered</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-700 font-medium">
                            <div className="w-5 h-5 bg-white border-2 border-blue-600 rounded-sm shadow-sm"></div>
                            <span>Current</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    };

    return (
        <>
            <ExamAuthModal 
                isOpen={isAuthOpen} 
                onClose={() => setIsAuthOpen(false)} 
                onSignupSuccess={handleSignupSuccess}
                initialMode={authMode} 
            />
            <UserDetailsModal
                isOpen={showUserDetailsModal}
                userEmail={userDetails?.email || user?.email || ""}
                initialData={!isProfileIncomplete && userDetails ? {
                    name: userDetails.name || "",
                    mobile: userDetails.mobile || "",
                    email: userDetails.email || "",
                    college: userDetails.college || "",
                    district: userDetails.district || "",
                    guardianName: userDetails.guardianName || "",
                    guardianProfession: userDetails.guardianProfession || "",
                    guardianContact: userDetails.guardianContact || "",
                } : undefined}
                onComplete={handleDetailsComplete}
                onCancel={isProfileIncomplete ? handleLogoutFromModal : () => setShowUserDetailsModal(false)}
            />
            {renderContent()}
        </>
    );
}
