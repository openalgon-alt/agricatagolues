import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aoAaoService, AoAaoSubject } from "@/services/aoAaoService";
import { subjectStatus } from "@/lib/subjects";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Calendar, Lock, ArrowLeft } from "lucide-react";

export default function SubjectsPage() {
  const now = new Date();
  const [subjects, setSubjects] = useState<AoAaoSubject[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    aoAaoService.listSubjects()
      .then((result) =>
        setSubjects(
          (result.subjects || []).filter(
            (s: { name: string }) => s.name !== "__free_test__" && s.name !== "Free Mock Test"
          )
        )
      )
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 flex-col gap-3">
        <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full"></div>
        <p className="text-gray-500 text-xs">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">All Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            20 subjects · 140+ papers · 14,000+ questions
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="sm:self-center self-start shrink-0">
          <Link to="/exam/ao-aao/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s, i) => {
          const status = subjectStatus(s, now);
          const available = status === "Available";
          return (
            <div
              key={s.name}
              className="group rounded-2xl border bg-card p-5 shadow-soft hover:shadow-elegant transition bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <StatusBadge available={available} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground font-medium">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-semibold leading-tight text-gray-900">{s.name}</h3>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {s.release}
                </span>
                {available && (
                  <>
                    <span>·</span>
                    <span>{s.papers} papers</span>
                  </>
                )}
              </div>
              
              {available ? (
                <Link to={`/exam/ao-aao/subjects/${s.id}/tests`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    View papers
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full border-gray-200 text-gray-400 font-semibold"
                  disabled
                >
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-3.5 w-3.5" /> Coming soon
                  </span>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ available }: { available: boolean }) {
  return available ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1">
      <CheckCircle2 className="h-3 w-3" /> Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1">
      Coming Soon
    </span>
  );
}
