import { useState, useEffect } from "react";
import { MockQuestion, examDataService } from "@/services/examDataService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mockTestId: number | string;
    questionToEdit?: MockQuestion;
    onSave: () => void;
}

export default function QuestionDialog({ open, onOpenChange, mockTestId, questionToEdit, onSave }: QuestionDialogProps) {
    const [question, setQuestion] = useState<Partial<MockQuestion>>({
        mockTestId,
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        marks: 4, // Default marks (+4) for standard ICAR/CUET format
        topic: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (questionToEdit) {
            setQuestion(questionToEdit);
        } else {
            setQuestion({
                mockTestId,
                question: "",
                options: ["", "", "", ""],
                correctOptionIndex: 0,
                marks: 4,
                topic: ""
            });
        }
    }, [questionToEdit, mockTestId, open]);

    const handleSave = async () => {
        if (!question.question?.trim()) {
            toast.error("Question text is required");
            return;
        }

        if (question.options?.some(opt => !opt.trim())) {
            toast.error("All options must be filled");
            return;
        }

        setLoading(true);
        try {
            await examDataService.saveMockQuestion(question as MockQuestion);
            toast.success(questionToEdit ? "Question updated" : "Question added");
            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save question");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...(question.options || [])];
        newOptions[idx] = val;
        setQuestion({ ...question, options: newOptions });
    };

    const addOption = () => {
        setQuestion({ ...question, options: [...(question.options || []), ""] });
    };

    const removeOption = (idx: number) => {
        if ((question.options?.length || 0) <= 2) {
            toast.error("A question must have at least 2 options");
            return;
        }
        const newOptions = (question.options || []).filter((_, i) => i !== idx);
        const newCorrectIdx = question.correctOptionIndex === idx ? 0 : 
                              (question.correctOptionIndex || 0) > idx ? (question.correctOptionIndex || 0) - 1 : question.correctOptionIndex;
        
        setQuestion({ ...question, options: newOptions, correctOptionIndex: newCorrectIdx });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{questionToEdit ? "Edit Question" : "Add New Question"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea 
                            value={question.question}
                            onChange={e => setQuestion({ ...question, question: e.target.value })}
                            placeholder="Enter the question..."
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Image URL (Optional) */}
                    <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <div className="flex gap-2">
                            <Input 
                                value={question.image || ""}
                                onChange={e => setQuestion({ ...question, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
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
                                        toast.loading("Uploading image...", { id: "upload-toast" });
                                        const url = await examDataService.uploadImage(file, 'question_images');
                                        setQuestion({ ...question, image: url });
                                        toast.success("Image uploaded!");
                                    } catch (error) {
                                        toast.error("Failed to upload image");
                                    } finally {
                                        setLoading(false);
                                        toast.dismiss("upload-toast");
                                    }
                                }}
                            />
                        </div>
                        {question.image && (
                            <div className="mt-2 p-2 border rounded-md">
                                <img src={question.image} alt="Preview" className="max-h-32 object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Marks (Positive)</Label>
                            <Input 
                                type="number" 
                                value={question.marks}
                                onChange={e => setQuestion({ ...question, marks: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Topic / Subject Tag</Label>
                            <Input 
                                value={question.topic}
                                onChange={e => setQuestion({ ...question, topic: e.target.value })}
                                placeholder="e.g. Agronomy"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Options</Label>
                            <Button variant="outline" size="sm" onClick={addOption}>
                                <Plus className="w-4 h-4 mr-1" /> Add Option
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            {question.options?.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex items-center justify-center shrink-0">
                                        <input 
                                            type="radio"
                                            name="correctOption"
                                            checked={question.correctOptionIndex === idx}
                                            onChange={() => setQuestion({ ...question, correctOptionIndex: idx })}
                                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                                            title="Mark as correct answer"
                                        />
                                    </div>
                                    <span className="shrink-0 text-sm font-medium w-6 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                                    <Input 
                                        value={opt}
                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className={question.correctOptionIndex === idx ? "border-green-300 bg-green-50" : ""}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(idx)} className="text-red-500 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">* Select the radio button next to the correct option.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? "Saving..." : questionToEdit ? "Update Question" : "Add Question"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
