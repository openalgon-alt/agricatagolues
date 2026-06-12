import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aoAaoAdminService } from "@/services/aoAaoAdminService";
import { aoAaoService } from "@/services/aoAaoService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  Unlock,
  Smartphone,
  Trash2,
  Clock,
  Settings,
  ArrowLeft,
} from "lucide-react";

interface AdminUser {
  id: string;
  phone: string;
  fullName: string;
  gmail: string;
  category: string;
  university: string;
  isAdmin: boolean;
  createdAt: string;
}

type SortField = "fullName" | "phone" | "category" | "university" | "createdAt";
type SortDir = "asc" | "desc";

const token = "access-granted-token-123456";

export default function AccessPage() {
  // ── Users Data State ───────────────────────────────────────────────────────
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Payment Settings State ────────────────────────────────────────────────
  const [upiId, setUpiId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Track loading status of individual user actions
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deviceLoadingId, setDeviceLoadingId] = useState<string | null>(null);

  // Fetch users and settings on load
  useEffect(() => {
    void loadUsers();
    void loadPaymentSettings();
  }, []);

  async function loadPaymentSettings() {
    try {
      const res = await aoAaoService.getPaymentSettings();
      setUpiId(res.upiId || "");
      setQrCode(res.qrCode || "");
    } catch (err) {
      console.error("Failed to load payment settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setQrCode(event.target.result as string);
        toast.success("QR Code loaded. Click Save Settings to update.");
      }
    };
    reader.readAsDataURL(file);
  };

  async function handleSaveSettings() {
    if (!upiId.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
    setSavingSettings(true);
    try {
      const res = await aoAaoAdminService.savePaymentSettings(token, upiId.trim(), qrCode);
      if (res.ok) {
        toast.success("Payment settings updated successfully!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update payment settings");
    } finally {
      setSavingSettings(false);
    }
  }

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const result = await aoAaoAdminService.listUsers(token);
      setUsers(result.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleToggleUserUnlock(userId: string, currentUnlocked: boolean, isRejectingUtr = false) {
    setActionLoadingId(userId);

    const targetUnlocked = !currentUnlocked;

    // Optimistic state update in UI
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        let originalCategory = u.category;
        if (u.category.startsWith("PENDING_UTR:")) {
          const parts = u.category.split("|");
          originalCategory = parts.slice(1).join("|") || parts[0].replace(/^PENDING_UTR:[^|]*/, "");
        }
        const cleanCat = originalCategory.replace("_UNLOCKED", "");
        const finalCategory = (targetUnlocked && !isRejectingUtr) ? `${cleanCat}_UNLOCKED` : cleanCat;
        return {
          ...u,
          category: finalCategory,
        };
      }),
    );

    try {
      await aoAaoAdminService.toggleUserUnlock(token, userId, targetUnlocked && !isRejectingUtr);
      toast.success(
        (targetUnlocked && !isRejectingUtr)
          ? "Mock tests successfully unlocked for this user!"
          : isRejectingUtr 
            ? "Payment request rejected. User plan set to locked."
            : "Mock tests locked for this user.",
      );
      void loadUsers();
    } catch (err) {
      void loadUsers();
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleClearDeviceLock(userId: string) {
    setDeviceLoadingId(userId);

    try {
      await aoAaoAdminService.clearUserDevice(token, userId);

      // Update local state to remove device lock for the user
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const parts = (u.university || "").split("|");
          const cleanUni = parts[0] || "";
          return {
            ...u,
            university: cleanUni, // set to clean university, dropping lock info
          };
        }),
      );

      toast.success("Device lock cleared successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear device lock");
    } finally {
      setDeviceLoadingId(null);
    }
  }

  // Helper to parse device info from raw university field
  function parseDeviceInfo(rawUniversity: string) {
    const parts = (rawUniversity || "").split("|");
    const cleanUniversity = parts[0] || "";
    const deviceId = parts[1] && parts[1].startsWith("DEV:") ? parts[1].replace("DEV:", "") : "";
    const deviceModel = parts[2] || "";
    return { cleanUniversity, deviceId, deviceModel };
  }

  // ── Users filtering & sorting ──────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    const filtered = users.filter((u) => {
      const isPending = u.category.startsWith("PENDING_UTR:");
      let displayCategory = u.category;
      let utr = "";
      if (isPending) {
        const parts = u.category.split("|");
        utr = parts[0].replace("PENDING_UTR:", "");
        displayCategory = parts.slice(1).join("|") || parts[0].replace(/^PENDING_UTR:[^|]*/, "");
      }
      const isUnlocked = !isPending && displayCategory.endsWith("_UNLOCKED");
      const cleanCategory = displayCategory.replace("_UNLOCKED", "");
      const { cleanUniversity, deviceModel } = parseDeviceInfo(u.university);

      const matchesText =
        (u.fullName || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q) ||
        (u.gmail || "").toLowerCase().includes(q) ||
        cleanCategory.toLowerCase().includes(q) ||
        cleanUniversity.toLowerCase().includes(q) ||
        deviceModel.toLowerCase().includes(q) ||
        utr.includes(q);

      const matchesStatus =
        q === "unlocked" ? isUnlocked :
        q === "locked" ? (!isUnlocked && !isPending) :
        q === "pending" ? isPending : true;

      return matchesText || matchesStatus;
    });

    filtered.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [users, userSearch, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1 text-green-700" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1 text-green-700" />
    );
  }

  function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const activeFilter = userSearch.toLowerCase().trim();

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
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">Registered Users</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {usersLoading ? "Loading…" : `${filteredUsers.length} of ${users.length} users`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer gap-1.5 bg-white border-green-600/20 text-green-700 hover:bg-green-50"
              >
                <Settings className="h-3.5 w-3.5" />
                Payment Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-white border text-gray-900">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="font-display text-lg font-bold tracking-tight">Payment Settings</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">Configure the UPI payment info displayed to students.</p>
              </DialogHeader>

              {loadingSettings ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-green-700" />
                  <span className="text-xs text-muted-foreground ml-2">Loading payment settings...</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">UPI ID</label>
                      <Input
                        placeholder="e.g. upi-merchant@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload QR Code</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="cursor-pointer text-xs bg-white"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Accepts PNG, JPG, JPEG, SVG or WebP formats.</p>
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 h-9 rounded-xl shadow-soft cursor-pointer text-xs"
                    >
                      {savingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Save Settings
                    </Button>
                  </div>

                  {/* QR Preview Panel */}
                  <div className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50">
                    {qrCode ? (
                      <div className="space-y-2 text-center">
                        <p className="text-xs font-medium text-muted-foreground">Current QR Preview:</p>
                        <div className="bg-white p-3 rounded-lg inline-block border shadow-soft">
                          <img src={qrCode} alt="QR Code Preview" className="max-h-36 max-w-full object-contain" />
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQrCode("")}
                            className="text-red-600 text-xs hover:bg-red-50 cursor-pointer h-7"
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 text-muted-foreground">
                        <p className="text-xs font-medium">No QR Code uploaded</p>
                        <p className="text-[10px] text-muted-foreground">Upload a file on the left to show preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            className="text-xs shrink-0 cursor-pointer bg-white"
            onClick={() => void loadUsers()}
            disabled={usersLoading}
          >
            {usersLoading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* User Stats (Interactive Tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setUserSearch("")}
          className={`rounded-2xl border p-5 shadow-soft flex items-center justify-between transition cursor-pointer hover:border-green-600/50 hover:shadow-elegant ${
            activeFilter === "" ? "border-green-600 bg-green-50/30 ring-1 ring-green-600/20" : "bg-white"
          }`}
          title="Show all users"
        >
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Users</span>
            <p className="mt-2 font-display text-2xl font-extrabold text-gray-900">
              {usersLoading ? "..." : users.length}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>
        <div
          onClick={() => setUserSearch("unlocked")}
          className={`rounded-2xl border p-5 shadow-soft flex items-center justify-between transition cursor-pointer hover:border-green-600/50 hover:shadow-elegant ${
            activeFilter === "unlocked" ? "border-green-600 bg-green-50/30 ring-1 ring-green-600/20" : "bg-white"
          }`}
          title="Filter by unlocked plan status"
        >
          <div>
            <span className="text-xs font-medium text-muted-foreground">Unlocked Users</span>
            <p className="mt-2 font-display text-2xl font-extrabold text-green-700">
              {usersLoading
                ? "..."
                : users.filter((u) => u.category.endsWith("_UNLOCKED") && !u.category.startsWith("PENDING_UTR:")).length}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <Unlock className="h-5 w-5" />
          </div>
        </div>
        <div
          onClick={() => setUserSearch("pending")}
          className={`rounded-2xl border p-5 shadow-soft flex items-center justify-between transition cursor-pointer hover:border-amber-500/50 hover:shadow-elegant ${
            activeFilter === "pending" ? "border-amber-500 bg-amber-50/30 ring-1 ring-amber-500/20" : "bg-white"
          }`}
          title="Filter by pending UTR approval requests"
        >
          <div>
            <span className="text-xs font-medium text-muted-foreground">Pending Requests</span>
            <p className="mt-2 font-display text-2xl font-extrabold text-amber-700">
              {usersLoading
                ? "..."
                : users.filter((u) => u.category.startsWith("PENDING_UTR:")).length}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div
          onClick={() => setUserSearch("locked")}
          className={`rounded-2xl border p-5 shadow-soft flex items-center justify-between transition cursor-pointer hover:border-gray-400/50 hover:shadow-elegant ${
            activeFilter === "locked" ? "border-gray-400 bg-gray-50 ring-1 ring-gray-400/20" : "bg-white"
          }`}
          title="Filter by locked plan status"
        >
          <div>
            <span className="text-xs font-medium text-muted-foreground">Locked Users</span>
            <p className="mt-2 font-display text-2xl font-extrabold text-gray-500">
              {usersLoading
                ? "..."
                : users.filter((u) => !u.category.endsWith("_UNLOCKED") && !u.category.startsWith("PENDING_UTR:")).length}
            </p>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            <Lock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search (type 'pending', 'unlocked', 'locked' or search text)..."
          className="pl-9 bg-white"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      {usersLoading ? (
        <div className="text-center py-16 border rounded-2xl bg-white animate-pulse">
          <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading users…</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-white">
          <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No users found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-8">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    <button
                      className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => toggleSort("fullName")}
                    >
                      <UserIcon className="h-3 w-3 mr-1.5 text-green-700" />
                      Name
                      <SortIcon field="fullName" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    <button
                      className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => toggleSort("phone")}
                    >
                      <Phone className="h-3 w-3 mr-1.5 text-green-700" />
                      Phone
                      <SortIcon field="phone" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                    <span className="inline-flex items-center">
                      <Mail className="h-3 w-3 mr-1.5 text-green-700" />
                      Email
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                    <button
                      className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => toggleSort("category")}
                    >
                      <GraduationCap className="h-3 w-3 mr-1.5 text-green-700" />
                      Category
                      <SortIcon field="category" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                    <button
                      className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => toggleSort("university")}
                    >
                      <Building2 className="h-3 w-3 mr-1.5 text-green-700" />
                      University
                      <SortIcon field="university" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    <button
                      className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => toggleSort("createdAt")}
                    >
                      Joined
                      <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Device Locked
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground w-36">
                    Papers Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const isPending = user.category.startsWith("PENDING_UTR:");
                  let utr = "";
                  let displayCategory = user.category;
                  if (isPending) {
                    const parts = user.category.split("|");
                    utr = parts[0].replace("PENDING_UTR:", "");
                    displayCategory = parts.slice(1).join("|") || parts[0].replace(/^PENDING_UTR:[^|]*/, "");
                  }
                  const isUnlocked = !isPending && displayCategory.endsWith("_UNLOCKED");
                  const cleanCategory = displayCategory.replace("_UNLOCKED", "");
                  const { cleanUniversity, deviceId, deviceModel } = parseDeviceInfo(
                    user.university,
                  );
                  const isBusy = actionLoadingId === user.id;
                  const isDeviceBusy = deviceLoadingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-700 text-xs font-bold shrink-0">
                            {(user.fullName || "?")[0].toUpperCase()}
                          </span>
                          <span className="font-medium text-sm leading-tight text-gray-950">
                            {user.fullName || <em className="text-muted-foreground">—</em>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                        {user.gmail || "—"}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground border">
                          {cleanCategory || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell max-w-[160px] truncate">
                        {cleanUniversity || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-green-150">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 border">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 max-w-[180px]">
                          {deviceId ? (
                            <>
                              <Smartphone className="h-3.5 w-3.5 text-green-700 shrink-0" />
                              <span
                                className="text-xs text-gray-950 truncate font-medium"
                                title={deviceModel}
                              >
                                {deviceModel || "Locked Device"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isDeviceBusy}
                                onClick={() => void handleClearDeviceLock(user.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0 cursor-pointer ml-auto"
                                title="Clear Device Lock"
                              >
                                {isDeviceBusy ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No lock</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {isPending ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200">
                                <Clock className="h-3 w-3" /> Pending Review
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                UTR: <strong className="text-gray-900 select-all">{utr}</strong>
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Button
                                  size="sm"
                                  onClick={() => void handleToggleUserUnlock(user.id, false)}
                                  disabled={isBusy}
                                  className="h-6 text-[9px] font-bold px-2 rounded-md bg-green-700 hover:bg-green-800 text-white shadow-soft cursor-pointer border-0"
                                >
                                  {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void handleToggleUserUnlock(user.id, true, true)}
                                  disabled={isBusy}
                                  className="h-6 text-[9px] font-bold px-2 rounded-md border-red-200 text-red-600 hover:bg-red-50 cursor-pointer bg-white"
                                >
                                  {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {isUnlocked ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-green-150">
                                  <Unlock className="h-3 w-3" /> Unlocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-750 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200">
                                  <Lock className="h-3 w-3" /> Locked
                                </span>
                              )}

                              <Button
                                size="sm"
                                variant={isUnlocked ? "outline" : "default"}
                                onClick={() => void handleToggleUserUnlock(user.id, isUnlocked)}
                                disabled={isBusy}
                                className={
                                  "h-7 text-[10px] font-bold px-2.5 rounded-lg shrink-0 cursor-pointer " +
                                  (isUnlocked
                                    ? "border-red-200 text-red-600 hover:bg-red-50 bg-white"
                                    : "bg-green-700 hover:bg-green-800 text-white shadow-soft border-0")
                                }
                              >
                                {isBusy ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : isUnlocked ? (
                                  "Lock"
                                ) : (
                                  "Unlock"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
