import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { aoAaoAdminService } from "@/services/aoAaoAdminService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Search,
  FileSpreadsheet,
  HelpCircle,
} from "lucide-react";
import { extractTextFromPDF, extractTextFromDocx, parseMCQFromText } from "@/lib/document-parser";

interface FreeTestQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
}

const token = "access-granted-token-123456";

export default function FreeTestPage() {
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<FreeTestQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Single MCQ Form State
  const [formQuestion, setFormQuestion] = useState("");
  const [formOptionA, setFormOptionA] = useState("");
  const [formOptionB, setFormOptionB] = useState("");
  const [formOptionC, setFormOptionC] = useState("");
  const [formOptionD, setFormOptionD] = useState("");
  const [formCorrect, setFormCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [formExplanation, setFormExplanation] = useState("");

  // Bulk Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    void fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoadingQuestions(true);
    try {
      const result = await aoAaoAdminService.listFreeTest(token);
      
      // Map the returned questions to client format if needed
      const mapped = (result.questions || []).map((q: any) => ({
        id: q.id,
        questionText: q.question_text || q.questionText,
        optionA: q.option_a || q.optionA,
        optionB: q.option_b || q.optionB,
        optionC: q.option_c || q.optionC,
        optionD: q.option_d || q.optionD,
        correctOption: q.correct_option || q.correctOption,
        explanation: q.explanation || "",
      }));
      
      setQuestions(mapped);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load free test questions");
    } finally {
      setLoadingQuestions(false);
    }
  }

  function resetForm() {
    setFormQuestion("");
    setFormOptionA("");
    setFormOptionB("");
    setFormOptionC("");
    setFormOptionD("");
    setFormCorrect("A");
    setFormExplanation("");
  }

  function resetBulkState() {
    setUploadFile(null);
    setParsedQuestions([]);
    setParseError(null);
    setParsing(false);
    // Reset file input value
    const fileInput = document.getElementById("ft-bulk-file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formQuestion.trim() ||
      !formOptionA.trim() ||
      !formOptionB.trim() ||
      !formOptionC.trim() ||
      !formOptionD.trim()
    ) {
      toast.error("Please fill in all MCQ choices and question text");
      return;
    }

    setSubmitting(true);
    try {
      await aoAaoAdminService.addFreeTestQuestion(token, {
        questionText: formQuestion.trim(),
        optionA: formOptionA.trim(),
        optionB: formOptionB.trim(),
        optionC: formOptionC.trim(),
        optionD: formOptionD.trim(),
        correctOption: formCorrect,
        explanation: formExplanation.trim(),
      });
      toast.success("Free test question added successfully!");
      resetForm();
      void fetchQuestions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(questionId: string) {
    setDeletingId(questionId);
    try {
      await aoAaoAdminService.deleteFreeTestQuestion(token, questionId);
      toast.success("Question deleted");
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete question");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleFileUpload(file: File) {
    setParsing(true);
    setParseError(null);
    setParsedQuestions([]);

    try {
      let text = "";
      if (file.name.endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        text = await extractTextFromDocx(file);
      } else if (file.name.endsWith(".txt")) {
        text = await file.text();
      } else {
        throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
      }

      const parsed = parseMCQFromText(text);
      if (parsed.length === 0) {
        throw new Error(
          "No questions could be parsed. Check the format: Q: ... A: ... B: ... C: ... D: ... Answer: ...",
        );
      }
      setParsedQuestions(parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Parse error");
    } finally {
      setParsing(false);
    }
  }

  async function handleBulkUpload() {
    if (parsedQuestions.length === 0) return;
    setSubmitting(true);
    try {
      const result = await aoAaoAdminService.bulkAddFreeTestQuestions(
        token,
        parsedQuestions.map((q) => ({
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          explanation: q.explanation || "",
        })),
      );
      toast.success(`${result.count || parsedQuestions.length} questions uploaded to Free Test!`);
      resetBulkState();
      void fetchQuestions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 pb-12 font-sans text-left">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/ao-aao"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to AO/AAO Control Center
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
              <Sparkles className="h-3 w-3" /> Free Test
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Free Test Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage questions that appear in the public free test shown to all users.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border rounded-2xl p-4 shadow-soft">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Questions
            </span>
            <p className="font-display font-extrabold text-xl text-green-700 mt-0.5">
              {loadingQuestions ? "..." : questions.length}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <FileText className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Tabs: List / Add Single / Bulk Upload */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:inline-grid bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="list" className="rounded-lg text-xs font-semibold">
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Questions
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-lg text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Single
          </TabsTrigger>
          <TabsTrigger value="bulk" className="rounded-lg text-xs font-semibold">
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Bulk Upload
          </TabsTrigger>
        </TabsList>

        {/* ───────────── LIST TAB ───────────── */}
        <TabsContent value="list" className="mt-6 space-y-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingQuestions ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-green-700" />
              <span className="text-sm text-muted-foreground">Loading questions...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-white">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm font-medium">
                {searchQuery ? "No questions match your search." : "No free test questions yet."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {!searchQuery && "Use 'Add Single' or 'Bulk Upload' to add questions."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border bg-white p-5 shadow-soft flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-10 shrink-0 rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                        Q{idx + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-150">
                        Correct: {q.correctOption}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {q.questionText}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="truncate">
                        <strong className="text-gray-900">A.</strong> {q.optionA}
                      </span>
                      <span className="truncate">
                        <strong className="text-gray-900">B.</strong> {q.optionB}
                      </span>
                      <span className="truncate">
                        <strong className="text-gray-900">C.</strong> {q.optionC}
                      </span>
                      <span className="truncate">
                        <strong className="text-gray-900">D.</strong> {q.optionD}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-green-500/30 pl-2">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDelete(q.id)}
                    disabled={deletingId === q.id}
                    className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    {deletingId === q.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ───────────── ADD SINGLE TAB ───────────── */}
        <TabsContent value="add" className="mt-6">
          <form onSubmit={(e) => void handleAddSingle(e)} className="space-y-5 max-w-2xl">
            <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-5">
              <h3 className="font-semibold text-base text-gray-950">Add a Single MCQ</h3>

              <div className="space-y-2">
                <Label htmlFor="ft-question">Question Text *</Label>
                <Textarea
                  id="ft-question"
                  placeholder="Enter the question..."
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  rows={3}
                  className="bg-white"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <div key={opt} className="space-y-2">
                    <Label htmlFor={`ft-opt${opt}`}>Option {opt} *</Label>
                    <Input
                      id={`ft-opt${opt}`}
                      placeholder={`Option ${opt}...`}
                      className="bg-white"
                      value={
                        opt === "A"
                          ? formOptionA
                          : opt === "B"
                            ? formOptionB
                            : opt === "C"
                              ? formOptionC
                              : formOptionD
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (opt === "A") setFormOptionA(val);
                        else if (opt === "B") setFormOptionB(val);
                        else if (opt === "C") setFormOptionC(val);
                        else setFormOptionD(val);
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ft-correct">Correct Answer *</Label>
                <Select
                  value={formCorrect}
                  onValueChange={(v) => setFormCorrect(v as "A" | "B" | "C" | "D")}
                >
                  <SelectTrigger id="ft-correct" className="w-36 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        Option {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ft-explanation">Explanation (optional)</Label>
                <Textarea
                  id="ft-explanation"
                  placeholder="Add an explanation for the correct answer..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  rows={2}
                  className="bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={resetForm} className="text-xs cursor-pointer bg-white">
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-soft cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Question
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* ───────────── BULK UPLOAD TAB ───────────── */}
        <TabsContent value="bulk" className="mt-6 space-y-6 max-w-2xl">
          <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-5">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-700 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-base text-gray-950">Bulk Upload Questions</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Upload a PDF, DOCX, or TXT file containing MCQs. Each question must follow the
                  format below.
                </p>
              </div>
            </div>

            {/* Format hint */}
            <div className="rounded-xl border border-dashed bg-gray-50/50 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-950">
                <HelpCircle className="h-3.5 w-3.5 text-green-700" />
                Expected Format
              </div>
              <pre className="text-[10px] text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap">
                {`Q: What is the capital of India?
A: Mumbai
B: New Delhi
C: Kolkata
D: Chennai
Answer: B
Explanation: New Delhi is the capital city of India.`}
              </pre>
            </div>

            {/* File picker */}
            <div className="space-y-2">
              <Label htmlFor="ft-bulk-file">Upload File (PDF / DOCX / TXT)</Label>
              <Input
                id="ft-bulk-file"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setUploadFile(file);
                  if (file) void handleFileUpload(file);
                }}
                className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-border file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-900 hover:file:bg-gray-100 cursor-pointer bg-white"
              />
            </div>

            {parsing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-green-700" />
                Parsing questions from file...
              </div>
            )}

            {parseError && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-red-200 bg-red-50/50 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {parsedQuestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Parsed {parsedQuestions.length} question
                    {parsedQuestions.length !== 1 ? "s" : ""}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground cursor-pointer"
                    onClick={resetBulkState}
                  >
                    Clear
                  </Button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border bg-gray-50/35 p-3">
                  {parsedQuestions.slice(0, 5).map((q: any, i: number) => (
                    <div
                      key={i}
                      className="text-xs text-gray-700 border-b last:border-0 pb-2 last:pb-0"
                    >
                      <span className="font-bold">Q{i + 1}:</span> {q.questionText}
                    </div>
                  ))}
                  {parsedQuestions.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      + {parsedQuestions.length - 5} more questions...
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => void handleBulkUpload()}
                  disabled={submitting}
                  className="w-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-soft cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Uploading {parsedQuestions.length} questions...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload {parsedQuestions.length} questions to Free Test
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
