import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { aoAaoService, AoAaoQuestion } from "@/services/aoAaoService";
import { loadAttempts, saveAttempt, type TestAttempt } from "@/lib/attempts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Award,
  ArrowLeft,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ── Draft helpers (in-progress save) ──────────────────────────────────────────
function draftKey(subjectId: string, paperNumber: number) {
  return `agri_draft_${subjectId}_${paperNumber}`;
}
function saveDraft(subjectId: string, paperNumber: number, answers: Record<string, string | null>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      draftKey(subjectId, paperNumber),
      JSON.stringify({ answers, savedAt: Date.now() }),
    );
  } catch { /* ignore */ }
}
function loadDraft(subjectId: string, paperNumber: number): Record<string, string | null> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(draftKey(subjectId, paperNumber));
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { answers: Record<string, string | null> }).answers;
  } catch {
    return null;
  }
}
export function clearDraft(subjectId: string, paperNumber: number) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftKey(subjectId, paperNumber));
}

export default function TestSessionPage() {
  const { subjectId, paperNumber: paperNumStr } = useParams<{ subjectId: string; paperNumber: string }>();
  const [searchParams] = useSearchParams();
  const retake = searchParams.get("retake") === "true";
  const paperNumber = parseInt(paperNumStr || "1", 10);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<AoAaoQuestion[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [paperDisplayName, setPaperDisplayName] = useState("");

  // Test states
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [attemptData, setAttemptData] = useState<TestAttempt | null>(null);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Timer
  const startedAtRef = useRef<number | null>(null);
  const loadingRef = useRef(false);

  const fetchWithRetry = useCallback(
    async <T,>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
      let lastErr: unknown;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn();
        } catch (err) {
          lastErr = err;
          if (attempt < maxRetries - 1) {
            await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
          }
        }
      }
      throw lastErr;
    },
    [],
  );

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    const raw = localStorage.getItem("agri_session");
    if (!raw) return "";
    try {
      return JSON.parse(raw).token ?? "";
    } catch {
      return "";
    }
  }, []);

  // Fetch questions
  useEffect(() => {
    if (!token || !subjectId) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(null);

    fetchWithRetry(() => aoAaoService.getSubjectTests(subjectId))
      .then((res) => {
        setSubjectName(res.subject.name);
      })
      .catch((e) => console.error("Error loading subject name", e));

    fetchWithRetry(() => aoAaoService.getPaperQuestions(subjectId, paperNumber))
      .then((res) => {
        setQuestions(res.questions);
        setPaperDisplayName(res.paperName || `Mock Paper ${paperNumber}`);
        const attempts = loadAttempts();
        const past = attempts
          .slice()
          .reverse()
          .find((a) => a.subjectId === subjectId && a.paperNumber === paperNumber);

        if (past && !retake) {
          setAnswers(past.answers);
          setAttemptData(past);
          setSubmitted(true);
          setStarted(true);
        } else {
          const draft = loadDraft(subjectId, paperNumber);
          const initialAnswers: Record<string, string | null> = {};
          res.questions.forEach((q: AoAaoQuestion) => {
            initialAnswers[q.id] = null;
          });
          setAnswers(draft ?? initialAnswers);
          setAttemptData(null);
          setSubmitted(false);
          setStarted(true);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load questions";
        setLoadError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [token, subjectId, paperNumber, retryCount, fetchWithRetry, retake]);

  // Mark first question visited when started & record start time
  useEffect(() => {
    if (started && !submitted && questions.length > 0) {
      if (!startedAtRef.current) {
        startedAtRef.current = Date.now();
      }
      setVisited((prev) => {
        const next = new Set(prev);
        next.add(questions[0].id);
        return next;
      });
    }
  }, [started, submitted, questions]);

  function handleSelectOption(option: "A" | "B" | "C" | "D") {
    if (submitted) return;
    const currentQ = questions[currentIdx];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);
    saveDraft(subjectId!, paperNumber, newAnswers);
  }

  function handleClear() {
    if (submitted) return;
    const currentQ = questions[currentIdx];
    const newAnswers = { ...answers, [currentQ.id]: null };
    setAnswers(newAnswers);
    saveDraft(subjectId!, paperNumber, newAnswers);
  }

  function handleMarkForReview() {
    if (submitted) return;
    const currentQ = questions[currentIdx];
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
    handleNext();
  }

  function handleSaveAndNext() {
    if (submitted) return;
    handleNext();
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setVisited((prev) => {
        const next = new Set(prev);
        next.add(questions[nextIdx].id);
        return next;
      });
    }
  }

  function handlePrev() {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setVisited((prev) => {
        const next = new Set(prev);
        next.add(questions[prevIdx].id);
        return next;
      });
    }
  }

  function handlePaletteJump(idx: number) {
    setCurrentIdx(idx);
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(questions[idx].id);
      return next;
    });
  }

  function submitTest() {
    setShowSubmitModal(false);
    setSubmitted(true);

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans === null || ans === undefined) {
        unattemptedCount++;
      } else if (ans === q.correctOption) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const score = correctCount;

    const attempt = {
      subjectId: subjectId!,
      subjectName,
      paperNumber,
      paperName: paperDisplayName,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unattempted: unattemptedCount,
      timeSpentSeconds: startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : 0,
      answers,
    };

    const saved = saveAttempt(attempt);
    setAttemptData(saved);
    clearDraft(subjectId!, paperNumber);
    toast.success("Test submitted successfully!");
  }

  const getQuestionPaletteBg = (qId: string, idx: number) => {
    const isAnswered = answers[qId] !== null && answers[qId] !== undefined;
    const isMarked = marked.has(qId);
    const isVisited = visited.has(qId);
    const isCurrent = currentIdx === idx;

    let classes =
      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all relative border ";
    if (isCurrent) {
      classes += "ring-2 ring-green-600 ring-offset-2 scale-105 ";
    }

    if (isAnswered && isMarked) {
      classes += "bg-purple-600 border-purple-500 text-white";
    } else if (isMarked) {
      classes += "bg-purple-100 border-purple-300 text-purple-700";
    } else if (isAnswered) {
      classes += "bg-green-600 border-green-600 text-white";
    } else if (isVisited) {
      classes += "bg-yellow-50 border-yellow-300 text-yellow-800";
    } else {
      classes += "bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground";
    }

    return classes;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">Loading test questions...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h2 className="font-bold text-lg text-foreground">Failed to load questions</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{loadError}</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            onClick={() => {
              loadingRef.current = false;
              setRetryCount((c) => c + 1);
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate("/exam/ao-aao/subjects")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Active Exam mode
  if (started && !submitted) {
    const currentQ = questions[currentIdx];
    const isCurrentMarked = marked.has(currentQ.id);
    const selectedOption = answers[currentQ.id];
    const answeredCount = Object.values(answers).filter((v) => v !== null).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden font-sans">
        {/* Exam Top Bar Header */}
        <div className="flex-none border-b bg-card px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toast.info("Test progress saved! You can resume anytime.");
                navigate(`/exam/ao-aao/subjects/${subjectId}/tests`);
              }}
              title="Save and Exit"
              className="rounded-xl border hover:bg-muted shrink-0 cursor-pointer h-9 w-9 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="text-left">
              <h2 className="font-bold text-sm sm:text-base line-clamp-1 text-gray-900">
                {subjectName} — {paperDisplayName}
              </h2>
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="text-[11px] text-muted-foreground">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="h-2.5 w-px bg-border" />
                <span className="text-[11px] text-green-700 font-semibold">
                  {answeredCount} Answered
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobilePalette((prev) => !prev)}
              className="lg:hidden text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer h-9"
            >
              <Menu className="h-4 w-4" />
              <span>Directory</span>
            </Button>

            <Button
              onClick={() => setShowSubmitModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-soft cursor-pointer"
            >
              Submit Test
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercent} className="h-1 flex-none rounded-none bg-gray-100" />

        {/* Content Workspace */}
        <div className="flex-1 overflow-hidden flex relative">
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Scrollable Question and Options */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Question {currentIdx + 1}
                    </span>
                    {isCurrentMarked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        <Bookmark className="h-3 w-3 fill-purple-700" /> Marked for Review
                      </span>
                    )}
                  </div>
                  <p className="font-display font-medium text-base sm:text-lg leading-relaxed text-gray-900 select-none">
                    {currentQ.questionText}
                  </p>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                  {[
                    { key: "A", val: currentQ.optionA },
                    { key: "B", val: currentQ.optionB },
                    { key: "C", val: currentQ.optionC },
                    { key: "D", val: currentQ.optionD },
                  ].map((opt) => {
                    const isSelected = selectedOption === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key as "A" | "B" | "C" | "D")}
                        className={`flex items-start text-left p-4 rounded-xl border text-sm font-medium transition-all group cursor-pointer ${
                          isSelected
                            ? "bg-green-50 border-green-600 ring-1 ring-green-600 text-green-800"
                            : "border-border hover:bg-muted/40 text-gray-950"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 transition-all ${
                            isSelected
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-muted-foreground/40 group-hover:border-green-600/50 text-muted-foreground group-hover:text-green-600"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="flex-1">{opt.val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel Buttons Footer - fixed to screen */}
            <div className="flex-none border-t bg-card px-4 sm:px-8 py-3.5 shadow-lg bg-white">
              <div className="max-w-3xl mx-auto flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    disabled={!selectedOption}
                    className="text-xs px-3 py-1.5 sm:px-4 sm:py-2 border cursor-pointer rounded-xl"
                  >
                    Clear Response
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleMarkForReview}
                    className={`text-xs px-3 py-1.5 sm:px-4 sm:py-2 border cursor-pointer rounded-xl ${
                      isCurrentMarked ? "bg-purple-100 border-purple-400 text-purple-700" : ""
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5 mr-1" />
                    {isCurrentMarked ? "Marked" : "Mark for Review"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="text-xs px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleSaveAndNext}
                    className="text-xs px-4 py-1.5 sm:px-5 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-soft cursor-pointer rounded-xl"
                  >
                    {currentIdx === questions.length - 1 ? "Save" : "Save & Next"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Palette Sidebar (Large Screens Only) */}
          <div className="w-72 xl:w-80 border-l bg-card flex-none overflow-y-auto p-5 space-y-5 hidden lg:block bg-white text-left">
            <h3 className="font-bold text-sm">Question Directory</h3>

            <div className="grid grid-cols-5 xl:grid-cols-6 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handlePaletteJump(idx)}
                  className={getQuestionPaletteBg(q.id, idx)}
                >
                  {idx + 1}
                  {answers[q.id] !== null && marked.has(q.id) && (
                    <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-green-400 border border-purple-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t text-[11px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-green-600 border shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-yellow-50 border-yellow-300 border shrink-0" />
                <span>Not Answered ({visited.size - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-purple-600 border shrink-0" />
                <span>Marked Review ({marked.size})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-muted border shrink-0" />
                <span>Not Visited ({questions.length - visited.size})</span>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
              <HelpCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Stuck on a question?</p>
                <p className="mt-0.5">
                  Mark it for review so you can return to it later.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Sliding Drawer Palette */}
          {showMobilePalette && (
            <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden flex justify-end">
              <div className="w-80 max-w-full bg-card h-full border-l p-5 flex flex-col justify-between shadow-elegant animate-in slide-in-from-right duration-200">
                <div className="space-y-5 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="font-bold text-sm">Question Directory</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobilePalette(false)}
                      className="h-8 w-8 rounded-full border cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-5 gap-2 pr-1">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          handlePaletteJump(idx);
                          setShowMobilePalette(false);
                        }}
                        className={getQuestionPaletteBg(q.id, idx)}
                      >
                        {idx + 1}
                        {answers[q.id] !== null && marked.has(q.id) && (
                          <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-green-400 border border-purple-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    className="w-full text-xs font-semibold py-2.5 rounded-xl border cursor-pointer"
                    variant="outline"
                    onClick={() => setShowMobilePalette(false)}
                  >
                    Close Directory
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit confirmation dialog */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border rounded-2xl max-w-md w-full p-6 shadow-elegant space-y-6 bg-white text-left">
              <div className="flex items-center gap-3 text-yellow-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="font-display font-extrabold text-lg">Submit Exam Responses?</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                You are about to submit your exam sheet. You will not be able to change your
                responses after submitting.
              </p>

              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted text-xs">
                <div className="text-center">
                  <span className="block text-muted-foreground">Answered</span>
                  <span className="font-bold text-foreground text-sm mt-0.5">{answeredCount}</span>
                </div>
                <div className="text-center">
                  <span className="block text-muted-foreground">Marked</span>
                  <span className="font-bold text-foreground text-sm mt-0.5">{marked.size}</span>
                </div>
                <div className="text-center">
                  <span className="block text-muted-foreground">Unanswered</span>
                  <span className="font-bold text-foreground text-sm mt-0.5">
                    {questions.length - answeredCount}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 text-xs rounded-xl cursor-pointer"
                >
                  Go Back
                </Button>
                <Button
                  onClick={submitTest}
                  className="flex-1 py-3 text-xs rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer"
                >
                  Yes, Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Post-test Review/Scorecard
  if (submitted) {
    const data = attemptData ||
      loadAttempts().find((x) => x.subjectId === subjectId && x.paperNumber === paperNumber) || {
        score: 0,
        totalQuestions: questions.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unattempted: questions.length,
        timeSpentSeconds: 0,
        answers: {} as Record<string, string | null>,
      };

    const percentage =
      data.totalQuestions > 0 ? Math.round((data.score / data.totalQuestions) * 100) : 0;
    const accuracy =
      data.correctAnswers + data.incorrectAnswers > 0
        ? Math.round((data.correctAnswers / (data.correctAnswers + data.incorrectAnswers)) * 100)
        : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-left">
        <div className="flex items-center justify-between">
          <Link
            to={`/exam/ao-aao/subjects/${subjectId}/tests`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Papers
          </Link>
          <Button
            size="sm"
            onClick={() => {
              setStarted(true);
              setSubmitted(false);
              setAttemptData(null);
              setCurrentIdx(0);
              const resetAns: Record<string, string | null> = {};
              questions.forEach((q) => {
                resetAns[q.id] = null;
              });
              setAnswers(resetAns);
              setMarked(new Set());
              setVisited(new Set());
              navigate(`/exam/ao-aao/subjects/${subjectId}/tests/${paperNumber}/session?retake=true`);
            }}
            className="text-xs bg-muted hover:bg-accent border border-border text-foreground font-semibold flex items-center gap-1.5 rounded-xl px-4"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retake Test
          </Button>
        </div>

        {/* Scorecard Box */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-elegant relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 p-6 text-green-600 opacity-[0.03]">
            <Award className="h-48 w-48" />
          </div>

          <div className="relative grid md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center p-4 text-center border-b md:border-b-0 md:border-r">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Score
              </span>
              <p className="font-display font-black text-4xl sm:text-5xl text-green-600 mt-2">
                {data.score}{" "}
                <span className="text-xs font-bold text-muted-foreground">
                  / {data.totalQuestions}
                </span>
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {percentage}% Score Rating
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/40 border rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Accuracy
                </span>
                <p className="font-display font-extrabold text-lg mt-1 text-foreground">
                  {accuracy}%
                </p>
              </div>
              <div className="p-3 bg-muted/40 border rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Time Taken
                </span>
                <p className="font-display font-extrabold text-lg mt-1 text-foreground">
                  {Math.floor(data.timeSpentSeconds / 60)}m {data.timeSpentSeconds % 60}s
                </p>
              </div>
              <div className="p-3 bg-muted/40 border rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Correct / Wrong
                </span>
                <p className="font-display font-extrabold text-base mt-1">
                  <span className="text-success">{data.correctAnswers}</span> /{" "}
                  <span className="text-destructive">{data.incorrectAnswers}</span>
                </p>
              </div>
              <div className="p-3 bg-muted/40 border rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Unattempted
                </span>
                <p className="font-display font-extrabold text-lg mt-1 text-muted-foreground">
                  {data.unattempted}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg">Question-by-Question Review</h3>
          <p className="text-xs text-muted-foreground">
            Review the correct options and detailed explanations below.
          </p>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAns = data.answers[q.id];
              const isCorrect = userAns === q.correctOption;
              const hasAnswered = userAns !== null && userAns !== undefined;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border bg-card p-5 sm:p-6 shadow-soft space-y-4 bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center justify-center h-6 w-14 rounded-full bg-muted text-xs font-bold text-foreground">
                      Q {idx + 1}
                    </span>

                    {hasAnswered ? (
                      isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Incorrect
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                        Unattempted
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-sm sm:text-base leading-relaxed text-gray-900 select-text">
                    {q.questionText}
                  </p>

                  <div className="grid gap-2.5">
                    {[
                      { key: "A", val: q.optionA },
                      { key: "B", val: q.optionB },
                      { key: "C", val: q.optionC },
                      { key: "D", val: q.optionD },
                    ].map((opt) => {
                      const isCorrectOpt = q.correctOption === opt.key;
                      const isUserSelected = userAns === opt.key;

                      let optClasses =
                        "flex items-start text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors ";
                      let ringClasses =
                        "h-4 w-4 shrink-0 rounded-full border flex items-center justify-center text-[9px] font-bold mr-3 mt-0.5 ";

                      if (isCorrectOpt) {
                        optClasses += "bg-green-100/50 border-green-600 text-green-800";
                        ringClasses += "border-green-600 bg-green-600 text-white";
                      } else if (isUserSelected) {
                        optClasses += "bg-red-100/50 border-red-600 text-red-800";
                        ringClasses += "border-red-600 bg-red-600 text-white";
                      } else {
                        optClasses += "border-border text-gray-900";
                        ringClasses += "border-muted-foreground/30 text-muted-foreground";
                      }

                      return (
                        <div key={opt.key} className={optClasses}>
                          <span className={ringClasses}>{opt.key}</span>
                          <span className="flex-1">{opt.val}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-green-50/50 border border-green-100 text-xs sm:text-sm text-green-950">
                      <p className="font-bold mb-1">Explanation:</p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
