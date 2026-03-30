import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Mail, Phone, MapPin, GraduationCap, FileText, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/examDataService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface StudentProfile {
    id: number;
    firebase_uid: string;
    name: string;
    email: string;
    mobile: string;
    college: string;
    district: string;
    guardian_name: string;
    guardian_profession: string;
    guardian_contact: string;
    created_at: string;
}

export default function StudentList() {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // History Dialog State
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/students`);
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();
            setStudents(data.students || []);
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Failed to load student tracking data");
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async (student: StudentProfile) => {
        setSelectedStudent(student);
        setHistoryLoading(true);
        setIsDialogOpen(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/student-history?userId=${encodeURIComponent(student.firebase_uid)}`);
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            setHistory(data || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast.error("Could not load student's past tests");
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobile.includes(searchQuery) ||
        s.college.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" /> Registered Students
                    </h1>
                    <p className="text-gray-500">View and manage comprehensive student profiles and their test histories.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-lg">Student Roster ({filteredStudents.length}/{students.length})</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search by name, email, phone, or college..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading student profiles...</div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No student profiles found. Wait for users to register.</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No students match your search query.</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table className="min-w-[1000px]">
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Student Info</TableHead>
                                        <TableHead className="w-[200px]">Academic Details</TableHead>
                                        <TableHead className="w-[200px]">Guardian Info</TableHead>
                                        <TableHead className="w-[120px]">Registered</TableHead>
                                        <TableHead className="w-[120px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="font-semibold">{student.name}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {student.email}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {student.mobile}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm flex items-start gap-2">
                                                    <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                    <span>{student.college}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Dist: {student.district}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{student.guardian_name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Prof: {student.guardian_profession}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {student.guardian_contact}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(student.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary" onClick={() => handleViewHistory(student)}>
                                                    <FileText className="w-3.5 h-3.5" /> Tests
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl border-b pb-3">
                            <FileText className="w-5 h-5 text-primary" /> 
                            {selectedStudent?.name}'s Exam History
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Review all mock tests taken. Scores and participation history are tracked.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-2 min-h-[300px]">
                        {historyLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                                <p>Loading records from database...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-4">
                                <FileText className="w-12 h-12 mb-3 text-gray-300" />
                                <p className="text-lg font-medium text-gray-600">No mock tests found.</p>
                                <p className="text-sm">This student hasn't submitted any exams yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pr-1">
                                {history.map((h: any, idx) => (
                                    <div key={h.id || idx} className="bg-white border hover:border-primary/30 shadow-sm rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md relative overflow-hidden group">
                                        
                                        {/* Status Accent Line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors"></div>

                                        <div className="flex-1 space-y-1 pl-2">
                                            <h4 className="font-semibold text-gray-900 text-base">{h.testTitle}</h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(h.submittedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 px-4 py-2.5 rounded-md border flex items-center gap-4 sm:shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Final Score</p>
                                                <p className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    {h.score} <span className="text-sm font-normal text-gray-500">/ {h.totalQuestions * 4}</span>
                                                </p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-200"></div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Attempted</p>
                                                <p className="text-lg font-semibold text-gray-700">{h.totalQuestions}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
