import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aoAaoService } from "@/services/aoAaoService";
import { subjectStatus, type Subject } from "@/lib/subjects";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const now = new Date();
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
      .then((result) => {
        setSubjects(
          (result.subjects || []).filter(
            (s: { name: string }) => s.name !== "__free_test__" && s.name !== "Free Mock Test",
          ),
        );
      })
      .catch((err) => {
        console.error("Failed to load dashboard subjects:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const [isUnlocked, setIsUnlocked] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsUnlocked(localStorage.getItem("agri_unlocked") === "true");
    }
  }, []);

  const available = subjects.filter(
    (s) =>
      s.name !== "__free_test__" &&
      s.name !== "Free Mock Test" &&
      subjectStatus(s, now) === "Available",
  );
  const upcoming = subjects
    .filter(
      (s) =>
        s.name !== "__free_test__" &&
        s.name !== "Free Mock Test" &&
        subjectStatus(s, now) === "Coming Soon",
    )
    .slice(0, 4);

  const cards = [
    { label: "Total Subjects", value: "20", icon: BookOpen, tone: "primary" },
    { label: "Total Papers", value: "150+", icon: ClipboardList, tone: "success" },
  ];

  return (
    <div className="grid lg:grid-cols-4 min-h-[calc(100vh-6rem)] font-sans text-left gap-6">
      {/* Main Content Column (Left Side) */}
      <div className="lg:col-span-3 space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Welcome back 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's an overview of your AO/AAO 2026 preparation.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border bg-card p-4 sm:p-5 shadow-soft bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                <span
                  className={
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg " +
                    (c.tone === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-green-50 text-green-600")
                  }
                >
                  <c.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Promo / Access Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Free Test Card */}
          <div className="rounded-2xl border bg-card p-5 shadow-soft flex flex-col justify-between hover:shadow-elegant transition bg-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-green-500/5 opacity-40 blur-xl" />
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Free Test
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 text-sm">Attempt Free Test</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Try a free mock test to experience our exam pattern before unlocking the full
                series.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-center">
              <Link
                to="/exam/ao-aao/free-test"
                className="inline-flex items-center justify-center w-3/4 text-xs font-semibold px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-soft transition-opacity"
              >
                Take Free Test <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Unlock Card */}
          {isUnlocked ? (
            <div className="rounded-2xl border bg-card p-5 shadow-soft flex flex-col justify-between border-green-500/30 hover:shadow-elegant transition bg-white">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Active Plan
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 text-sm">Full Access Unlocked</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  You have complete premium access to all 20 subjects, 140+ mock tests, and full
                  performance analytics.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-center">
                <Link
                  to="/exam/ao-aao/subjects"
                  className="inline-flex items-center justify-center w-3/4 text-xs font-semibold px-4 py-2 rounded-xl border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  Browse Subjects <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-5 shadow-soft flex flex-col justify-between border-green-500/30 hover:shadow-elegant transition bg-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-green-500/10 opacity-10 blur-xl" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Lock className="h-5 w-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Locked
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 text-sm">
                  Unlock Complete Series
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Get instant access to all 20 subjects, 140+ mock tests (14,000+ MCQs), expert
                  solutions, and ranking analytics.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-center">
                <Link
                  to="/exam/ao-aao/billing"
                  className="inline-flex items-center justify-center w-3/4 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-elegant transition-opacity"
                >
                  Unlock now <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Progress section */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Paper releases</h3>
            <span className="text-xs text-muted-foreground">
              {loading ? "..." : `${available.length} of 20 subjects live`}
            </span>
          </div>
          <Progress
            value={available.length > 0 ? (available.length / 20) * 100 : 0}
            className="mt-4 h-2 bg-gray-100"
          />
          <div className="mt-6 grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <Stat label="Subjects live" value={loading ? "..." : available.length} />
            <Stat
              label="Papers unlocked"
              value={loading ? "..." : available.reduce((a, s) => a + s.papers, 0)}
            />
          </div>
        </div>
      </div>

      {/* Sidebar Column (Right Side - starts directly under navbar) */}
      <div className="lg:col-span-1 p-4 sm:p-6 bg-gray-50/50 border rounded-2xl flex flex-col">
        <div className="flex items-center justify-between border-b pb-3.5 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Upcoming releases</h3>
          <Link to="/exam/ao-aao/subjects" className="text-xs text-green-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {upcoming.map((s) => (
            <CountdownCard key={s.name} name={s.name} iso={s.releaseISO} />
          ))}
          {upcoming.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl bg-white">
              No upcoming releases.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-bold mt-1 text-gray-900">{value}</p>
    </div>
  );
}

function CountdownCard({ name, iso }: { name: string; iso: string }) {
  const target = new Date(iso).getTime();
  const diff = Math.max(0, target - Date.now());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <div className="rounded-xl border bg-white p-4 shadow-soft hover:shadow-elegant transition text-left">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        Releases {new Date(iso).toLocaleDateString("en-GB")}
      </div>
      <p className="mt-2 font-semibold text-sm leading-tight text-gray-900">{name}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-2xl font-extrabold text-green-600">{days}</span>
        <span className="text-xs text-muted-foreground">days to go</span>
      </div>
    </div>
  );
}
