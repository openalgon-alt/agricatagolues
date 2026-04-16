import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { examDataService, MockTest, API_BASE_URL } from "@/services/examDataService";
import { dataService } from "@/services/dataService";
import { AlertTriangle, Database, Mail, Search, ShieldAlert, ShieldCheck, UserCheck, Clock, CheckCircle, Settings, Upload, Loader2, Save } from "lucide-react";

interface PaymentRequest {
    id: number;
    user_email: string;
    utr: string;
    amount: string;
    status: string;
    created_at: string;
}

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
    const [foundUser, setFoundUser] = useState<{ user_id: string; name: string | null; email: string | null; phone: string | null; _synthetic?: boolean } | null>(null);
    const [loadingLookup, setLoadingLookup] = useState(false);
    
    const [tests, setTests] = useState<MockTest[]>([]);
    const [selectedTestId, setSelectedTestId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("Online");
    const [amount, setAmount] = useState<string>("0");
    const [granting, setGranting] = useState(false);

    const [accessList, setAccessList] = useState<AccessRecord[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'granted' | 'settings'>('pending');

    // Settings state
    const [upiId, setUpiId] = useState('agriscience@upi');
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        loadTests();
        loadAccessList();
        loadPaymentRequests();
        loadSettings();
    }, []);

    const loadSettings = async () => {
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

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update-settings',
                    payload: {
                        settings: {
                            payment_upi_id: upiId,
                            payment_qr_url: qrImageUrl
                        }
                    }
                })
            });
            if (!response.ok) throw new Error("Failed to save");
            toast.success("Payment settings updated dynamically!");
        } catch (e) {
            toast.error("Failed to save settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        toast.info("Uploading QR image...");
        try {
            const url = await dataService.uploadMemberImage(file);
            setQrImageUrl(url);
            toast.success("QR Code uploaded! Don't forget to click Save.");
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Image upload failed");
        } finally {
            setUploadingImage(false);
        }
    };

    const loadPaymentRequests = async () => {
        setLoadingRequests(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list-payment-requests' })
            });
            const data = await response.json();
            setPaymentRequests(Array.isArray(data) ? data : []);
        } catch(e) {
            toast.error("Failed to load payment requests");
        } finally {
            setLoadingRequests(false);
        }
    };

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
        setListError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list-user-access' })
            });
            const data = await response.json();
            if (!response.ok) {
                const errMsg = data.error || `Server error ${response.status}`;
                setListError(errMsg);
                toast.error(`Failed to load list: ${errMsg}`);
                setAccessList([]);
                return;
            }
            const arr = Array.isArray(data) ? data : [];
            setAccessList(arr);
        } catch (error: any) {
            const errMsg = error?.message || 'Network error';
            setListError(errMsg);
            toast.error(`Failed to load access list: ${errMsg}`);
            setAccessList([]);
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
            const response = await fetch(`${API_BASE_URL}/api`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'lookup-user',
                    payload: { email: email.trim() }
                })
            });
            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Lookup failed');
                return;
            }

            setFoundUser(data);
            if (data._synthetic) {
                toast.warning("User not in database. Access will be granted to this email and apply when they log in.");
            } else {
                toast.success(`User found: ${data.name || data.email}`);
            }
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
            const response = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'grant-access',
                    payload: {
                        userId: foundUser?.user_id || foundUser?.firebase_uid || foundUser?.email || email.trim(),
                        mockTestId: parseInt(selectedTestId),
                        amount: parseFloat(amount || '0'),
                        paymentMethod: paymentMethod
                    }
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to grant access');

            toast.success('Access granted successfully!');
            setSelectedTestId('');
            loadAccessList();
        } catch (error: any) {
            toast.error(error.message || "Failed to grant access");
        } finally {
            setGranting(false);
        }
    };

    const handleRevoke = async (purchaseId: number, userId: string, mockTestId: number) => {
        if (!window.confirm("Are you sure you want to revoke access?")) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'revoke-access',
                    payload: {
                        userId: userId,
                        mockTestId: mockTestId
                    }
                })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to revoke access');
            }
            toast.success('Access revoked');
            loadAccessList();
        } catch (error: any) {
            toast.error("Error revoking access");
        }
    };

    const handleProcessRequest = async (reqId: number, status: string, reqEmail: string) => {
        try {
            await fetch(`${API_BASE_URL}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update-payment-request',
                    payload: { id: reqId, status }
                })
            });
            toast.success(`Request marked as ${status}`);
            loadPaymentRequests();
            
            if (status === 'approved') {
                setEmail(reqEmail);
                toast.info("Email loaded on the left. Please grant access to the appropriate Mock Test.");
                // We use standard form submission on next line dynamically
            }
        } catch(e) {
            toast.error("Failed to update request");
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
                            <form id="lookup-form" onSubmit={handleLookup} className="flex gap-2">
                                <Input 
                                    placeholder="Enter email or Firebase UID" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button type="submit" disabled={loadingLookup}>
                                    {loadingLookup ? "Searching..." : "Look Up"}
                                </Button>
                            </form>

                            {foundUser && (
                                <div className={`mt-4 p-4 border rounded-md flex items-start gap-3 ${foundUser._synthetic ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                    {foundUser._synthetic
                                        ? <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                                        : <UserCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />}
                                    <div>
                                        <p className={`font-semibold ${foundUser._synthetic ? 'text-yellow-900' : 'text-green-900'}`}>
                                            {foundUser.name || <span className="italic text-gray-500">Name not on file</span>}
                                        </p>
                                        {foundUser.email && (
                                            <p className="text-sm text-gray-700 flex items-center gap-1"><Mail className="w-3 h-3"/>{foundUser.email}</p>
                                        )}
                                        <p className="text-xs font-mono mt-1 text-gray-600">
                                            ID: {foundUser.user_id}
                                        </p>
                                        {foundUser._synthetic && (
                                            <p className="text-xs text-yellow-700 mt-1 font-medium">⚠ Not yet in database. Access will be saved and will apply when they log in.</p>
                                        )}
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

                {/* Right Col: Access List & Payment Requests */}
                <div className="space-y-6">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button 
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'pending' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            <Clock className="w-4 h-4 inline-block mr-1" /> Pending Payments
                            {paymentRequests.filter(r => r.status === 'pending').length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {paymentRequests.filter(r => r.status === 'pending').length}
                                </span>
                            )}
                        </button>
                        <button 
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'granted' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('granted')}
                        >
                            <ShieldCheck className="w-4 h-4 inline-block mr-1" /> Granted Access
                        </button>
                        <button 
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'settings' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings className="w-4 h-4 inline-block mr-1" /> Settings
                        </button>
                    </div>

                    {activeTab === 'pending' ? (
                        <Card className="h-full border-orange-200">
                            <CardHeader className="pb-4 bg-orange-50/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                    <Clock className="w-5 h-5" /> Pending Payment Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {loadingRequests ? (
                                    <div className="text-center py-8 text-gray-500">Loading requests...</div>
                                ) : paymentRequests.filter(r => r.status === 'pending').length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No pending payment requests found!</div>
                                ) : (
                                    <div className="space-y-3">
                                        {paymentRequests.filter(r => r.status === 'pending').map((record) => (
                                            <div key={record.id} className="border border-orange-100 bg-orange-50/30 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{record.user_email}</p>
                                                        <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleString()}</p>
                                                    </div>
                                                    <span className="bg-orange-100 text-orange-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Pending</span>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-100 text-sm font-mono flex justify-between items-center">
                                                    <div><span className="text-gray-500 text-xs mr-2 uppercase">UTR:</span>{record.utr}</div>
                                                    <div className="font-bold text-green-700">₹{record.amount}</div>
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleProcessRequest(record.id, 'approved', record.user_email)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Verify & Prepare Grant
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => handleProcessRequest(record.id, 'rejected', record.user_email)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {paymentRequests.filter(r => r.status !== 'pending').length > 0 && (
                                    <div className="mt-8 pt-4 border-t">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Recently Processed</p>
                                        <div className="space-y-2 opacity-70">
                                            {paymentRequests.filter(r => r.status !== 'pending').slice(0, 5).map(r => (
                                                <div key={r.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                                                    <span>{r.user_email}</span>
                                                    <span className={`px-1.5 py-0.5 rounded ${r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {r.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : activeTab === 'settings' ? (
                        <Card className="h-full border-purple-200">
                            <CardHeader className="pb-4 bg-purple-50/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                                    <Settings className="w-5 h-5" /> Payment Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="upiId" className="text-base font-semibold">UPI ID</Label>
                                        <Input
                                            id="upiId"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="e.g. yourname@sbi"
                                            required
                                            className="text-lg"
                                        />
                                        <p className="text-sm text-gray-500">This exactly what users will copy to their payment app.</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">QR Code Image</Label>
                                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                                            <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center shrink-0 p-2 overflow-hidden relative group">
                                                {qrImageUrl ? (
                                                    <img src={qrImageUrl} alt="QR Code" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-sm text-gray-400 font-medium text-center">No QR Code<br/>Uploaded</span>
                                                )}
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <p className="text-sm text-gray-600">Upload a square image of your UPI QR Code. It will be displayed directly inside the payment popup.</p>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id="qrUpload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('qrUpload')?.click()}
                                                        disabled={uploadingImage}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Choose Image
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t">
                                        <Button 
                                            type="submit" 
                                            disabled={savingSettings || uploadingImage}
                                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                                        >
                                            {savingSettings ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                            ) : (
                                                <><Save className="mr-2 h-4 w-4" /> Save Payment Settings</>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5" /> Granted Access List
                                </CardTitle>
                            </CardHeader>
                        <CardContent>
                            {loadingList ? (
                                <div className="text-center py-8 text-gray-500">Loading access list...</div>
                            ) : listError ? (
                                <div className="text-center py-8 space-y-2">
                                    <p className="text-red-600 font-medium text-sm">⚠ Error loading list</p>
                                    <p className="text-xs text-gray-500 font-mono break-all px-2">{listError}</p>
                                    <button 
                                        onClick={loadAccessList}
                                        className="text-xs underline text-blue-600 hover:text-blue-800"
                                    >Retry</button>
                                </div>
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
                                                                onClick={() => handleRevoke(record.id, record.user_id, record.mock_test_id)}
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
                    )}
                </div>
            </div>
        </div>
    );
}

