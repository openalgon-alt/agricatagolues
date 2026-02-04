import { useState, useEffect } from "react";
import questionsData from "@/data/questions.json";
import { UserDetailsModal } from "@/components/exam/UserDetailsModal";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { ZoomableImage } from "@/components/exam/ZoomableImage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, XCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase";

export default function ExamPage() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [userDetails, setUserDetails] = useState<any>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submissionId, setSubmissionId] = useState<number | null>(null);

    useEffect(() => {
        // Check session storage
        const storedUser = sessionStorage.getItem("examUser");
        const storedSubId = sessionStorage.getItem("submissionId");
        if (storedUser) {
            setUserDetails(JSON.parse(storedUser));
            setIsModalOpen(false);
        }
        if (storedSubId) {
            setSubmissionId(parseInt(storedSubId));
        }
    }, []);

    const handleUserComplete = async (data: any) => {
        sessionStorage.setItem("examUser", JSON.stringify(data));
        setUserDetails(data);
        setIsModalOpen(false);

        try {
            // Save registration immediately to capture lead
            console.log("Saving registration for:", data);
            const { data: subData, error } = await supabase.from('exam_submissions').insert([
                {
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    college: data.college,
                    score: 0, // Placeholder
                    total_questions: questionsData.length
                }
            ]).select();

            if (error) {
                console.error("Supabase Error saving registration:", error);
                toast.error("Connected to exam, but background save failed: " + error.message);
            } else if (subData && subData[0]) {
                const newId = subData[0].id;
                setSubmissionId(newId);
                sessionStorage.setItem("submissionId", newId.toString());
                console.log("Registration saved with ID:", newId);
            }
        } catch (err) {
            console.error("Unexpected error saving registration:", err);
        }

        toast.success("Registration Successful. Good Luck!");
    };

    const handleOptionSelect = (option: string) => {
        if (isSubmitted) return;
        const qId = questionsData[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleNavigate = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handleSubmit = async () => {
        if (window.confirm("Are you sure you want to submit the exam?")) {
            let newScore = 0;
            questionsData.forEach((q: any) => {
                const userAnswer = answers[q.id];
                if (userAnswer && q.correctOptionIndex !== undefined) {
                    const correctAnswer = q.options[q.correctOptionIndex];
                    if (userAnswer === correctAnswer) {
                        newScore++;
                    }
                }
            });
            setScore(newScore);

            // Save or Update Supabase
            if (userDetails) {
                try {
                    let error;
                    if (submissionId) {
                        // Update existing record
                        console.log("Updating submission ID:", submissionId);
                        const result = await supabase.from('exam_submissions')
                            .update({ score: newScore, total_questions: totalQuestions })
                            .eq('id', submissionId);
                        error = result.error;
                    } else {
                        // Fallback: Insert new if no ID found
                        console.log("Submitting new exam entry for user:", userDetails);
                        const result = await supabase.from('exam_submissions').insert([
                            {
                                name: userDetails.name,
                                phone: userDetails.phone,
                                email: userDetails.email,
                                college: userDetails.college,
                                score: newScore,
                                total_questions: totalQuestions
                            }
                        ]);
                        error = result.error;
                    }

                    if (error) {
                        console.error("Supabase Error submitting exam:", error);
                        toast.error(`Submission Failed: ${error.message || "Unknown error"}`);
                    } else {
                        console.log("Submission successful");
                        // Clear session
                        sessionStorage.removeItem("examUser");
                        sessionStorage.removeItem("submissionId");
                        toast.success("Exam submitted successfully!");
                    }
                } catch (err) {
                    console.error("Unexpected error in handleSubmit:", err);
                    toast.error("An unexpected error occurred during submission.");
                }
            } else {
                console.error("No userDetails found in state!");
                toast.error("User details missing. Result not saved to database.");
            }

            setIsSubmitted(true);
        }
    };

    const currentQuestion = questionsData[currentQuestionIndex];
    const qId = currentQuestion.id;
    const totalQuestions = questionsData.length;
    const answeredCount = Object.keys(answers).length;

    if (isSubmitted) {
        return (
            <Layout>
                <div className="min-h-screen bg-green-50 flex flex-col items-center p-8 space-y-8">
                    {/* Summary Card */}
                    <Card className="max-w-3xl w-full p-8 text-center space-y-6 shadow-md border-green-100">
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-24 h-24 text-green-500" />
                        </div>
                        <h1 className="text-4xl font-bold text-green-900">Exam Submitted</h1>
                        <p className="text-xl text-gray-600">
                            Thank you, <span className="font-semibold">{userDetails?.name}</span>!
                        </p>
                        <p className="text-gray-500">
                            Your response has been recorded. Below is your performance analysis.
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-gray-900">{totalQuestions}</div>
                                <div className="text-sm text-gray-500">Total Questions</div>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-green-700">{answeredCount}</div>
                                <div className="text-sm text-green-600">Answered</div>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-blue-700">{score}</div>
                                <div className="text-sm text-blue-600">Correct Answers</div>
                            </div>
                        </div>
                        <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700 mt-8">
                            Take Again
                        </Button>
                    </Card>

                    {/* Detailed Analysis */}
                    <div className="max-w-3xl w-full space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Detailed Analysis</h2>
                        {questionsData.map((q: any, index: number) => {
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
                                        "p-6 border-l-4 shadow-sm overflow-hidden",
                                        isCorrect ? "border-l-green-500 bg-green-50/30" :
                                            isWrong ? "border-l-red-500 bg-red-50/30" :
                                                "border-l-gray-400 bg-gray-50/30"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                                            {isWrong && <XCircle className="w-6 h-6 text-red-600" />}
                                            {isSkipped && <HelpCircle className="w-6 h-6 text-gray-400" />}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    <span className="text-gray-500 mr-2">Q{q.id}.</span>
                                                    {q.question}
                                                </h3>
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded uppercase",
                                                    isCorrect ? "bg-green-100 text-green-700" :
                                                        isWrong ? "bg-red-100 text-red-700" :
                                                            "bg-gray-100 text-gray-600"
                                                )}>
                                                    {isCorrect ? "Correct" : isWrong ? "Incorrect" : "Skipped"}
                                                </span>
                                            </div>

                                            {q.image && (
                                                <div className="my-4">
                                                    <ZoomableImage
                                                        src={q.image}
                                                        alt={`Question ${q.id}`}
                                                        className="block"
                                                        imageClassName="max-h-48 rounded border border-gray-200 object-contain w-auto"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2 mt-4">
                                                {q.options.map((option: string, optIdx: number) => {
                                                    const isSelected = userAnswer === option;
                                                    const isThisCorrect = option === correctOption;

                                                    let styles = "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
                                                    let badge = null;

                                                    if (isThisCorrect) {
                                                        styles = "border-green-500 bg-green-50 text-green-900 font-medium ring-1 ring-green-500";
                                                        badge = <span className="text-green-700 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Correct Answer</span>;
                                                    } else if (isSelected && !isThisCorrect) {
                                                        styles = "border-red-500 bg-red-50 text-red-900 font-medium ring-1 ring-red-500";
                                                        badge = <span className="text-red-700 text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Your Choice</span>;
                                                    } else {
                                                        styles = "opacity-70";
                                                    }

                                                    if (isSelected && isThisCorrect) {
                                                        badge = <span className="text-green-700 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Your Choice (Correct)</span>;
                                                    }

                                                    return (
                                                        <div key={optIdx} className={cn(
                                                            "flex justify-between items-center p-3 rounded-lg border text-sm transition-all",
                                                            styles
                                                        )}>
                                                            <div className="flex items-center gap-3">
                                                                <span className={cn(
                                                                    "w-6 h-6 flex items-center justify-center rounded-full border text-xs font-mono shadow-sm",
                                                                    isThisCorrect ? "bg-green-100 border-green-300 text-green-700" :
                                                                        isSelected ? "bg-red-100 border-red-300 text-red-700" :
                                                                            "bg-gray-50 border-gray-200 text-gray-500"
                                                                )}>
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span>{option}</span>
                                                            </div>
                                                            <div>
                                                                {badge}
                                                            </div>
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
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-[85vh] font-sans">
                <UserDetailsModal isOpen={isModalOpen} onComplete={handleUserComplete} />

                {/* Exam Toolbar / Status Bar */}
                <div className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-end shadow-sm shrink-0">
                    <div className="flex items-center space-x-4 text-sm font-medium text-gray-600">

                        <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Answered: {answeredCount}</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Remaining: {totalQuestions - answeredCount}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content: Question */}
                    <div className="flex-1 p-6 md:p-8 bg-gray-50 overflow-hidden flex flex-col items-center">
                        <div className="max-w-4xl w-full flex-1 flex flex-col min-h-0">
                            <div className="flex-1 min-h-0 mb-6">
                                <QuestionCard
                                    question={currentQuestion}
                                    selectedOption={answers[qId] || null}
                                    onSelect={handleOptionSelect}
                                />
                            </div>

                            {/* Navigation Bar */}
                            <div className="flex justify-between items-center shrink-0">
                                <Button
                                    variant="outline"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={() => handleNavigate(currentQuestionIndex - 1)}
                                >
                                    Previous
                                </Button>

                                {currentQuestionIndex === totalQuestions - 1 ? (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                                        onClick={handleSubmit}
                                    >
                                        Submit Exam
                                    </Button>
                                ) : (
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                                        onClick={() => handleNavigate(currentQuestionIndex + 1)}
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Question Palette */}
                    <div className="w-80 bg-white border-l border-gray-200 hidden md:flex flex-col shrink-0">
                        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 relative z-20 bg-white">
                            Question Palette
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="grid grid-cols-5 gap-3">
                                {questionsData.map((q, idx) => {
                                    const isAnswered = answers[q.id] !== undefined;
                                    const isCurrent = idx === currentQuestionIndex;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleNavigate(idx)}
                                            className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                                                isCurrent ? "ring-2 ring-blue-500 ring-offset-1 z-10" : "",
                                                isAnswered
                                                    ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                                                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                                            )}
                                        >
                                            {q.id}
                                        </button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t border-gray-200 space-y-2 relative z-20 bg-white">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                                <span>Not Visited / Unanswered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
