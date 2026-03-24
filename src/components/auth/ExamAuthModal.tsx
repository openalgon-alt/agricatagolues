import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useExamAuth } from "@/context/ExamAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import mainLogoImg from "@/assets/main-logo.png";

interface ExamAuthModalProps {
    isOpen: boolean;
    onClose?: () => void;
    initialMode?: "signin" | "signup";
}

export function ExamAuthModal({ isOpen, onClose, initialMode = "signin" }: ExamAuthModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    
    const { examLogin, examSignup, examGoogleLogin } = useExamAuth();

    // Sync mode when modal opens with a new initialMode
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await examGoogleLogin();
            if (result.success) {
                toast.success("Signed in with Google successfully!");
                if (onClose) onClose();
            } else {
                toast.error(result.error || "Google Login failed.");
            }
        } catch (error: any) {
             console.error(error);
             toast.error(error.message || "Google Login Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = mode === "signin" ? examLogin : examSignup;
            const result = await method(email, password);

            if (result.success) {
                toast.success(mode === "signin" ? "Signed in successfully!" : "Account created successfully!");
                if (onClose) onClose();
            } else {
                toast.error(result.error || "Authentication Failed");
            }
        } catch (error: any) {
             console.error(error);
             toast.error(error.message || "Authentication Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
            <DialogContent className="w-screen h-[100dvh] max-w-none rounded-none border-0 p-0 overflow-hidden flex fixed top-0 left-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=closed]:zoom-out-100 [&>button]:hidden text-gray-800" onInteractOutside={(e) => e.preventDefault()}>
                <DialogTitle className="sr-only">Authentication</DialogTitle>
                <DialogDescription className="sr-only">Sign in or create an account to continue</DialogDescription>
                
                {/* Left Side: Image / Brand */}
                <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black text-white p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10">
                        {/* Logo Container - White background to ensure logo visibility */}
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg inline-block shadow-lg">
                            <img src={mainLogoImg} alt="AgriCatalogues Logo" className="w-32 h-auto" />
                        </div>
                    </div>
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-medium leading-tight text-white/95 mb-6 drop-shadow-sm">
                            Agriculture is not just a subject.<br />
                            It is the science of feeding the future.
                        </h2>
                    </div>
                    <div className="relative z-10 text-sm text-green-100/80 font-medium">
                         © 2026 AgriCatalogues
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="flex-1 flex flex-col w-full lg:w-1/2 bg-white relative overflow-y-auto">
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-4 left-4 lg:left-8 px-2 text-gray-500 hover:text-gray-900 z-10"
                        onClick={onClose}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <div className="flex-1 flex flex-col pt-16 lg:pt-20 pb-8 px-8 sm:px-20 lg:px-24 max-w-2xl mx-auto w-full">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
                            </h2>
                            <p className="text-gray-500 mt-2">
                                {mode === 'signin' ? 'Enter your details to access your exams.' : 'Join thousands of students preparing for success.'}
                            </p>
                        </div>

                        <Tabs value={mode} onValueChange={(v) => {
                            const newMode = v as "signin" | "signup";
                            setMode(newMode);
                        }} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-sm font-medium">Sign In</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-sm font-medium">Sign Up</TabsTrigger>
                            </TabsList>

                            <div className="space-y-6">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="w-full h-12 flex items-center justify-center gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-4 text-gray-500 font-medium">
                                            Or continue with email
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleEmailAuth} className="space-y-4">
                                    <div className="space-y-1.5 align-left text-left">
                                        <Label className="text-gray-700">Email Address</Label>
                                        <Input 
                                            type="email" 
                                            placeholder="student@example.com" 
                                            className="h-11 bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required 
                                        />
                                    </div>

                                    <div className="space-y-1.5 align-left text-left">
                                        <Label className="text-gray-700">Password</Label>
                                        <Input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            className="h-11 bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required 
                                            minLength={6}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-12 text-base bg-green-700 hover:bg-green-800 font-semibold shadow-sm mt-4 text-white" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signin' ? "Sign In" : "Create Account")}
                                    </Button>
                                </form>
                            </div>
                        </Tabs>
                    </div>
                    <div className="bg-gray-50 py-4 pb-8 md:pb-4 text-center text-xs text-gray-500 border-t border-gray-100">
                        By continuing, you agree to our <Link to="/terms-of-service" className="underline hover:text-green-700">Terms of Service</Link> and <Link to="/privacy-policy" className="underline hover:text-green-700">Privacy Policy</Link>.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
