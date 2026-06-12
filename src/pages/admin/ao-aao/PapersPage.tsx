import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  BookOpen,
  Search,
  Calendar,
  CheckCircle2,
  Sparkles,
  Plus,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  extractTextFromPDF,
  extractTextFromDocx,
  parseMCQFromText,
  ParsedQuestion,
} from "@/lib/document-parser";

interface SubjectDetails {
  id: string;
  name: string;
  release: string;
  releaseISO: string;
  papers: number;
  isReleased: boolean;
}

interface Question {
  id: string;
  paper_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
}

interface UploadedParsedQuestion extends ParsedQuestion {
  paperNumber: number;
}

const token = "access-granted-token-123456";

export default function PapersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId") || "";

  const [loadingSubject, setLoadingSubject] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [subject, setSubject] = useState<SubjectDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "add" | "bulk">("list");

  const [paperNames, setPaperNames] = useState<Record<number, string>>({});
  const [editingPaperName, setEditingPaperName] = useState(false);
  const [newPaperNameInput, setNewPaperNameInput] = useState("");
  const [deletingPaper, setDeletingPaper] = useState(false);

  const [addingPaper, setAddingPaper] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  const [parsedQuestions, setParsedQuestions] = useState<UploadedParsedQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const loadSubject = useCallback(async () => {
    if (!subjectId) return;
    setLoadingSubject(true);
    try {
      const result = await aoAaoAdminService.listSubjects(token);
      const sub = result.subjects.find((s) => s.id === subjectId);
      if (sub) {
        setSubject(sub);
      } else {
        toast.error("Subject not found");
        navigate("/admin/ao-aao");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load subject");
      navigate("/admin/ao-aao");
    } finally {
      setLoadingSubject(false);
    }
  }, [subjectId, navigate]);

  const fetchQuestions = useCallback(async () => {
    if (!subjectId) return;
    setLoadingQuestions(true);
    try {
      const result = await aoAaoAdminService.listQuestions(token, subjectId);
      setQuestions(result.questions as any[]);
      setPaperNames(result.paperNames || {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoadingQuestions(false);
    }
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId) return;
    void loadSubject();
    void fetchQuestions();
  }, [subjectId, loadSubject, fetchQuestions]);

  async function handleDeletePaper() {
    if (!selectedPaper || !subject) return;
    if (
      !confirm(
        `Are you sure you want to delete Mock Paper ${selectedPaper}? All questions in it will be permanently deleted and subsequent paper numbers shifted down.`,
      )
    )
      return;

    setDeletingPaper(true);
    try {
      const result = await aoAaoAdminService.deletePaper(token, subject.id, selectedPaper);
      if (result.ok) {
        toast.success("Mock paper deleted successfully!");
        setSubject((prev) => (prev ? { ...prev, papers: result.papers } : null));
        setSelectedPaper(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete paper");
    } finally {
      setDeletingPaper(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const result = await aoAaoAdminService.deleteQuestion(token, questionId);
      if (result.ok) {
        toast.success("Question deleted successfully!");
        await fetchQuestions();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete question");
    }
  }

  async function handleSavePaperName() {
    if (!selectedPaper || !subject || !newPaperNameInput.trim()) return;
    try {
      const result = await aoAaoAdminService.editPaperName(
        token,
        subject.id,
        selectedPaper,
        newPaperNameInput.trim(),
      );
      if (result.ok) {
        toast.success("Paper name updated successfully!");
        setEditingPaperName(false);
        await fetchQuestions();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update paper name");
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
  }

  async function handleAddPaper() {
    if (!subject) return;
    setAddingPaper(true);
    try {
      const result = await aoAaoAdminService.addPaper(token, subject.id);
      if (result.ok) {
        toast.success(`Mock Paper ${result.papers} added successfully!`);
        setSubject((prev) => (prev ? { ...prev, papers: result.papers } : null));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add new paper");
    } finally {
      setAddingPaper(false);
    }
  }

  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPaper || !subject) return;
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
      const result = await aoAaoAdminService.addQuestion(token, {
        subjectId: subject.id,
        paperNumber: selectedPaper,
        questionText: formQuestion.trim(),
        optionA: formOptionA.trim(),
        optionB: formOptionB.trim(),
        optionC: formOptionC.trim(),
        optionD: formOptionD.trim(),
        correctOption: formCorrect,
        explanation: formExplanation.trim(),
      });

      if (result.ok) {
        toast.success("MCQ question added successfully!");
        resetForm();
        await fetchQuestions();
        setActiveTab("list");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setSubmitting(false);
    }
  }

  function parseCSV(text: string): string[][] {
    const lines: string[][] = [];
    let row: string[] = [];
    let col = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          col += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        row.push(col.trim());
        col = "";
      } else if ((c === "\r" || c === "\n") && !inQuotes) {
        if (c === "\r" && next === "\n") i++;
        row.push(col.trim());
        if (row.some((x) => x !== "")) {
          lines.push(row);
        }
        row = [];
        col = "";
      } else {
        col += c;
      }
    }
    if (col !== "" || row.length > 0) {
      row.push(col.trim());
      if (row.some((x) => x !== "")) {
        lines.push(row);
      }
    }
    return lines;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedPaper) return;

    setUploadFile(file);
    setParseError(null);
    setParsedQuestions([]);
    setParsing(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let extractedText = "";

      if (extension === "csv") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvText = event.target?.result as string;
          try {
            const lines = parseCSV(csvText);
            if (lines.length < 2) {
              setParseError("CSV file is empty or lacks headers.");
              setParsing(false);
              return;
            }

            const headers = lines[0].map((h) => h.toLowerCase().replace(/_|\s/g, ""));
            const requiredHeaders = [
              "questiontext",
              "optiona",
              "optionb",
              "optionc",
              "optiond",
              "correctoption",
            ];
            const missing = requiredHeaders.filter(
              (req) =>
                !headers.some(
                  (h) =>
                    h.includes(req) ||
                    (req === "optiona" && h === "a") ||
                    (req === "optionb" && h === "b") ||
                    (req === "optionc" && h === "c") ||
                    (req === "optiond" && h === "d"),
                ),
            );

            if (missing.length > 0) {
              setParseError(`Missing required CSV column headers: ${missing.join(", ")}`);
              setParsing(false);
              return;
            }

            const list: UploadedParsedQuestion[] = [];
            for (let i = 1; i < lines.length; i++) {
              const row = lines[i];
              if (row.length < 6) continue;

              const q: Partial<UploadedParsedQuestion> = {};
              headers.forEach((header, index) => {
                const val = row[index] || "";
                if (header.includes("question")) q.questionText = val;
                else if (header === "a" || header.includes("optiona")) q.optionA = val;
                else if (header === "b" || header.includes("optionb")) q.optionB = val;
                else if (header === "c" || header.includes("optionc")) q.optionC = val;
                else if (header === "d" || header.includes("optiond")) q.optionD = val;
                else if (header.includes("correct") || header === "answer") {
                  const upper = val.toUpperCase().trim();
                  q.correctOption = (["A", "B", "C", "D"].includes(upper) ? upper : "A") as
                    | "A"
                    | "B"
                    | "C"
                    | "D";
                } else if (header.includes("explanation") || header === "exp") {
                  q.explanation = val;
                }
              });

              q.paperNumber = selectedPaper;
              if (q.explanation === undefined) q.explanation = "";

              if (
                q.questionText &&
                q.optionA &&
                q.optionB &&
                q.optionC &&
                q.optionD &&
                q.correctOption
              ) {
                list.push(q as UploadedParsedQuestion);
              }
            }

            if (list.length === 0) {
              setParseError("Could not parse any valid questions from the CSV file.");
            } else {
              setParsedQuestions(list);
              toast.success(`Parsed ${list.length} questions successfully!`);
            }
          } catch (err) {
            setParseError("Failed to parse CSV file.");
          }
          setParsing(false);
        };
        reader.readAsText(file);
        return;
      } else if (extension === "pdf") {
        extractedText = await extractTextFromPDF(file);
      } else if (extension === "docx") {
        extractedText = await extractTextFromDocx(file);
      } else if (extension === "txt") {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = (event) => {
            extractedText = event.target?.result as string;
            resolve();
          };
          reader.onerror = () => reject();
          reader.readAsText(file);
        });
      } else {
        setParseError("Unsupported file format. Please upload PDF, Word (.docx), CSV, or TXT.");
        setParsing(false);
        return;
      }

      const list = parseMCQFromText(extractedText);
      if (list.length === 0) {
        setParseError(
          "Could not identify any questions matching MCQ pattern in the file. " +
            "Ensure options start with A/B/C/D and the answer is explicitly labeled.",
        );
      } else {
        const mappedList = list.map((q) => ({
          ...q,
          paperNumber: selectedPaper,
        }));
        setParsedQuestions(mappedList);
        toast.success(`Successfully parsed ${mappedList.length} questions from document!`);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to extract text from document.");
    } finally {
      setParsing(false);
    }
  }

  async function handleBulkUpload() {
    if (parsedQuestions.length === 0 || !subject) return;

    setSubmitting(true);
    try {
      const result = await aoAaoAdminService.bulkAddQuestions(
        token,
        subject.id,
        parsedQuestions,
      );

      if (result.ok) {
        toast.success(`Successfully uploaded ${result.count} questions to Paper ${selectedPaper}!`);
        resetBulkState();
        await fetchQuestions();
        setActiveTab("list");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statsByPaper = useMemo(() => {
    const stats: Record<number, number> = {};
    if (!subject) return stats;
    for (let i = 1; i <= subject.papers; i++) stats[i] = 0;
    questions.forEach((q) => {
      stats[q.paper_number] = (stats[q.paper_number] || 0) + 1;
    });
    return stats;
  }, [questions, subject]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesPaper = q.paper_number === selectedPaper;
      const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPaper && matchesSearch;
    });
  }, [questions, selectedPaper, searchQuery]);

  if (loadingSubject) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground font-sans">Loading subject and papers data...</p>
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="flex bg-slate-50 rounded-2xl border overflow-hidden min-h-[calc(100vh-8rem)] font-sans text-left">
      {/* Left Sidebar - Papers Directory */}
      <aside className="w-80 border-r bg-white flex flex-col h-full shrink-0 p-5 space-y-6">
        <div className="space-y-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
              Managing Papers for
            </span>
            <h2 className="font-display font-extrabold text-xl leading-tight text-gray-900">
              {subject.name}
            </h2>
            <p className="text-xs text-muted-foreground">Target release: {subject.release}</p>
          </div>
        </div>

        <hr className="border-border/60" />

        {/* Papers Directory Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">Papers Directory</h3>
          <Button
            size="sm"
            variant="outline"
            className="border-green-600/20 text-green-700 hover:bg-green-50 text-[11px] h-7 px-2 font-semibold bg-white"
            onClick={handleAddPaper}
            disabled={addingPaper}
          >
            {addingPaper ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            Add Paper
          </Button>
        </div>

        {/* Sidebar List of Papers */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {Array.from({ length: subject.papers }).map((_, idx) => {
            const paperNum = idx + 1;
            const isSelected = selectedPaper === paperNum;
            const count = statsByPaper[paperNum] || 0;
            const paperDisplayName = paperNames[paperNum] || `Mock Paper ${paperNum}`;

            return (
              <button
                key={paperNum}
                onClick={() => {
                  setSelectedPaper(paperNum);
                  setActiveTab("list");
                  resetBulkState();
                  resetForm();
                }}
                className={
                  "w-full text-left p-4 rounded-xl border transition flex items-center justify-between " +
                  (isSelected
                    ? "bg-green-50 border-green-500 text-green-700 font-semibold"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-900")
                }
              >
                <div className="space-y-1.5 pr-2 min-w-0 flex-1">
                  <p className="font-bold text-xs leading-tight truncate">{paperDisplayName}</p>
                  <p className="text-[10px] text-gray-500 leading-none font-normal">
                    {count} questions uploaded
                  </p>
                </div>
                <ChevronRight
                  className={
                    "h-4 w-4 shrink-0 transition-transform " +
                    (isSelected ? "text-green-600 translate-x-0.5" : "text-gray-400")
                  }
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Content Panel */}
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
        {selectedPaper === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[450px]">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-150 text-gray-500 shadow-soft mb-4 bg-gray-50">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">
              Select a Mock Paper
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
              Click on any paper in the directory on the left to view, edit, or upload
              multiple-choice questions.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Paper Detail Header */}
            <div className="px-8 pt-6 pb-4 border-b border-gray-100 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {editingPaperName ? (
                  <div className="flex items-center gap-2 max-w-md mt-1">
                    <Input
                      value={newPaperNameInput}
                      onChange={(e) => setNewPaperNameInput(e.target.value)}
                      placeholder="Enter custom paper name..."
                      className="h-9 bg-white"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSavePaperName}
                      className="h-9 w-9 text-green-600 hover:bg-green-50 shrink-0 cursor-pointer"
                      title="Save Name"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingPaperName(false)}
                      className="h-9 w-9 text-muted-foreground hover:bg-muted shrink-0 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-lg flex items-center gap-2 leading-tight text-gray-900">
                      <FileText className="h-5 w-5 text-green-700 shrink-0" />
                      <span className="truncate">
                        {paperNames[selectedPaper] || `Mock Paper ${selectedPaper}`}
                      </span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setNewPaperNameInput(
                          paperNames[selectedPaper] || `Mock Paper ${selectedPaper}`,
                        );
                        setEditingPaperName(true);
                      }}
                      className="h-7 w-7 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
                      title="Edit Paper Name"
                    >
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1.5">
                  Manage manual MCQs or perform document uploads directly into this paper.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 sm:self-center self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeletePaper}
                  disabled={deletingPaper}
                  className="border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl h-9 cursor-pointer flex items-center gap-1.5 bg-white"
                >
                  {deletingPaper ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Delete Paper</span>
                </Button>
                <div className="bg-white border px-4 py-1.5 rounded-xl text-center shadow-soft">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block leading-none">
                    Paper Stats
                  </span>
                  <p className="font-display font-extrabold text-sm text-gray-900 mt-1 leading-none">
                    {statsByPaper[selectedPaper] || 0} Questions
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs Menu */}
            <div className="px-8 pt-2 border-b bg-gray-50 shrink-0">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "list" | "add" | "bulk")}
                className="w-full"
              >
                <TabsList className="flex gap-4 border-b-0 bg-transparent h-10 p-0">
                  <TabsTrigger
                    value="list"
                    className="border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 rounded-none px-1 py-2 font-semibold text-xs tracking-wide bg-transparent cursor-pointer shadow-none"
                  >
                    Questions ({filteredQuestions.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="add"
                    className="border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 rounded-none px-1 py-2 font-semibold text-xs tracking-wide bg-transparent cursor-pointer shadow-none"
                  >
                    Add Question Manually
                  </TabsTrigger>
                  <TabsTrigger
                    value="bulk"
                    className="border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-700 rounded-none px-1 py-2 font-semibold text-xs tracking-wide bg-transparent cursor-pointer shadow-none"
                  >
                    Bulk Upload File
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Dynamic View panels */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50 p-8">
              {activeTab === "list" && (
                <div className="space-y-4 max-w-4xl">
                  {/* Search Panel */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions inside this mock paper..."
                      className="pl-9 bg-white text-sm h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Question List */}
                  {loadingQuestions ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-7 w-7 animate-spin text-green-600" />
                      <p className="text-muted-foreground text-xs font-sans">
                        Loading questions directory...
                      </p>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-2xl bg-white">
                      <HelpCircle className="h-9 w-9 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-xs font-semibold">
                        No questions found in this paper
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Use the manual input form or upload documents to add some.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuestions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="rounded-2xl border bg-white p-5 shadow-soft space-y-4 transition hover:shadow-elegant relative"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700 border">
                                MCQ #{idx + 1}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-extrabold text-green-800 uppercase">
                                Answer: Option {q.correct_option}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <p className="text-sm font-semibold leading-relaxed text-gray-900">
                            {q.question_text}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                            <div
                              className={
                                "p-2.5 rounded-lg border " +
                                (q.correct_option === "A"
                                  ? "bg-green-50 border-green-200 text-green-800 font-semibold"
                                  : "bg-white border-gray-100")
                              }
                            >
                              <span className="font-bold mr-1.5">A.</span> {q.option_a}
                            </div>
                            <div
                              className={
                                "p-2.5 rounded-lg border " +
                                (q.correct_option === "B"
                                  ? "bg-green-50 border-green-200 text-green-800 font-semibold"
                                  : "bg-white border-gray-100")
                              }
                            >
                              <span className="font-bold mr-1.5">B.</span> {q.option_b}
                            </div>
                            <div
                              className={
                                "p-2.5 rounded-lg border " +
                                (q.correct_option === "C"
                                  ? "bg-green-50 border-green-200 text-green-800 font-semibold"
                                  : "bg-white border-gray-100")
                              }
                            >
                              <span className="font-bold mr-1.5">C.</span> {q.option_c}
                            </div>
                            <div
                              className={
                                "p-2.5 rounded-lg border " +
                                (q.correct_option === "D"
                                  ? "bg-green-50 border-green-200 text-green-800 font-semibold"
                                  : "bg-white border-gray-100")
                              }
                            >
                              <span className="font-bold mr-1.5">D.</span> {q.option_d}
                            </div>
                          </div>

                          {q.explanation && (
                            <div className="bg-gray-50 border rounded-xl p-3.5 text-xs text-gray-600">
                              <span className="font-bold text-gray-900 block mb-1">
                                Explanation:
                              </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "add" && (
                <form
                  onSubmit={handleAddSingle}
                  className="space-y-5 max-w-2xl bg-white border p-6 rounded-2xl shadow-soft"
                >
                  <h4 className="font-bold text-sm text-gray-900 mb-4">
                    New Question Input Form
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-1">
                      <Label className="text-xs font-semibold text-gray-500">
                        Paper Destination
                      </Label>
                      <Input value={`Paper ${selectedPaper}`} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-1.5 col-span-1">
                      <Label
                        htmlFor="correct_opt"
                        className="text-xs font-semibold text-gray-500"
                      >
                        Correct Option
                      </Label>
                      <Select
                        value={formCorrect}
                        onValueChange={(v) => setFormCorrect(v as "A" | "B" | "C" | "D")}
                      >
                        <SelectTrigger id="correct_opt" className="bg-white">
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="A">Option A</SelectItem>
                          <SelectItem value="B">Option B</SelectItem>
                          <SelectItem value="C">Option C</SelectItem>
                          <SelectItem value="D">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="q_text"
                      className="text-xs font-semibold text-gray-500"
                    >
                      Question Text
                    </Label>
                    <Textarea
                      id="q_text"
                      placeholder="Type the question content here..."
                      value={formQuestion}
                      onChange={(e) => setFormQuestion(e.target.value)}
                      className="min-h-[90px] bg-white border"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="opt_a"
                        className="text-[11px] font-bold text-gray-500"
                      >
                        Choice Option A
                      </Label>
                      <Input
                        id="opt_a"
                        placeholder="Enter Option A value"
                        value={formOptionA}
                        onChange={(e) => setFormOptionA(e.target.value)}
                        className="bg-white border"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="opt_b"
                        className="text-[11px] font-bold text-gray-500"
                      >
                        Choice Option B
                      </Label>
                      <Input
                        id="opt_b"
                        placeholder="Enter Option B value"
                        value={formOptionB}
                        onChange={(e) => setFormOptionB(e.target.value)}
                        className="bg-white border"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="opt_c"
                        className="text-[11px] font-bold text-gray-500"
                      >
                        Choice Option C
                      </Label>
                      <Input
                        id="opt_c"
                        placeholder="Enter Option C value"
                        value={formOptionC}
                        onChange={(e) => setFormOptionC(e.target.value)}
                        className="bg-white border"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="opt_d"
                        className="text-[11px] font-bold text-gray-500"
                      >
                        Choice Option D
                      </Label>
                      <Input
                        id="opt_d"
                        placeholder="Enter Option D value"
                        value={formOptionD}
                        onChange={(e) => setFormOptionD(e.target.value)}
                        className="bg-white border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="q_exp"
                      className="text-xs font-semibold text-gray-500"
                    >
                      Explanation / Solution (Optional)
                    </Label>
                    <Textarea
                      id="q_exp"
                      placeholder="Provide deep details or reasoning for the answer..."
                      value={formExplanation}
                      onChange={(e) => setFormExplanation(e.target.value)}
                      className="min-h-[70px] bg-white border"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-6 h-10 shadow-elegant"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Save MCQ Question"
                    )}
                  </Button>
                </form>
              )}

              {activeTab === "bulk" && (
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl items-start">
                  {/* Left Column dropzone */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="border border-dashed border-gray-300 rounded-2xl p-12 bg-white text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-500 transition">
                      {parsing ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                          <span className="text-xs font-semibold">
                            Extracting and parsing text...
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-3 group-hover:text-green-600 transition" />
                          <span className="text-sm font-semibold text-gray-800">
                            Click or Drag document to parse
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            PDF (.pdf), Word (.docx), CSV (.csv), or TXT (.txt)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.docx,.csv,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </>
                      )}
                    </div>

                    {/* Preview section */}
                    {uploadFile && !parsing && (
                      <div className="rounded-2xl border bg-white p-5 space-y-4">
                        <div className="flex items-center justify-between text-xs border-b pb-3">
                          <div>
                            <span className="font-semibold text-sm truncate block max-w-[300px]">
                              {uploadFile.name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {(uploadFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={resetBulkState}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Clear
                          </Button>
                        </div>

                        {parseError ? (
                          <div className="flex items-start gap-2 bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-100">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{parseError}</span>
                          </div>
                        ) : parsedQuestions.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-start gap-2 bg-green-50 text-green-800 p-4 rounded-xl text-xs border border-green-100">
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>
                                Parsed {parsedQuestions.length} valid MCQ questions from the
                                document. Click below to insert them into the database.
                              </span>
                            </div>

                            <Button
                              onClick={handleBulkUpload}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 shadow-soft"
                              disabled={submitting}
                            >
                              {submitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                `Confirm & Upload ${parsedQuestions.length} Questions`
                              )}
                            </Button>

                            {/* Small preview list */}
                            <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto divide-y bg-gray-50">
                              {parsedQuestions.map((q, i) => (
                                <div key={i} className="p-3 text-[11px] space-y-1">
                                  <div className="flex justify-between font-bold text-gray-500">
                                    <span>Question #{i + 1}</span>
                                    <span className="text-green-700">
                                      Answer: {q.correctOption}
                                    </span>
                                  </div>
                                  <p className="font-medium text-gray-900">{q.questionText}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Right column guidelines */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="rounded-2xl border bg-white p-5 space-y-3 text-xs leading-relaxed text-gray-500 shadow-soft">
                      <div className="flex items-center gap-1.5 text-gray-900 font-semibold mb-1">
                        <FileText className="h-4 w-4 text-green-700" />
                        <span>Standard Document Schema</span>
                      </div>
                      <p>
                        Format each question in your TXT/PDF/Word file exactly like the example
                        below for automatic parsing:
                      </p>
                      <pre className="bg-gray-50 border rounded-xl p-3 text-[10px] leading-tight text-gray-800 font-mono select-all overflow-x-auto">
                        {`1. Question text here?
A. Option A value
B. Option B value
C. Option C value
D. Option D value
Answer: A
Explanation: Subject rationales here.`}
                      </pre>
                      <hr className="border-border/60" />
                      <div className="flex items-center gap-1.5 text-gray-900 font-semibold mb-1">
                        <FileSpreadsheet className="h-4 w-4 text-green-700" />
                        <span>Standard CSV Format</span>
                      </div>
                      <p>
                        For spreadsheets, ensure headers match:{" "}
                        <code className="text-gray-900 bg-gray-50 px-1 py-0.5 rounded font-mono border">
                          question_text, option_a, option_b, option_c, option_d, correct_option,
                          explanation
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
