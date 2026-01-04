import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>("");

    // Note: AuthContext now expects (password, email) to match the previous signature that was swapped
    // Wait, in my previous tool call for AuthContext I defined: login: (password: string, email: string)
    // to maintain some consistency, though it's weird. Let's strict check.
    // "login: (password: string, email: string) => ..." 
    // So caller must do login(password, email).

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/admin";

    useEffect(() => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!url || !key) {
            setDebugInfo("ERROR: Missing .env variables! VITE_SUPABASE_URL or ANON_KEY is empty.");
        } else {
            setDebugInfo(`Config Loaded for: ${url.substring(0, 15)}...`);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Context defined as (password, email)
            const { success, error } = await login(password, email);
            if (success) {
                toast.success("Welcome back!");
                navigate(from, { replace: true });
            } else {
                const msg = error || "Invalid credentials";
                toast.error(msg);
                setDebugInfo(prev => `${prev}\nLogin Error: ${msg}`);
            }
        } catch (error: any) {
            toast.error("An error occurred");
            setDebugInfo(prev => `${prev}\nException: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your Supabase credentials
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {debugInfo && (
                            <div className="p-3 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-200 whitespace-pre-wrap font-mono">
                                {debugInfo}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@agri.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
