import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { aoAaoService } from "@/services/aoAaoService";
import { loadAttempts, saveAttempt } from "@/lib/attempts";
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
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
}

const FREE_TEST_SUBJECT_ID = "00000000-0000-0000-0000-000000000000";
const FREE_TEST_PAPER = 1;

export default function FreeTestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Test states
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [attemptData, setAttemptData] = useState<any>(null);

  // Timer: records when the exam clock starts
  const startedAtRef = useRef<number | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    const raw = localStorage.getItem("agri_session");
    if (!raw) return "";
    try {
      return (JSON.parse(raw) as { token: string }).token ?? "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    aoAaoService.getFreeTest()
      .then((res) => {
        if (!res.questions || res.questions.length === 0) {
          toast.info("Free test questions are being prepared. Please check back soon!");
          void navigate("/exam/ao-aao/dashboard");
          return;
        }
        setQuestions(res.questions);

        // Check for past attempt
        const attempts = loadAttempts();
        const past = attempts
          .slice()
          .reverse()
          .find((a) => a.subjectId === FREE_TEST_SUBJECT_ID && a.paperNumber === FREE_TEST_PAPER);

        if (past) {
          setAnswers(past.answers);
          setAttemptData(past);
          setSubmitted(true);
          setStarted(true);
        } else {
          const initialAnswers: Record<string, string | null> = {};
          res.questions.forEach((q: Question) => {
            initialAnswers[q.id] = null;
          });
          setAnswers(initialAnswers);
          setStarted(true);
        }
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load free test questions");
        void navigate("/exam/ao-aao/dashboard");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, navigate]);

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
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  }

  function handleClear() {
    if (submitted) return;
    const currentQ = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: null }));
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
      subjectId: FREE_TEST_SUBJECT_ID,
      subjectName: "Free Test",
      paperNumber: FREE_TEST_PAPER,
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
    toast.success("Free test submitted successfully!");
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
      classes +=
        "bg-purple-100 border-purple-300 text-purple-700";
    } else if (isAnswered) {
      classes += "bg-green-600 border-green-600 text-white";
    } else if (isVisited) {
      classes += "bg-amber-100 border-amber-300 text-amber-800";
    } else {
      classes +=
        "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700";
    }

    return classes;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground font-sans">Loading free test questions...</p>
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
      <div className="max-w-7xl mx-auto space-y-6 font-sans text-left">
        {/* Exam Top Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-2xl bg-white shadow-soft sticky top-14 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                <Sparkles className="h-3 w-3" /> Free Test
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-muted-foreground">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="h-3 w-px bg-gray-200" />
              <span className="text-xs text-green-600 font-semibold">{answeredCount} Answered</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-soft"
            >
              Submit Test
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-1">
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Workspace Panels */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question display panel */}
          <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-soft min-h-[450px]">
            <div className="space-y-6">
              {/* Question text */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Question {currentIdx + 1}
                </span>
                <p className="font-display font-medium text-lg leading-relaxed text-gray-900 select-none">
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
                      onClick={() => handleSelectOption(opt.key as any)}
                      className={`flex items-start text-left p-4 rounded-xl border text-sm font-medium transition-all group cursor-pointer ${
                        isSelected
                          ? "bg-green-50 border-green-600 ring-1 ring-green-600 text-green-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-900"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 transition-all ${
                          isSelected
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-300 text-gray-500 group-hover:border-green-500 group-hover:text-green-600"
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

            {/* Panel Buttons */}
            <div className="mt-8 pt-6 border-t flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!selectedOption}
                  className="text-xs px-4 py-2 border cursor-pointer bg-white"
                >
                  Clear Response
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleMarkForReview}
                  className={`text-xs px-4 py-2 border cursor-pointer bg-gray-50 ${
                    isCurrentMarked ? "bg-purple-50 border-purple-400 text-purple-700" : ""
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
                  className="text-xs px-4 py-2 cursor-pointer bg-white"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  onClick={handleSaveAndNext}
                  className="text-xs px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-soft cursor-pointer"
                >
                  {currentIdx === questions.length - 1 ? "Save" : "Save & Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-5 shadow-soft space-y-5">
              <h3 className="font-bold text-sm text-gray-900">Question Directory</h3>

              {/* Scrollable Palette grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-[260px] overflow-y-auto pr-1">
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

              {/* Indicators legend */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t text-[11px] font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-green-600 border shrink-0" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-amber-100 border-amber-300 border shrink-0" />
                  <span>Not Answered ({visited.size - answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-purple-600 border shrink-0" />
                  <span>Marked Review ({marked.size})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-gray-100 border shrink-0" />
                  <span>Not Visited ({questions.length - visited.size})</span>
                </div>
              </div>
            </div>

            {/* Bottom quick reminder panel */}
            <div className="rounded-2xl border bg-white p-4 shadow-soft flex items-start gap-3 text-xs text-gray-500 leading-relaxed">
              <HelpCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900">Stuck on a question?</p>
                <p className="mt-0.5">
                  Mark it for review so you can return to it later. You can navigate directly using
                  the numbers above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit confirmation dialog */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border rounded-2xl max-w-md w-full p-6 shadow-elegant space-y-6">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="font-display font-extrabold text-lg">Submit Free Test?</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                You are about to submit your responses. You will not be able to change them after
                submitting.
              </p>

              {/* Status summary */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-gray-50 text-xs">
                <div className="text-center">
                  <span className="block text-gray-500">Answered</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {Object.values(answers).filter((v) => v !== null).length}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-500">Marked</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">{marked.size}</span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-500">Unanswered</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {questions.length - Object.values(answers).filter((v) => v !== null).length}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 text-xs rounded-xl bg-white"
                >
                  Go Back
                </Button>
                <Button
                  onClick={submitTest}
                  className="flex-1 py-3 text-xs rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
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
      loadAttempts().find(
        (x) => x.subjectId === FREE_TEST_SUBJECT_ID && x.paperNumber === FREE_TEST_PAPER,
      ) || {
        score: 0,
        totalQuestions: questions.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unattempted: questions.length,
        timeSpentSeconds: 0,
        answers: {},
      };

    const percentage =
      data.totalQuestions > 0 ? Math.round((data.score / data.totalQuestions) * 100) : 0;
    const accuracy =
      data.correctAnswers + data.incorrectAnswers > 0
        ? Math.round((data.correctAnswers / (data.correctAnswers + data.incorrectAnswers)) * 100)
        : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-left">
        {/* Action Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/exam/ao-aao/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <Button
            size="sm"
            onClick={() => {
              setStarted(false);
              setSubmitted(false);
              setCurrentIdx(0);
              const resetAns: Record<string, string | null> = {};
              questions.forEach((q) => {
                resetAns[q.id] = null;
              });
              setAnswers(resetAns);
              setMarked(new Set());
              setVisited(new Set());
              setStarted(true);
            }}
            className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 rounded-xl px-4 h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retake Test
          </Button>
        </div>

        {/* Scorecard Box */}
        <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-elegant relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-green-600 opacity-[0.03]">
            <Award className="h-48 w-48" />
          </div>

          <div className="relative grid md:grid-cols-3 gap-6 items-center">
            {/* Main Score */}
            <div className="flex flex-col items-center justify-center p-4 text-center border-b md:border-b-0 md:border-r">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Your Score
              </span>
              <p className="font-display font-black text-4xl sm:text-5xl text-green-600 mt-2">
                {data.score}{" "}
                <span className="text-xs font-bold text-gray-500">
                  / {data.totalQuestions}
                </span>
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {percentage}% Score Rating
              </div>
            </div>

            {/* Performance Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Accuracy
                </span>
                <p className="font-display font-extrabold text-lg mt-1 text-gray-900">
                  {accuracy}%
                </p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Time Taken
                </span>
                <p className="font-display font-extrabold text-lg mt-1 text-gray-900">
                  {Math.floor(data.timeSpentSeconds / 60)}m {data.timeSpentSeconds % 60}s
                </p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Correct / Wrong
                </span>
                <p className="font-display font-extrabold text-base mt-1">
                  <span className="text-green-600">{data.correctAnswers}</span> /{" "}
                  <span className="text-red-600">{data.incorrectAnswers}</span>
                </p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Unattempted
                </span>
                <p className="font-display font-extrabold text-lg mt-1 text-gray-500">
                  {data.unattempted}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-gray-900">Question-by-Question Review</h3>
          <p className="text-xs text-gray-500">
            Review the correct options and detailed explanations below. Green options indicate
            correct choices.
          </p>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAns = data.answers[q.id];
              const isCorrect = userAns === q.correctOption;
              const hasAnswered = userAns !== null && userAns !== undefined;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border bg-white p-5 sm:p-6 shadow-soft space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center justify-center h-6 w-14 rounded-full bg-gray-100 text-xs font-bold text-gray-900">
                      Q {idx + 1}
                    </span>

                    {hasAnswered ? (
                      isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Incorrect
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        Unattempted
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-sm sm:text-base leading-relaxed text-gray-900 select-text">
                    {q.questionText}
                  </p>

                  {/* MCQ Options in Review Mode */}
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
                        optClasses += "bg-green-50 border-green-600 text-green-700";
                        ringClasses += "border-green-600 bg-green-600 text-white";
                      } else if (isUserSelected) {
                        optClasses += "bg-red-50 border-red-200 text-red-700";
                        ringClasses += "border-red-500 bg-red-600 text-white";
                      } else {
                        optClasses += "border-gray-200 text-gray-900";
                        ringClasses += "border-gray-300 text-gray-500";
                      }

                      return (
                        <div key={opt.key} className={optClasses}>
                          <span className={ringClasses}>{opt.key}</span>
                          <span className="flex-1">{opt.val}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-2 p-3 rounded-xl bg-green-50 border border-green-100 text-xs text-green-900 leading-relaxed">
                      <span className="font-bold text-green-800">Explanation: </span>
                      {q.explanation}
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
