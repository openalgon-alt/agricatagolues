import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { examDataService, MockTest } from "@/services/examDataService";
import { Search, ShieldAlert, UserCheck, ShieldCheck, Mail, Database } from "lucide-react";

interface AccessRecord {
    id: number;
    user_id: string;
    user_name: string;
    user_email: string;
    mock_test_id: number;
    test_title: string;
    amount: string;
    status: string;
    payment_method: string;
    granted_by_admin: boolean;
    purchased_at: string;
}

export default function UserAccess() {
    const [email, setEmail] = useState("");
    const [foundUser, setFoundUser] = useState<{ user_id: string; name: string; email: string; phone: string } | null>(null);
    const [loadingLookup, setLoadingLookup] = useState(false);
    
    const [tests, setTests] = useState<MockTest[]>([]);
    const [selectedTestId, setSelectedTestId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("Online");
    const [amount, setAmount] = useState<string>("0");
    const [granting, setGranting] = useState(false);

    const [accessList, setAccessList] = useState<AccessRecord[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        loadTests();
        loadAccessList();
    }, []);

    const loadTests = async () => {
        try {
            const allTests = await examDataService.getMockTests(false); // get all tests including inactive
            // Keep the bundle if it exists, or inject it manually if missing.
            const regularTests = allTests.filter(t => Number(t.id) !== -1);
            
            setTests([
                { id: -1, title: "All Tests Bundle (Premium Pass)", price: 2000, category: "Bundle", description: "Access to all mock tests" },
                ...regularTests
            ]);
        } catch (error) {
            toast.error("Failed to load tests");
        }
    };

    const loadAccessList = async () => {
        setLoadingList(true);
        try {
            const response = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list-user-access' })
            });
            if (!response.ok) throw new Error("Failed to load list");
            const data = await response.json();
            
            // Ensure data is an array
            const arr = Array.isArray(data) ? data : (data.data || []);
            setAccessList(Array.isArray(arr) ? arr : []);
        } catch (error) {
            toast.error("Failed to load access list");
            setAccessList([]); // Fallback to avoid crash
        } finally {
            setLoadingList(false);
        }
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoadingLookup(true);
        setFoundUser(null);
        try {
            const response = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'lookup-user-by-email', payload: { email: email.trim() } })
            });
            const data = await response.json();
            
            if (!response.ok) {
                toast.error(data.error || "User not found");
                return;
            }
            setFoundUser(data);
            toast.success("User found!");
        } catch (error) {
            toast.error("Error looking up user");
        } finally {
            setLoadingLookup(false);
        }
    };

    const handleTestSelection = (val: string) => {
        setSelectedTestId(val);
        const test = tests.find(t => t.id.toString() === val);
        if (test) {
            setAmount(test.price.toString());
        }
    };

    const handleGrantAccess = async () => {
        if (!foundUser || !selectedTestId || !paymentMethod) {
            toast.error("Please fill all required fields");
            return;
        }

        setGranting(true);
        try {
            const response = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'grant-access',
                    payload: {
                        userId: foundUser.user_id || foundUser.email,
                        mockTestId: parseInt(selectedTestId),
                        amount: parseFloat(amount || "0"),
                        paymentMethod: paymentMethod
                    }
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to grant access");
            
            toast.success("Access granted successfully!");
            // Reset form partly
            setSelectedTestId("");
            loadAccessList(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || "Failed to grant access");
        } finally {
            setGranting(false);
        }
    };

    const handleRevoke = async (userId: string, mockTestId: number) => {
        if (!window.confirm("Are you sure you want to revoke access?")) return;
        
        try {
            const response = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'revoke-access',
                    payload: { userId, mockTestId }
                })
            });
            if (!response.ok) throw new Error("Failed to revoke access");
            toast.success("Access revoked");
            loadAccessList();
        } catch (error) {
            toast.error("Error revoking access");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-green-600" /> User Access Management
                </h1>
                <p className="text-gray-500">Grant or revoke mock test access for registered users.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col: Lookup & Grant */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="w-5 h-5" /> 1. Look Up User
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLookup} className="flex gap-2">
                                <Input 
                                    placeholder="Enter user registered email" 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button type="submit" disabled={loadingLookup}>
                                    {loadingLookup ? "Searching..." : "Look Up"}
                                </Button>
                            </form>

                            {foundUser && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
                                    <UserCheck className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-900">{foundUser.name || "No Name"}</p>
                                        <p className="text-sm text-green-700 flex items-center gap-1"><Mail className="w-3 h-3"/> {foundUser.email}</p>
                                        <p className="text-xs text-green-600 font-mono mt-1">
                                            ID: {foundUser.user_id || <span className="text-yellow-600 font-bold">MISSING (Email will be used as ID)</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={!foundUser ? "opacity-50 pointer-events-none" : ""}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Database className="w-5 h-5" /> 2. Grant Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Mock Test</Label>
                                <Select value={selectedTestId} onValueChange={handleTestSelection}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a test..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tests.map(t => (
                                            <SelectItem key={t.id.toString()} value={t.id.toString()}>
                                                {t.title} (₹{t.price})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Online">Online via UPI</SelectItem>
                                            <SelectItem value="Cash">Cash payment</SelectItem>
                                            <SelectItem value="Complimentary">Complimentary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount Received (₹)</Label>
                                    <Input 
                                        type="number" 
                                        value={amount} 
                                        onChange={(e) => setAmount(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                className="w-full mt-2" 
                                onClick={handleGrantAccess} 
                                disabled={granting || !selectedTestId}
                            >
                                {granting ? "Granting..." : "Grant Access"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Access List */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5" /> Granted Access List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingList ? (
                                <div className="text-center py-8 text-gray-500">Loading access list...</div>
                            ) : accessList.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No manual access records found.</div>
                            ) : (
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Test / Method</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accessList.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell>
                                                        <div className="font-medium text-sm">{record.user_name || "Unknown"}</div>
                                                        <div className="text-xs text-gray-500">{record.user_email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-sm truncate max-w-[150px]">
                                                            {record.mock_test_id === -1 ? "★ All Tests Bundle (Premium Pass)" : (record.test_title || `Test ID: ${record.mock_test_id}`)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>₹{record.amount}</span> • <span>{record.payment_method}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={record.status === 'active' ? 'default' : 'destructive'} className={record.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                                                            {record.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {record.status === 'active' && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => handleRevoke(record.user_id, record.mock_test_id)}
                                                            >
                                                                Revoke
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

