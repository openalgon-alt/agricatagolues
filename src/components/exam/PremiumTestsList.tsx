import { Button } from "@/components/ui/button";
import { MockTest } from "@/services/examDataService";
import { ArrowLeft, Clock, HelpCircle, Search, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface PremiumTestsListProps {
    tests: MockTest[];
    submissions?: any[];
    onSelectTest: (test: MockTest, retake?: boolean) => void;
    onViewResult: (submission: any) => void;
    onBack: () => void;
    userId?: string;
}

export function PremiumTestsList({ tests, submissions = [], onSelectTest, onViewResult, onBack, userId }: PremiumTestsListProps) {
    return (
        <div className="min-h-screen bg-gray-50 font-jakarta flex flex-col">
             {/* Header */}
             <div className="bg-white border-b border-gray-200 py-3 px-6 shrink-0 sticky top-0 z-20 shadow-sm">
                <div className="container-magazine flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">All Practical Exams</h1>
                        <p className="text-xs text-gray-500">{tests.slice(0, 20).length} Premium Tests Available</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container-magazine py-6 max-w-4xl mx-auto w-full">
                <div className="space-y-3">
                    {tests.slice(0, 20).map((t, index) => (
                        <PremiumTestCard 
                            key={t.id} 
                            test={t} 
                            index={index} 
                            userId={userId} 
                            submissions={submissions}
                            onSelectTest={onSelectTest}
                            onViewResult={onViewResult}
                        />
                    ))}
                </div>
                {tests.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No premium tests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
function PremiumTestCard({ 
    test, 
    index, 
    userId, 
    submissions, 
    onSelectTest, 
    onViewResult 
}: { 
    test: MockTest, 
    index: number, 
    userId?: string, 
    submissions: any[], 
    onSelectTest: (t: MockTest, retake?: boolean) => void,
    onViewResult: (s: any) => void
}) {
    const [hasProgress, setHasProgress] = useState(false);
    
    const pastSubmission = submissions.find(s => 
        String(s.mockTestId) === String(test.id) || s.testTitle === test.title
    );

    useEffect(() => {
        if (userId && !pastSubmission) {
            const storageKey = `exam_progress_${userId}_${test.id}`;
            const exists = !!localStorage.getItem(storageKey);
            setHasProgress(exists);
        }
    }, [userId, test.id, pastSubmission]);

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all relative overflow-hidden gap-4">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-100 group-hover:bg-green-500 transition-colors"></div>
            
            <div className="flex items-center gap-4 pl-2">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-lg border border-green-100 group-hover:bg-green-100 group-hover:scale-110 transition-all shrink-0">
                    {index + 1}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors line-clamp-1">
                        {test.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> 50 Questions</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 200 Marks</span>
                    </div>
                </div>
            </div>

            <div className="pr-2 flex justify-end gap-2 shrink-0">
                {pastSubmission ? (
                    <>
                        <Button 
                            onClick={() => onViewResult(pastSubmission)}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            size="sm"
                        >
                            Result
                        </Button>
                        <Button 
                            onClick={() => {
                                if (window.confirm("Retake this test? Current progress will be lost.")) {
                                    onSelectTest(test, true);
                                }
                            }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            size="sm"
                        >
                            Retake
                        </Button>
                    </>
                ) : (
                    <Button 
                        onClick={() => onSelectTest(test)}
                        className={hasProgress 
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200 font-semibold"
                            : "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-900/10"
                        }
                        size="sm"
                    >
                        {hasProgress ? "Resume" : "Take Test"}
                        <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
