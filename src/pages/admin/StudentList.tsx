import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/examDataService";

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

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            // Using API_BASE_URL handles both local dev proxy and production environment
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
                    <p className="text-gray-500">View and manage comprehensive student profiles.</p>
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
                                        <TableHead className="w-[250px]">Academic Details</TableHead>
                                        <TableHead className="w-[250px]">Guardian Info</TableHead>
                                        <TableHead className="w-[120px]">Registered On</TableHead>
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
                                                    <MapPin className="w-3 h-3" /> District: {student.district}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{student.guardian_name}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Prof: {student.guardian_profession}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> Contact: {student.guardian_contact}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(student.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
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
    );
}
