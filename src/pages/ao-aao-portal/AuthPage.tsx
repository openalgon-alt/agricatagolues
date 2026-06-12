import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import mainLogo from "@/assets/main-logo.png";
import { aoAaoService } from "@/services/aoAaoService";

const SESSION_KEY = "agri_session";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/exam/ao-aao/dashboard";

  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [category, setCategory] = useState("");
  const [university, setUniversity] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState<"phone" | "login" | "create">("phone");

  useEffect(() => {
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        if (session?.token) {
          navigate(redirectPath, { replace: true });
        }
      } catch {
        // Ignored
      }
    }
  }, [navigate, redirectPath]);

  function normalizePhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (value.trim().startsWith("+91") && digits.length === 12) return `+${digits}`;
    return value.trim();
  }

  function isValidIndianPhone(value: string) {
    return /^\+91[6-9]\d{9}$/.test(normalizePhone(value));
  }

  function getHardwareFingerprint(): string {
    if (typeof window === "undefined") return "";

    const screenInfo = window.screen
      ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
      : "";
    const cores = navigator.hardwareConcurrency || 0;
    const memory = (navigator as any).deviceMemory || 0;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    const ua = navigator.userAgent.toLowerCase();
    let os = "Unknown OS";
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
    else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("linux")) os = "Linux";

    let gpu = "";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
        }
      }
    } catch (e) {
      gpu = "gpu-disabled";
    }

    const cleanGpu = gpu
      .replace(/ANGLE \(([^,)]+),/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    let canvasHash = "";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Agricatalogues, Mock!", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Agricatalogues, Mock!", 4, 17);

        const dataUrl = canvas.toDataURL();
        let hash = 0;
        for (let i = 0; i < dataUrl.length; i++) {
          hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
          hash |= 0;
        }
        canvasHash = Math.abs(hash).toString(16);
      }
    } catch (e) {
      canvasHash = "canvas-disabled";
    }

    const rawFingerprint = `${os}-${screenInfo}-${cores}-${memory}-${tz}-${cleanGpu}-${canvasHash}`;

    let hash = 0;
    for (let i = 0; i < rawFingerprint.length; i++) {
      hash = (hash << 5) - hash + rawFingerprint.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  function getHardwareModelName(): string {
    if (typeof window === "undefined") return "Server";
    const ua = navigator.userAgent.toLowerCase();
    let os = "Windows PC";
    if (ua.includes("windows")) os = "Windows PC";
    else if (ua.includes("macintosh") || ua.includes("mac os")) os = "Mac Book";
    else if (ua.includes("iphone")) os = "iPhone";
    else if (ua.includes("ipad")) os = "iPad";
    else if (ua.includes("android")) os = "Android Device";
    else if (ua.includes("linux")) os = "Linux PC";

    const cores = navigator.hardwareConcurrency || "";
    const coresStr = cores ? ` (${cores} Cores)` : "";
    const screen = window.screen ? ` ${window.screen.width}x${window.screen.height}` : "";

    let gpu = "";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const rawGpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
          gpu = rawGpu
            .replace(/^ANGLE \([^,]+,\s*/, "")
            .replace(/\sDirect3D.*$/, "")
            .replace(/\s\(0x.*$/, "")
            .trim();
        }
      }
    } catch (e) {}

    const gpuStr = gpu ? ` [${gpu}]` : "";

    return `${os}${coresStr}${screen}${gpuStr}`;
  }

  async function handlePhoneLookup(e: React.FormEvent) {
    e.preventDefault();
    const cleanedPhone = normalizePhone(phone);
    if (!isValidIndianPhone(cleanedPhone)) {
      toast.error("Enter a valid mobile number");
      return;
    }

    setLoading(true);
    try {
      const { exists, phone: normalizedPhone } = await aoAaoService.checkPhone(cleanedPhone);
      setPhone(normalizedPhone);
      if (exists) {
        setStep("login");
        toast.success("Account found. Enter your password to continue.");
        return;
      }

      setStep("create");
      toast.error("No account found. Create a new one to continue.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to look up phone number");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const cleanedPhone = normalizePhone(phone);

    if (!cleanedPhone || !password) {
      toast.error("Enter your phone number and password");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await aoAaoService.login({
        phone: cleanedPhone,
        password,
        deviceId: getHardwareFingerprint(),
        deviceModel: getHardwareModelName(),
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
      toast.success("Signed in successfully.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    const cleanedPhone = normalizePhone(phone);

    if (!isValidIndianPhone(cleanedPhone)) {
      toast.error("Enter a valid Indian mobile number");
      return;
    }

    if (!name.trim() || !gmail.trim() || !category.trim() || !university.trim() || !password) {
      toast.error("Fill all account details");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      toast.error("You must agree to the content protection terms before creating an account.");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await aoAaoService.register({
        phone: cleanedPhone,
        fullName: name.trim(),
        gmail: gmail.trim(),
        category: category.trim(),
        university: university.trim(),
        password,
        deviceId: getHardwareFingerprint(),
        deviceModel: getHardwareModelName(),
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
      toast.success("Account created and signed in.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      let errorMessage = "Failed to create account";
      if (error instanceof Error) {
        try {
          // If the error message is a raw JSON array from Zod, parse it to extract a readable message
          const parsedError = JSON.parse(error.message);
          if (Array.isArray(parsedError) && parsedError[0]) {
            const err = parsedError[0];
            if (err.path?.includes("password") && err.code === "too_small") {
              errorMessage = "Password is too small (minimum 6 characters)";
            } else if (err.message) {
              errorMessage = err.message;
            } else {
              errorMessage = error.message;
            }
          } else {
            errorMessage = error.message;
          }
        } catch {
          // If it's not JSON, use the message directly
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans">
      {/* Brand side */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-green-700 to-green-950 text-white p-12 flex-col justify-between overflow-hidden">
        <Link to="/exam/ao-aao" className="relative flex items-center gap-2">
          <img src={mainLogo} alt="Agricatalogues Logo" className="h-10 w-auto object-contain" />
        </Link>
        <div className="relative space-y-6 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Your AO/AAO 2026 prep, in one focused workspace.
          </h1>
          <p className="text-green-100/90">
            20 subjects · 140+ papers · 14,000+ questions with detailed solutions and analytics.
          </p>
          <ul className="space-y-2 text-sm text-green-100/80">
            <li>✓ Real exam pattern</li>
            <li>✓ Subject-wise practice</li>
            <li>✓ Performance analytics</li>
            <li>✓ Full access to all features</li>
          </ul>
        </div>
        <p className="relative text-xs text-green-200/70">
          © 2026 Agricatalogues · Built for serious aspirants
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-6 flex items-center gap-2 justify-center">
            <img src={mainLogo} alt="Agricatalogues Logo" className="h-9 w-auto object-contain" />
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                {step === "create"
                  ? "Create your account"
                  : step === "login"
                    ? "Welcome back"
                    : "Continue with your phone number"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "create"
                  ? "We’ll set up your account details now."
                  : step === "login"
                    ? "Your account exists. Sign in with your password."
                    : "Enter your mobile number so we can check your account."}
              </p>
            </div>

            <form
              className="space-y-3"
              onSubmit={
                step === "phone"
                  ? handlePhoneLookup
                  : step === "login"
                    ? handleLogin
                    : handleCreateAccount
              }
            >
              <Field
                label="Phone number"
                type="tel"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  if (step !== "phone") setStep("phone");
                }}
                required
                hint="Use format: +91XXXXXXXXXX"
              />

              {step === "login" && (
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  required
                  hint="Enter your account password"
                />
              )}

              {step === "create" && (
                <>
                  <Field label="Name" value={name} onChange={setName} required />
                  <Field label="Gmail" type="email" value={gmail} onChange={setGmail} required />
                  <Field label="Category" value={category} onChange={setCategory} required />
                  <Field label="University" value={university} onChange={setUniversity} required />
                  <Field
                    label="Create password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                    hint="Use at least 6 characters"
                  />
                  <Field
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    required
                    hint="Re-enter the same password"
                  />

                  {/* ── Anti-leak agreement checkbox ── */}
                  <div
                    className="p-4 rounded-xl border border-yellow-300 bg-yellow-50/50 flex gap-3 items-start cursor-pointer"
                    onClick={() => setAgreedToTerms((v) => !v)}
                  >
                    <input
                      id="anti-leak-checkbox"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 accent-green-600 shrink-0 cursor-pointer"
                    />
                    <label
                      htmlFor="anti-leak-checkbox"
                      className="text-xs text-gray-700 leading-relaxed cursor-pointer select-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-bold text-yellow-700">
                        ⚠️ Content Protection Agreement
                      </span>
                      <br />
                      I agree not to screenshot, record, share, or leak any exam content. Watermarks are applied. Violations result in ban.
                    </label>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl mt-4"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
                {step === "phone" ? "Continue" : step === "login" ? "Sign in" : "Create account"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground mt-2"
                onClick={() => {
                  navigate("/exam/ao-aao");
                }}
                disabled={loading}
              >
                ← Back to Landing
              </Button>

              {step !== "phone" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setStep("phone");
                    setPassword("");
                  }}
                  disabled={loading}
                >
                  Change number
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <Label className="text-xs font-semibold text-gray-700">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-10 text-sm border-gray-300 focus:border-green-500"
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
