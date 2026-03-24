import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MockTest } from "@/services/examDataService";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ExamPurchaseViewProps {
    tests: MockTest[];
    price: number;
    onBack: () => void;
    onPay: () => void;
}

export function ExamPurchaseView({ tests, price, onBack, onPay }: ExamPurchaseViewProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleInitialClick = () => {
        setIsConfirmOpen(true);
    };

    // Filter out the bundle itself from the display list
    const displayTests = tests.filter(t => !t.title.includes("(Bundle)"));

    return (
        <div className="h-screen bg-white font-jakarta flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Unlock Full Access</h1>
                        <p className="text-xs text-gray-500">20 Premium Tests included</p>
                    </div>
                </div>
                <Button onClick={handleInitialClick} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20">
                    Pay ₹{price}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
                
                {/* Value Props */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-yellow-900 font-bold text-base">
                        <ShieldCheck className="w-5 h-5 text-yellow-700" />
                        Complete Practice Access – ₹2000
                    </div>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-sm text-yellow-900/90">
                            <CheckCircle2 className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
                            <span>20 Full-Length Practical Mock Tests designed as per real exam pattern</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-yellow-900/90">
                            <CheckCircle2 className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
                            <span>50 questions per test for proper exam-time practice</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-yellow-900/90">
                            <CheckCircle2 className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
                            <span>Total of 1000+ exam-oriented questions covering the full practical syllabus</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-yellow-900/90">
                            <CheckCircle2 className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
                            <span>Real specimen and image-based questions to improve viva confidence</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-yellow-900/90">
                            <CheckCircle2 className="w-4 h-4 text-yellow-700 mt-0.5 shrink-0" />
                            <span>Detailed performance analysis to identify strengths and weak areas</span>
                        </li>
                    </ul>
                    <div className="pt-2 border-t border-yellow-200/50 space-y-1">
                        <p className="text-sm font-semibold text-yellow-800">
                            ₹100 per full mock test. Less than ₹2 per question.
                        </p>
                        <p className="text-xs text-yellow-700">
                            One-time payment. Full access. No hidden charges.
                        </p>
                    </div>
                </div>

                {/* Test List */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Included Tests</h3>
                    <div className="space-y-3">
                        {displayTests.map((test, index) => (
                            <div key={test.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-colors">
                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{test.title}</h4>
                                    <p className="text-xs text-gray-500">50 Questions • 200 Marks</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-green-600 text-green-700 hover:bg-green-50"
                                    onClick={handleInitialClick}
                                >
                                    Take Test
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Unlock Full Access</DialogTitle>
                        <DialogDescription>
                            Get unlimited access to all {displayTests.length} mock tests and detailed performance analytics.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
                            <span className="font-medium text-gray-700">Total Amount</span>
                            <span className="text-2xl font-bold text-green-700">₹{price}</span>
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={() => { setIsConfirmOpen(false); onPay(); }} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                            Pay Securely
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}
