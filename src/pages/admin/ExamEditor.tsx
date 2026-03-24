import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ExamLanding } from "@/components/exam/ExamLanding";
import { MockTest, MockQuestion, examDataService } from "@/services/examDataService";
import { dataService } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { Trash2, Plus, ArrowLeft, Save, Edit, Image as ImageIcon, FileText, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import QuestionDialog from "./QuestionDialog";
import BulkUploadDialog from "./BulkUploadDialog";

export default function ExamEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(!isNew);
    const [mockTest, setMockTest] = useState<Partial<MockTest>>({
        title: "",
        description: "",
        price: 100,
        isActive: true,
        questions: []
    });

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<MockQuestion | undefined>(undefined);
    const [selectedQIds, setSelectedQIds] = useState<number[]>([]); // Selection State

    useEffect(() => {
        if (id) {
            loadMockTest();
        }
    }, [id]);

    const loadMockTest = async () => {
        setLoading(true);
        const data = await examDataService.getMockTestById(id!);
        if (data) {
            setMockTest(data);
            setSelectedQIds([]); // Reset selection on reload
        } else {
            toast.error("Mock Test not found");
            navigate("/admin/exams");
        }
        setLoading(false);
    };

    const handleSaveTest = async () => {
        if (!mockTest.title) {
            toast.error("Title is required");
            return;
        }

        try {
            const savedTest = await examDataService.saveMockTest({
                ...mockTest,
                id: id ? parseInt(id) : undefined
            });
            
            toast.success("Mock Test saved successfully");
            if (isNew) {
                // Redirect to edit mode to allow adding questions
                navigate(`/admin/exams/${savedTest.id}`);
            } else {
                // Refresh data
                setMockTest(prev => ({ ...prev, ...savedTest }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save mock test");
        }
    };

    const handleDeleteQuestion = async (qId: number) => {
        if (!confirm("Delete this question permanently?")) return;
        try {
             await performDelete([qId]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete question");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedQIds.length === 0) return;
        if (!confirm(`Delete ${selectedQIds.length} questions permanently?`)) return;
        
        try {
            await performDelete(selectedQIds);
            setSelectedQIds([]);
        } catch (error) {
             console.error(error);
             toast.error("Failed to delete selected questions");
        }
    };

    const performDelete = async (ids: number[]) => {
         // Should ideally be a bulk API, but loop for now
         let f = 0;
         for (const qId of ids) {
             try {
                await examDataService.deleteMockQuestion(qId);
             } catch (e) {
                 console.error("Failed to delete", qId, e);
                 f++;
             }
         }
         
         if (f > 0) {
             toast.warning(`Deleted with ${f} errors.`);
         } else {
             toast.success("Deleted successfully");
         }
         loadMockTest();
    };


    const openAddQuestion = () => {
        if (isNew) {
            toast.error("Please save the test details first before adding questions.");
            return;
        }
        setEditingQuestion(undefined);
        setIsQuestionDialogOpen(true);
    };

    const openEditQuestion = (q: MockQuestion) => {
        setEditingQuestion(q);
        setIsQuestionDialogOpen(true);
    };

    // Selection Logic
    const toggleSelection = (qId: number) => {
        setSelectedQIds(prev => 
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const toggleSelectAll = () => {
        if (!mockTest.questions) return;
        if (selectedQIds.length === mockTest.questions.length) {
            setSelectedQIds([]);
        } else {
            setSelectedQIds(mockTest.questions.map(q => Number(q.id)));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/exams")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">{isNew ? "Create New Mock Test" : "Edit Mock Test"}</h1>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleSaveTest} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="mr-2 h-4 w-4" />
                        {isNew ? "Create Test" : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Test Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input 
                                    defaultValue={mockTest.title}
                                    onBlur={e => setMockTest({ ...mockTest, title: e.target.value })}
                                    placeholder="e.g. ICAR Mk-1 General Agriculture"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    defaultValue={mockTest.description}
                                    onBlur={e => setMockTest({ ...mockTest, description: e.target.value })}
                                    placeholder="Brief details about the test syllabus..."
                                    className="h-32"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (₹) <span className="text-xs text-gray-500">(0 for Free)</span></Label>
                                <Input 
                                    type="number"
                                    defaultValue={mockTest.price}
                                    onBlur={e => setMockTest({ ...mockTest, price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cover Image URL (Optional)</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        key={mockTest.id ? `url-${mockTest.imageUrl}` : 'new-url'}
                                        defaultValue={mockTest.imageUrl || ""}
                                        onBlur={e => setMockTest({ ...mockTest, imageUrl: e.target.value })}
                                        placeholder="https://example.com/cover.jpg"
                                        className="flex-1"
                                    />
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        className="w-64 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                setLoading(true);
                                                toast.loading("Uploading cover image...", { id: "upload-cover" });
                                                const url = await examDataService.uploadImage(file, 'exam_covers');
                                                setMockTest({ ...mockTest, imageUrl: url });
                                                toast.success("Cover image uploaded!");
                                            } catch (error) {
                                                toast.error("Failed to upload cover image");
                                            } finally {
                                                setLoading(false);
                                                toast.dismiss("upload-cover");
                                            }
                                        }}
                                    />
                                </div>
                                {mockTest.imageUrl && (
                                    <img src={mockTest.imageUrl} className="h-24 w-auto rounded-md object-cover border mt-2" alt="Cover Preview" />
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <Label>Active Status</Label>
                                <Switch 
                                    checked={mockTest.isActive}
                                    onCheckedChange={checked => setMockTest({ ...mockTest, isActive: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Questions */}
                <div className="lg:col-span-2">
                     <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                {!isNew && mockTest.questions && mockTest.questions.length > 0 && (
                                    <Checkbox 
                                        checked={selectedQIds.length === mockTest.questions.length && mockTest.questions.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="mt-1"
                                    />
                                )}
                                <div>
                                    <CardTitle>Questions ({mockTest.questions?.length || 0})</CardTitle>
                                    <CardDescription>
                                        {selectedQIds.length > 0 ? <span className="text-blue-600 font-medium">{selectedQIds.length} Selected</span> : "Manage questions for this test"}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedQIds.length > 0 && (
                                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedQIds.length})
                                    </Button>
                                )}
                                <Button onClick={() => setIsBulkUploadOpen(true)} size="sm" variant="outline" disabled={isNew}>
                                    <FileText className="mr-2 h-4 w-4" /> Bulk Upload
                                </Button>
                                <Button onClick={openAddQuestion} size="sm" disabled={isNew}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Question
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isNew ? (
                                <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg bg-gray-50">
                                    <p>Please save the test details first to start adding questions.</p>
                                </div>
                            ) : mockTest.questions && mockTest.questions.length > 0 ? (
                                <div className="space-y-3">
                                    {mockTest.questions.map((q, idx) => (
                                        <div key={q.id} className={`p-4 border rounded-lg hover:shadow-sm transition-all bg-white group ${selectedQIds.includes(Number(q.id)) ? 'border-blue-400 bg-blue-50' : ''}`}>
                                            <div className="flex items-start gap-4">
                                                 <Input
                                                    type="checkbox"
                                                    checked={selectedQIds.includes(Number(q.id))}
                                                    onChange={() => toggleSelection(Number(q.id))}
                                                    className="w-4 h-4 mt-1"
                                                 />
                                                 <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                 </div>
                                                 <div className="flex-1 min-w-0 space-y-2">
                                                     <div className="font-medium text-gray-900 line-clamp-2">
                                                        {q.question}
                                                     </div>
                                                     {q.image && (
                                                         <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                                                             <ImageIcon className="w-3 h-3" /> Image attached
                                                         </div>
                                                     )}
                                                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                                         {q.options.map((opt, oIdx) => (
                                                             <div key={oIdx} className={`text-sm flex items-center gap-2 ${oIdx === q.correctOptionIndex ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                                                 <span className="text-xs border rounded w-4 h-4 flex items-center justify-center">{String.fromCharCode(65 + oIdx)}</span>
                                                                 <span className="truncate">{opt}</span>
                                                                 {oIdx === q.correctOptionIndex && <span className="text-[10px] bg-green-100 px-1 rounded">Correct</span>}
                                                             </div>
                                                         ))}
                                                     </div>
                                                 </div>
                                                 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <Button variant="ghost" size="icon" onClick={() => openEditQuestion(q)}>
                                                         <Edit className="h-4 w-4 text-gray-500" />
                                                     </Button>
                                                     <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(Number(q.id))}>
                                                         <Trash2 className="h-4 w-4 text-red-500" />
                                                     </Button>
                                                 </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                                    <p>No questions added yet.</p>
                                    <div className="flex justify-center gap-3 mt-4">
                                        <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                                            Bulk Upload
                                        </Button>
                                        <Button onClick={openAddQuestion}>
                                            Add Question manually
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Question Dialog */}
            {id && (
                <>
                    <QuestionDialog 
                        open={isQuestionDialogOpen} 
                        onOpenChange={setIsQuestionDialogOpen}
                        mockTestId={parseInt(id)}
                        questionToEdit={editingQuestion}
                        onSave={loadMockTest}
                    />
                    <BulkUploadDialog
                        open={isBulkUploadOpen}
                        onOpenChange={setIsBulkUploadOpen}
                        mockTestId={parseInt(id)}
                        onSave={loadMockTest}
                    />
                </>
            )}
        </div>
    );
}
