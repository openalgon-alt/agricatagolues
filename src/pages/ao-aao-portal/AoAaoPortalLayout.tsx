import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Shield } from "lucide-react";
import mainLogo from "@/assets/main-logo.png";
import { toast } from "sonner";
import { aoAaoService, AoAaoUser } from "@/services/aoAaoService";

export default function AoAaoPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [user, setUser] = useState<AoAaoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  // Full-screen watermark: triggered by Ctrl / screenshot attempts
  const [showFullWatermark, setShowFullWatermark] = useState(false);
  // Periodic 2-line watermark: only on test/results pages
  const [showPeriodicWatermark, setShowPeriodicWatermark] = useState(false);

  // Pages with question content — periodic watermark enabled here
  const isContentPage = ["/session", "/free-test", "/results"].some((p) =>
    pathname.includes(p)
  );

  // Read session and verify on load/navigation
  useEffect(() => {
    const sessionRaw = localStorage.getItem("agri_session");
    if (!sessionRaw) {
      navigate("/exam/ao-aao/auth", { replace: true });
      return;
    }
    
    let token = "";
    try {
      token = JSON.parse(sessionRaw).token || "";
    } catch {
      // Ignored
    }

    if (!token) {
      navigate("/exam/ao-aao/auth", { replace: true });
      return;
    }

    setLoading(true);
    aoAaoService.getSession(token)
      .then(({ user }) => {
        if (!user) {
          localStorage.removeItem("agri_session");
          navigate("/exam/ao-aao/auth", { replace: true });
          return;
        }
        setUser(user);
        const dbUnlocked = (user.category || "").trim().endsWith("_UNLOCKED");
        localStorage.setItem("agri_unlocked", dbUnlocked ? "true" : "false");
      })
      .catch(() => {
        localStorage.removeItem("agri_session");
        navigate("/exam/ao-aao/auth", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname, navigate]);

  // ── Content Protection ───────────────────────────────────────────────────
  useEffect(() => {
    // 1. Block right-click context menu
    const blockContext = (e: MouseEvent) => e.preventDefault();

    // 2. Block copy / cut
    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
    };

    // 3. Block dangerous keyboard shortcuts + show FULL watermark on suspicious keys
    let fullWmTimer: NodeJS.Timeout | null = null;
    const showFull = () => {
      setShowFullWatermark(true);
      if (fullWmTimer) clearTimeout(fullWmTimer);
      // Keep full watermark visible for 3s then fade out
      fullWmTimer = setTimeout(() => setShowFullWatermark(false), 3000);
    };

    const blockKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      // Show full watermark on any Ctrl/Meta or PrintScreen press
      if (ctrl || e.key === "PrintScreen") showFull();
      if (e.key === "PrintScreen") { e.preventDefault(); return; }
      if (ctrl && e.key === "p") { e.preventDefault(); return; }
      if (ctrl && e.key === "s") { e.preventDefault(); return; }
      if (ctrl && e.key === "u") { e.preventDefault(); return; }
      if (e.key === "F12") { e.preventDefault(); return; }
      if (ctrl && shift && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
    };

    // 4. Blur content when window/tab loses focus (prevents screenshotting via alt-tab, etc.)
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibility = () => {
      if (document.hidden) setIsBlurred(true);
      else setIsBlurred(false);
    };

    // 5. Block browser Screen Capture API and show full watermark
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getDisplayMedia = async () => {
        setIsBlurred(true);
        showFull();
        setTimeout(() => setIsBlurred(false), 3000);
        throw new DOMException(
          "Screen capture is disabled on this platform.",
          "NotAllowedError"
        );
      };
    }

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("keydown", blockKeys);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockKeys);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (fullWmTimer) clearTimeout(fullWmTimer);
    };
  }, []);

  // ── Periodic 2-line watermark on test/results pages ──────────────────────
  useEffect(() => {
    if (!isContentPage) {
      setShowPeriodicWatermark(false);
      return;
    }
    let periodicTimer: NodeJS.Timeout | null = null;
    const tick = () => {
      setShowPeriodicWatermark(true);
      periodicTimer = setTimeout(() => setShowPeriodicWatermark(false), 2000);
    };
    const interval = setInterval(tick, 10000);
    return () => {
      clearInterval(interval);
      if (periodicTimer) clearTimeout(periodicTimer);
      setShowPeriodicWatermark(false);
    };
  }, [isContentPage]);

  async function signOut() {
    try {
      await aoAaoService.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem("agri_session");
    toast.success("Signed out");
    navigate("/exam/ao-aao/auth", { replace: true });
  }

  // Get initials for profile fallback
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.gmail
      ? user.gmail.slice(0, 2).toUpperCase()
      : "U";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-3">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        <p className="text-gray-500 text-sm font-medium">Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl shadow-elegant max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold">
              Sign out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              You'll need to sign in again to access your mock tests and progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void signOut()}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Top Navbar */}
      <header className="h-16 border-b bg-background/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Logo (Left Top) */}
          <Link to="/exam/ao-aao/dashboard" className="flex items-center gap-2">
            <img src={mainLogo} alt="Agricatalogues Logo" className="h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* Right Section - Profile Dropdown */}
        <div className="flex items-center gap-3">
          {user?.isAdmin && (
            <Link
              to="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Admin Panel"
            >
              <Shield className="h-5 w-5" />
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 overflow-hidden hover:bg-transparent"
              >
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold font-display">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mt-1.5 rounded-xl shadow-elegant border bg-card text-card-foreground"
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.gmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem asChild className="rounded-lg m-1 cursor-pointer">
                <Link to="/exam/ao-aao/profile" className="flex items-center gap-2 w-full">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                className="rounded-lg m-1 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="no-select flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* ── Full-screen watermark: shows on Ctrl / screenshot attempt ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: showFullWatermark ? 0.18 : 0,
          transition: showFullWatermark
            ? "opacity 0.15s ease-in"
            : "opacity 1.2s ease-out",
        }}
      >
        {/* Dense tiled grid covers every pixel */}
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                top: `${row * 14}%`,
                left: `${col * 24 - 5}%`,
                transform: "rotate(-20deg)",
                fontSize: "12px",
                fontWeight: 800,
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                color: "#111",
                userSelect: "none",
                letterSpacing: "0.08em",
              }}
            >
              {user?.fullName || ""} · {user?.phone || ""} · Agricatalogues
            </div>
          ))
        )}
      </div>

      {/* ── Periodic 2-line watermark: test/results pages only, every 10s ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: showPeriodicWatermark ? 0.15 : 0,
          transition: showPeriodicWatermark
            ? "opacity 0.2s ease-in"
            : "opacity 0.8s ease-out",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%) rotate(-6deg)",
            fontSize: "14px",
            fontWeight: 700,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            color: "#000",
            userSelect: "none",
            letterSpacing: "0.1em",
          }}
        >
          {user?.fullName || ""} · {user?.phone || ""} · Agricatalogues
        </div>
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: "translateX(-50%) rotate(-6deg)",
            fontSize: "14px",
            fontWeight: 700,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            color: "#000",
            userSelect: "none",
            letterSpacing: "0.1em",
          }}
        >
          {user?.fullName || ""} · {user?.phone || ""} · Agricatalogues
        </div>
      </div>

      {/* ── Blur shield: hides content when window loses focus ── */}
      {isBlurred && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "2rem" }}>🔒</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
            Content hidden for security
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", margin: 0 }}>
            Click to resume
          </p>
        </div>
      )}
    </div>
  );
}
