import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MockTest } from "@/services/examDataService";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Lock, Copy } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/services/examDataService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExamPurchaseViewProps {
    tests: MockTest[];
    price: number;
    onBack: () => void;
    onPay: () => void;
}

export function ExamPurchaseView({ tests, price, onBack, onPay }: ExamPurchaseViewProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [utrNumber, setUtrNumber] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [upiId, setUpiId] = useState('agriscience@upi');
    const [qrImageUrl, setQrImageUrl] = useState('');

    useEffect(() => {
        if (!isConfirmOpen) return;
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'get-settings' })
                });
                const data = await response.json();
                if (data.payment_upi_id) setUpiId(data.payment_upi_id);
                if (data.payment_qr_url) setQrImageUrl(data.payment_qr_url);
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        };
        fetchSettings();
    }, [isConfirmOpen]);

    const handleInitialClick = () => {
        setIsConfirmOpen(true);
    };

    const handleSubmitPayment = async () => {
        if (!utrNumber || !userEmail) {
            toast.error("Please fill in both Email and UTR fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit-payment-request',
                    payload: {
                        user_email: userEmail,
                        utr: utrNumber,
                        amount: price
                    }
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to submit request");

            toast.success("Payment details submitted successfully! You will receive access shortly after verification.");
            setIsConfirmOpen(false);
            setUtrNumber("");
            setUserEmail("");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                <div className="flex flex-row items-center justify-end gap-3 relative">
                    {/* Hanging 3D Attractive Tag */}
                    <div className="absolute top-[-12px] right-full mr-3 sm:mr-4 flex flex-col items-center origin-top transform -rotate-1 hover:rotate-2 transition-transform duration-500 cursor-pointer">
                        <div className="flex justify-between w-[85%] z-0 mb-[-1px]">
                            <div className="w-[1.5px] h-[22px] bg-gradient-to-b from-gray-300 to-gray-500 drop-shadow-sm shadow-inner"></div>
                            <div className="w-[1.5px] h-[22px] bg-gradient-to-b from-gray-300 to-gray-500 drop-shadow-sm shadow-inner"></div>
                        </div>
                        <div className="bg-red-950 rounded shadow-md z-10 animate-pulse">
                            <div className="bg-gradient-to-b from-red-500 to-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider transform -translate-y-[2px] border border-red-400 flex items-center gap-1 shadow-[0_4px_10px_rgba(239,68,68,0.5)] whitespace-nowrap">
                                <span>🔥</span>
                                <span className="drop-shadow-md pb-[1px]">Limited Time Offer</span>
                            </div>
                        </div>
                    </div>
                    
                    <Button onClick={handleInitialClick} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20 h-auto py-1.5 px-3 flex flex-col items-center">
                        <div className="text-[9px] flex items-center gap-1 opacity-90 leading-none mb-0.5">
                            <span className="line-through">₹4000</span>
                            <span className="bg-white/20 text-white px-1 py-0.5 rounded text-[8px] uppercase tracking-wider">50% Off</span>
                        </div>
                        <span className="leading-none text-sm">Pay ₹{price}</span>
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
                
                {/* Value Props */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-yellow-900 font-bold text-base flex-wrap">
                        <ShieldCheck className="w-5 h-5 text-yellow-700" />
                        Complete Practice Access – 
                        <span className="line-through text-gray-400 font-medium ml-1">₹4000</span>
                        <span className="text-green-700 text-lg ml-1">₹{price}</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-bold ml-2 shadow-sm">50% OFF</span>
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
                <DialogContent className="sm:max-w-md bg-white border-green-100 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Lock className="w-5 h-5 text-green-600" /> Unlock Full Access
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Pay ₹{price} via UPI and submit details below for instant access.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-2 space-y-4">
                        {/* Summary Box */}
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100 shadow-sm">
                            <span className="font-semibold text-green-900">Total Amount</span>
                            <div className="text-right flex items-center gap-2">
                                <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold shadow-sm">50% OFF</span>
                                <span className="text-sm text-gray-400 line-through">₹4000</span>
                                <span className="text-2xl font-black text-green-700">₹{price}</span>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center space-y-2">
                            <p className="text-sm font-semibold text-blue-900">Step 1: Make Payment</p>
                            <p className="text-xs text-blue-800/80">Scan QR or pay directly to our UPI ID:</p>
                            <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm inline-block mx-auto mt-2 min-w-[200px]">
                                {qrImageUrl ? (
                                    <div className="w-32 h-32 mb-2 mx-auto overflow-hidden rounded bg-gray-50 flex items-center justify-center border border-gray-200">
                                        <img src={qrImageUrl} alt="UPI QR" className="max-w-full max-h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded mb-2 mx-auto">
                                        <span className="text-xs text-gray-400 font-medium px-2 text-center">Setup QR in Admin Panel</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between bg-gray-50 rounded border border-gray-200 mt-2 p-1 pl-3">
                                    <span className="text-sm font-bold text-gray-800 select-all">
                                        {upiId}
                                    </span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 px-2 text-blue-600 hover:bg-blue-100 flex gap-1 items-center"
                                        onClick={() => {
                                            navigator.clipboard.writeText(upiId);
                                            toast.success("UPI ID copied to clipboard!");
                                        }}
                                    >
                                        <Copy className="h-3 w-3" /> <span className="text-[10px] uppercase font-bold">Copy</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="space-y-4 pt-2">
                            <div className="text-center bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                <p className="text-xs font-medium text-yellow-800">
                                    Step 2: After a successful payment, please submit your transaction details below to instantly unlock your access.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Registered Email Address <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="your.email@example.com"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        className="h-10 text-sm border-gray-300 focus:border-green-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="utr" className="text-xs font-semibold text-gray-700">12-Digit UTR / Ref Number <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="utr" 
                                        type="text" 
                                        placeholder="e.g., 312345678901" 
                                        value={utrNumber}
                                        onChange={(e) => setUtrNumber(e.target.value)}
                                        maxLength={12}
                                        className="h-10 text-sm font-mono border-gray-300 focus:border-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button 
                            onClick={handleSubmitPayment} 
                            disabled={!utrNumber || !userEmail || isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-base shadow-sm group"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Submitting Details...</>
                            ) : (
                                "Submit Payment Details for Verification"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}
