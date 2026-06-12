import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { loadAttempts, type TestAttempt } from "@/lib/attempts";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    setAttempts(loadAttempts());
  }, []);

  return (
    <div className="space-y-6 max-w-7xl font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Test Results</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your performance, correct answers and detailed explanations for all completed
            attempts.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="sm:self-center self-start shrink-0 rounded-xl cursor-pointer bg-white"
        >
          <Link
            to={subjectId ? `/exam/ao-aao/subjects/${subjectId}/tests` : "/exam/ao-aao/subjects"}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {subjectId ? "Back to Papers" : "Back to Subjects"}
          </Link>
        </Button>
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-soft max-w-2xl bg-white">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-bold text-base text-gray-900">No attempts recorded</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            You haven't attempted any mock tests yet. Start a test series to view your detailed
            scorecards, accuracy, and explanations.
          </p>
          <Button
            asChild
            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 rounded-xl shadow-soft"
          >
            <Link to="/exam/ao-aao/subjects">Browse Subjects</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {attempts
              .slice()
              .reverse()
              .map((attempt) => {
                const accuracy =
                  attempt.correctAnswers + attempt.incorrectAnswers > 0
                    ? Math.round(
                        (attempt.correctAnswers /
                          (attempt.correctAnswers + attempt.incorrectAnswers)) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    key={attempt.id}
                    className="group rounded-2xl border bg-card p-5 shadow-soft hover:shadow-elegant transition flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white"
                  >
                    <div className="space-y-3">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Mock Paper {attempt.paperNumber}
                        </span>
                        <h3 className="font-display font-extrabold text-base sm:text-lg text-gray-900 mt-1.5 group-hover:text-green-700 transition-colors">
                          {attempt.subjectName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(attempt.submittedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="h-3 w-px bg-border hidden sm:inline" />
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {attempt.correctAnswers} Correct
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <XCircle className="h-3.5 w-3.5" />
                          {attempt.incorrectAnswers} Incorrect
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {attempt.unattempted} Unattempted
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 gap-4">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Score
                        </span>
                        <p className="font-display font-black text-xl sm:text-2xl text-gray-900 mt-0.5">
                          {attempt.score}{" "}
                          <span className="text-xs text-muted-foreground">
                            / {attempt.totalQuestions}
                          </span>
                        </p>
                        <span className="text-[10px] text-green-600 font-semibold mt-0.5 block">
                          {accuracy}% accuracy
                        </span>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="text-xs font-semibold px-4 rounded-xl cursor-pointer bg-white"
                      >
                        <Link
                          to={`/exam/ao-aao/subjects/${attempt.subjectId}/tests/${attempt.paperNumber}/session`}
                        >
                          Review Scorecard
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}
