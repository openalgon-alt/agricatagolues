import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/services/examDataService";
import { format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function ExamSubmissions() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSubmissions = async () => {
        try {
            const { data, error } = await supabase
                .from('exam_submissions')
                .select('*')
                .order('submission_date', { ascending: false });

            if (error) {
                console.error("Error loading submissions:", error);
                toast.error("Failed to load submissions");
            } else {
                setSubmissions(data || []);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(submissions);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exam Submissions");
        XLSX.writeFile(workbook, "exam_submissions.xlsx");
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Exam Submissions</h1>
                <Button onClick={exportToExcel} disabled={submissions.length === 0} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>College</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Total Questions</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No submissions found yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-mono text-xs">{sub.id}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>{sub.name}</div>
                                        <div className="text-xs text-muted-foreground">{sub.email}</div>
                                    </TableCell>
                                    <TableCell>{sub.phone}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={sub.college}>
                                        {sub.college}
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg text-blue-600">
                                        {sub.score}
                                    </TableCell>
                                    <TableCell className="text-center">{sub.total_questions}</TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {sub.submission_date ? format(new Date(sub.submission_date), "MMM d, yyyy h:mm a") : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
