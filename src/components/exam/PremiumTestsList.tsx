import { Button } from "@/components/ui/button";
import { MockTest } from "@/services/examDataService";
import { ArrowLeft, Clock, HelpCircle, Search, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface PremiumTestsListProps {
    tests: MockTest[];
    onSelectTest: (test: MockTest) => void;
    onBack: () => void;
    userId?: string;
}

export function PremiumTestsList({ tests, onSelectTest, onBack, userId }: PremiumTestsListProps) {
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
    {tests.slice(0, 20).map((t, index) => {
        // Use state to force re-render when storage is checked
        const [hasProgress, setHasProgress] = useState(false);

        useEffect(() => {
            if (userId) {
                const storageKey = `exam_progress_${userId}_${t.id}`;
                const exists = !!localStorage.getItem(storageKey);
                setHasProgress(exists);
            }
        }, [userId, t.id]);

        return (
            <div 
                key={t.id} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all relative overflow-hidden gap-4"
            >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-100 group-hover:bg-green-500 transition-colors"></div>
                
                <div className="flex items-center gap-4 pl-2">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-lg border border-green-100 group-hover:bg-green-100 group-hover:scale-110 transition-all shrink-0">
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors line-clamp-1">
                            {t.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> 50 Questions</span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 200 Marks</span>
                        </div>
                    </div>
                </div>

                <div className="pr-2 flex justify-end">
                    <Button 
                        onClick={() => onSelectTest(t)}
                                        className={hasProgress 
                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200 font-semibold"
                                            : "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-900/10"
                                        }
                                        size="sm"
                                    >
                                        {hasProgress ? "Resume Test" : "Take Test"}
                                        <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
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
