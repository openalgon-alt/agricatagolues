import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { aoAaoAdminService } from "@/services/aoAaoAdminService";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  FlaskConical,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  release: string;
  releaseISO: string;
  papers: number;
  isReleased: boolean;
}

const token = "access-granted-token-123456";

export default function ControlCenter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "released" | "coming_soon">("all");

  useEffect(() => {
    void loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    try {
      const result = await aoAaoAdminService.listSubjects(token);
      setSubjects(
        (result.subjects || []).filter(
          (s: { name: string }) => s.name !== "__free_test__" && s.name !== "Free Mock Test",
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRelease(subjectId: string, currentReleased: boolean) {
    const nextReleased = !currentReleased;
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, isReleased: nextReleased } : s)),
    );

    try {
      const result = await aoAaoAdminService.setSubjectRelease(token, subjectId, nextReleased);
      if (result.ok) {
        toast.success(
          nextReleased ? "Subject status set to Released" : "Subject status set to Coming Soon",
        );
      }
    } catch (error) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === subjectId ? { ...s, isReleased: currentReleased } : s)),
      );
      toast.error(error instanceof Error ? error.message : "Failed to update release state");
    }
  }

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "released" && s.isReleased) ||
        (statusFilter === "coming_soon" && !s.isReleased);
      return matchesSearch && matchesStatus;
    });
  }, [subjects, searchQuery, statusFilter]);

  const totalCount = subjects.length;
  const releasedCount = subjects.filter((s) => s.isReleased).length;
  const comingSoonCount = totalCount - releasedCount;

  return (
    <div className="space-y-8 pb-12 font-sans text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            AO/AAO Admin Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subject and paper availability across the landing page and dashboard.
          </p>
        </div>
        <Link
          to="/admin/ao-aao/free-test"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors shadow-soft shrink-0"
        >
          <FlaskConical className="h-4 w-4" />
          Manage Free Test
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Subjects</span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              {loading ? "..." : totalCount}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Released/Live</span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-green-600">
              {loading ? "..." : releasedCount}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-amber-600">
              {loading ? "..." : comingSoonCount}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg border text-sm w-full sm:w-auto">
          {(
            [
              ["all", "All"],
              ["released", "Released"],
              ["coming_soon", "Coming Soon"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={
                "flex-1 sm:flex-initial px-4 py-1.5 rounded-md font-medium transition-all " +
                (statusFilter === key
                  ? "bg-white text-gray-900 shadow-soft"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      {loading && subjects.length === 0 ? (
        <div className="text-center py-12 border rounded-2xl bg-white">
          <p className="text-muted-foreground text-sm">Loading subjects...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12 border rounded-2xl bg-white">
          <p className="text-muted-foreground text-sm">No subjects match your criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="group rounded-2xl border bg-white p-5 shadow-soft hover:shadow-elegant transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span
                    className={
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                      (subject.isReleased
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800")
                    }
                  >
                    {subject.isReleased ? "Released" : "Coming Soon"}
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-base leading-tight group-hover:text-green-700 transition-colors text-gray-900">
                  {subject.name}
                </h3>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target: {subject.release}</span>
                  </div>
                  <div>
                    <span>{subject.papers} papers</span>
                  </div>
                </div>
              </div>

              {/* Action Toggle & Manage Papers */}
              <div className="mt-6 pt-4 border-t flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {subject.isReleased ? "Released" : "Coming Soon"}
                  </span>
                  <Switch
                    checked={subject.isReleased}
                    onCheckedChange={() =>
                      void handleToggleRelease(subject.id, subject.isReleased)
                    }
                    aria-label={`Toggle release for ${subject.name}`}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium border-green-600/20 text-green-700 hover:bg-green-50 cursor-pointer mt-1 bg-white"
                  onClick={() => {
                    navigate(`/admin/ao-aao/papers?subjectId=${subject.id}`);
                  }}
                >
                  Manage Papers
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
