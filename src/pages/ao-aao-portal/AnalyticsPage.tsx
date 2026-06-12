import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { loadAttempts, type TestAttempt } from "@/lib/attempts";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    setAttempts(loadAttempts());
  }, []);

  // Compute analytics metrics
  const stats = useMemo(() => {
    if (attempts.length === 0) return null;

    let totalScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;
    let totalQuestions = 0;
    let totalTime = 0;

    const subjectMetrics: Record<string, { totalPct: number; count: number }> = {};

    attempts.forEach((a) => {
      const pct = a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0;
      totalScore += pct;
      totalCorrect += a.correctAnswers;
      totalIncorrect += a.incorrectAnswers;
      totalUnattempted += a.unattempted;
      totalQuestions += a.totalQuestions;
      totalTime += a.timeSpentSeconds;

      if (!subjectMetrics[a.subjectName]) {
        subjectMetrics[a.subjectName] = { totalPct: 0, count: 0 };
      }
      subjectMetrics[a.subjectName].totalPct += pct;
      subjectMetrics[a.subjectName].count += 1;
    });

    const averageScore = Math.round((totalScore / attempts.length) * 10) / 10;
    const answered = totalCorrect + totalIncorrect;
    const averageAccuracy = answered > 0 ? Math.round((totalCorrect / answered) * 100) : 0;

    let bestSubject = "—";
    let maxAvg = -Infinity;
    Object.entries(subjectMetrics).forEach(([name, val]) => {
      const avg = val.totalPct / val.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        bestSubject = name;
      }
    });

    return {
      averageScore,
      averageAccuracy,
      bestSubject,
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
      averageTimeMins: Math.round(totalTime / attempts.length / 60),
    };
  }, [attempts]);

  // Chart 1: Progress Trend Chart
  const trendChartData = useMemo(() => {
    return attempts.map((a, idx) => {
      const scorePct = a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0;
      const accuracy =
        a.correctAnswers + a.incorrectAnswers > 0
          ? Math.round((a.correctAnswers / (a.correctAnswers + a.incorrectAnswers)) * 100)
          : 0;

      return {
        name: `Test ${idx + 1}`,
        score: scorePct,
        accuracy: accuracy,
      };
    });
  }, [attempts]);

  // Chart 2: Subject Performance Bar Chart
  const subjectChartData = useMemo(() => {
    const subjectMetrics: Record<string, { totalPct: number; count: number }> = {};
    attempts.forEach((a) => {
      const pct = a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0;
      if (!subjectMetrics[a.subjectName]) {
        subjectMetrics[a.subjectName] = { totalPct: 0, count: 0 };
      }
      subjectMetrics[a.subjectName].totalPct += pct;
      subjectMetrics[a.subjectName].count += 1;
    });

    return Object.entries(subjectMetrics).map(([name, val]) => ({
      name: name,
      score: Math.round((val.totalPct / val.count) * 10) / 10,
    }));
  }, [attempts]);

  // Chart 3: Question Distribution Pie Chart
  const pieChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Correct", value: stats.totalCorrect, color: "#16a34a" },
      { name: "Incorrect", value: stats.totalIncorrect, color: "#dc2626" },
      { name: "Unattempted", value: stats.totalUnattempted, color: "#4b5563" },
    ];
  }, [stats]);

  if (attempts.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl font-sans text-left">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual reports of your strengths, time allocation, and accuracy.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-12 text-center shadow-soft max-w-2xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <BarChart3 className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="mt-4 font-bold text-base text-gray-900">Analytics not ready yet</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Complete a few mock tests to generate analytics charts showing accuracy curves,
            subject-wise strengths, and speed metrics.
          </p>
          <Button
            asChild
            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 rounded-xl shadow-soft"
          >
            <Link to="/exam/ao-aao/subjects">Take a Mock Test</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl font-sans text-left">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your score progression, accuracy ratios, and master subject analytics.
        </p>
      </div>

      {/* Summary KPI stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold">Avg Score %</span>
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              {stats.averageScore}%
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold">Avg Accuracy</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              {stats.averageAccuracy}%
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold">Best Subject</span>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 font-semibold text-sm truncate text-gray-900">
              {stats.bestSubject}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold">Avg Test Duration</span>
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              {stats.averageTimeMins} min
            </p>
          </div>
        </div>
      )}

      {/* Analytics Charts Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress Trend Graph */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h3 className="font-bold text-sm sm:text-base text-gray-900">Score & Accuracy Trend</h3>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="accuracyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#888888" tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Area
                  name="Score %"
                  type="monotone"
                  dataKey="score"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreColor)"
                />
                <Area
                  name="Accuracy %"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#accuracyColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question Distribution Pie Graph */}
        <div className="rounded-2xl border bg-white p-5 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-green-600" />
            <h3 className="font-bold text-sm sm:text-base text-gray-900">Question Breakdown</h3>
          </div>
          <div className="h-56 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-center mt-2">
            {pieChartData.map((d) => (
              <div key={d.name} className="p-1 rounded bg-gray-50 border">
                <span className="block text-gray-500">{d.name}</span>
                <span className="text-xs font-bold mt-0.5 block" style={{ color: d.color }}>
                  {d.value} MCQs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Comparison Bar Graph */}
      <div className="rounded-2xl border bg-white p-5 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-sm sm:text-base text-gray-900">Average Score by Subject</h3>
        </div>
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectChartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="#888888"
                tickLine={false}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis domain={[0, 100]} stroke="#888888" tickLine={false} />
              <Tooltip formatter={(value) => [`${value}%`, "Avg Score"]} />
              <Bar
                name="Average Score %"
                dataKey="score"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              >
                {subjectChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} opacity={0.85 + (index % 2) * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
