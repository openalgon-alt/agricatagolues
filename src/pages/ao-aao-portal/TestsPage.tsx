import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { aoAaoService, AoAaoSubject } from "@/services/aoAaoService";
import { loadAttempts } from "@/lib/attempts";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Loader2,
  Lock,
  PlayCircle,
  RotateCcw,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";

function hasDraft(subjectId: string, paperNumber: number): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(`agri_draft_${subjectId}_${paperNumber}`);
}

export default function TestsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjectInfo, setSubjectInfo] = useState<{
    subject: AoAaoSubject;
    paperQuestionCounts: Record<number, number>;
    paperNames?: Record<number, string>;
  } | null>(null);

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

  const isUnlocked = useMemo(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("agri_unlocked") === "true";
  }, []);

  useEffect(() => {
    if (!token || !subjectId) return;
    setLoading(true);
    aoAaoService.getSubjectTests(subjectId)
      .then((res) => {
        setSubjectInfo(res);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load papers");
        navigate("/exam/ao-aao/subjects");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, subjectId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">Loading mock papers directory...</p>
      </div>
    );
  }

  if (!subjectInfo || !subjectId) {
    return (
      <div className="max-w-2xl py-12 text-left font-sans">
        <p className="text-muted-foreground">Subject details not found.</p>
        <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/exam/ao-aao/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { subject, paperQuestionCounts } = subjectInfo;

  return (
    <div className="space-y-6 max-w-7xl font-sans text-left">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {subject.name} Mock Papers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a mock paper to start practicing. All questions are based on the latest pattern.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="sm:self-center self-start shrink-0">
          <Link to="/exam/ao-aao/subjects" className="flex items-center gap-2">
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Subjects
          </Link>
        </Button>
      </div>

      {/* Grid of Papers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: subject.papers }).map((_, idx) => {
          const paperNum = idx + 1;
          const count = paperQuestionCounts[paperNum] || 0;
          const hasQuestions = count > 0;
          const customName = subjectInfo.paperNames?.[paperNum];
          const paperDisplayName = customName || `Mock Paper ${paperNum}`;

          const isFreePaper = subject.name.toLowerCase() === "agronomy" && paperNum === 1;
          const canAccess = isUnlocked || isFreePaper;

          // Determine paper state
          const isCompleted = loadAttempts().some(
            (a) => a.subjectId === subject.id && a.paperNumber === paperNum
          );
          const isInProgress = !isCompleted && hasDraft(subject.id, paperNum);

          return (
            <div
              key={paperNum}
              className="group relative rounded-2xl border bg-card p-5 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition flex flex-col justify-between bg-white"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700 shadow-soft">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                        (hasQuestions
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800")
                      }
                    >
                      {hasQuestions ? `${count} MCQs` : "Empty"}
                    </span>
                    {!canAccess && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-4 font-bold text-base leading-tight group-hover:text-green-700 transition-colors text-gray-900">
                  {paperDisplayName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5">
                  100 marks · No negative marking
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                {canAccess ? (
                  (() => {
                    if (!hasQuestions) {
                      return (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            No questions uploaded yet
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="text-xs opacity-50"
                          >
                            Start Test <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      );
                    }

                    if (isInProgress) {
                      return (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-yellow-600 font-medium">In progress…</span>
                          <Link to={`/exam/ao-aao/subjects/${subject.id}/tests/${paperNum}/session`}>
                            <Button
                              size="sm"
                              className="text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white shadow-soft"
                            >
                              <PlayCircle className="h-3.5 w-3.5 mr-1" /> Resume Test
                            </Button>
                          </Link>
                        </div>
                      );
                    }

                    if (isCompleted) {
                      return (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-green-700 font-medium">Completed ✓</span>
                          <div className="flex gap-1.5">
                            <Link to={`/exam/ao-aao/results?subjectId=${subject.id}&paperNumber=${paperNum}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs font-semibold border-green-600/30 text-green-700 hover:bg-green-50"
                              >
                                <BarChart2 className="h-3.5 w-3.5 mr-1" /> Results
                              </Button>
                            </Link>
                            <Link to={`/exam/ao-aao/subjects/${subject.id}/tests/${paperNum}/session?retake=true`}>
                              <Button
                                size="sm"
                                className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white shadow-soft"
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Ready to practice</span>
                        <Link to={`/exam/ao-aao/subjects/${subject.id}/tests/${paperNum}/session`}>
                          <Button
                            size="sm"
                            className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white shadow-soft"
                          >
                            Start Test <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Locked</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-semibold border-green-600/30 text-green-700 hover:bg-green-50"
                      onClick={() => {
                        toast.info("Please unlock the test series to access this paper.");
                        navigate("/exam/ao-aao/billing");
                      }}
                    >
                      <Lock className="h-3.5 w-3.5 mr-1" /> Unlock
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
