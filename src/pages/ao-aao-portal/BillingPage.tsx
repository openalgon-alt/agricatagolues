import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, Loader2, BookOpen, X, ArrowLeft, Copy, QrCode, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { aoAaoService } from "@/services/aoAaoService";
import { subjectStatus, type Subject } from "@/lib/subjects";

export default function BillingPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

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

  const [userProfile, setUserProfile] = useState<any>(null);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [upiId, setUpiId] = useState("");
  const [qrCode, setQrCode] = useState("");

  const [showUtrStep, setShowUtrStep] = useState(false);
  const [utr, setUtr] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(localStorage.getItem("agri_unlocked") === "true");
    }
  }, []);

  useEffect(() => {
    void loadUserProfileAndSettings();
  }, [token]);

  async function loadUserProfileAndSettings() {
    if (!token) return;
    setFetchingUser(true);
    try {
      const userRes = await aoAaoService.getSession(token);
      setUserProfile(userRes.user);
      if (userRes.user) {
        const isUnlockedDb = (userRes.user.category || "").trim().endsWith("_UNLOCKED");
        setUnlocked(isUnlockedDb);
        localStorage.setItem("agri_unlocked", isUnlockedDb ? "true" : "false");
      }

      const settingsRes = await aoAaoService.getPaymentSettings();
      setUpiId(settingsRes.upiId || "");
      setQrCode(settingsRes.qrCode || "");
    } catch (err) {
      console.error("Error loading user profile or settings:", err);
    } finally {
      setFetchingUser(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    setLoadingSubjects(true);
    void aoAaoService.listSubjects()
      .then((result) => {
        setSubjects(
          (result.subjects || []).filter(
            (s: { name: string }) => s.name !== "__free_test__" && s.name !== "Free Mock Test",
          ),
        );
      })
      .catch((err) => {
        console.error("Failed to load billing subjects:", err);
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
  }, [token]);

  const isPending = userProfile?.category?.startsWith("PENDING_UTR:");
  const pendingUtr = isPending ? userProfile.category.split("|")[0].replace("PENDING_UTR:", "") : "";

  const handleCopyUpi = () => {
    if (!upiId) return;
    void navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUtr(e.target.value.slice(0, 50));
  };

  const handleSubmitUtr = async () => {
    if (utr.trim().length < 3) {
      toast.error("Please enter your UTR / Transaction ID (at least 3 characters).");
      return;
    }
    if (!token) return;
    setSubmittingUtr(true);
    try {
      const res = await aoAaoService.submitUtr(utr.trim());
      if (res.ok) {
        toast.success("UTR submitted successfully! Payment is under review.");
        setUtrSubmitted(true);
        void loadUserProfileAndSettings();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit UTR");
    } finally {
      setSubmittingUtr(false);
    }
  };

  const handleOpenSubject = (subject: Subject) => {
    if (unlocked) {
      void navigate(`/exam/ao-aao/tests?subjectId=${subject.id}`);
    } else if (isPending) {
      toast.info(`Verification is already pending for UTR ${pendingUtr}. Access will be unlocked soon.`);
    } else {
      setSelectedSubject(subject);
      setShowUtrStep(false);
      setShowPaymentModal(true);
    }
  };

  const now = new Date();

  return (
    <div className="max-w-5xl space-y-6 sm:space-y-8 font-sans text-left">
      {/* Back Button */}
      <div className="flex justify-end">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-green-600/20 text-green-700 hover:bg-green-50 cursor-pointer rounded-xl h-8 px-3 font-semibold text-xs bg-white"
        >
          <Link to="/exam/ao-aao/dashboard">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
          </Link>
        </Button>
      </div>

      {/* Top Banner / Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/10 via-green-600/5 to-transparent border border-green-600/20 p-6 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <div className="space-y-1 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-green-700" /> Best Value Deal
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl mt-1.5 text-gray-900 leading-tight">
            less than 14rs per question paper
          </h2>
          <p className="text-xs text-muted-foreground">
            Get complete access to all 20 subjects, 140+ mock tests at an unbeatable price.
          </p>
        </div>
        {!unlocked && !isPending && (
          <Button
            onClick={() => {
              setShowUtrStep(false);
              setShowPaymentModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-elegant h-10 transition-opacity shrink-0 cursor-pointer text-xs"
          >
            Unlock Now for ₹2,000
          </Button>
        )}
      </div>

      {/* Pending Approval Card */}
      {isPending && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-white p-6 shadow-elegant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-500/10 opacity-30 blur-3xl" />
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 animate-pulse" /> Verification Pending
            </span>
            <h3 className="font-display font-extrabold text-lg text-gray-900 mt-1">
              Payment Under Review (UTR: {pendingUtr})
            </h3>
            <p className="text-xs text-muted-foreground">
              Your transaction number has been submitted. Admin will verify it and unlock your access shortly.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void loadUserProfileAndSettings()}
            className="border-amber-500/35 text-amber-700 font-semibold px-5 h-9 rounded-xl hover:bg-amber-50 transition shrink-0 cursor-pointer text-xs bg-white"
          >
            Check Status
          </Button>
        </div>
      )}

      {/* Active Premium Card (if unlocked) */}
      {unlocked && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-green-600 bg-white p-6 shadow-elegant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-green-100 opacity-30 blur-3xl" />
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" /> Full Access Active
            </span>
            <h3 className="font-display font-extrabold text-lg text-gray-900 mt-1">
              Premium Bundle Unlocked
            </h3>
            <p className="text-xs text-muted-foreground">
              You have active premium access to all papers and subject tests. Enjoy practicing!
            </p>
          </div>
          <Button
            onClick={() => navigate("/exam/ao-aao/dashboard")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 h-9 rounded-xl transition shrink-0 cursor-pointer text-xs"
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {/* Schedule Table / Grid */}
      <div className="bg-white border rounded-2xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">AO/AAO Mock Test Series Release Schedule</h3>
          <span className="text-xs text-muted-foreground font-medium">
            {subjects.length > 0 ? `${subjects.length} Subjects · 140+ Papers` : "Loading..."}
          </span>
        </div>

        {loadingSubjects ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-green-600" />
            <p className="text-xs text-muted-foreground">Loading subjects release schedule...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b bg-gray-50 text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Released Date</th>
                  <th className="px-6 py-3.5">Releasing Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {subjects.map((subj) => {
                  const status = subjectStatus(subj, now);
                  const isAvailable = status === "Available";

                  return (
                    <tr key={subj.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-700 shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-none">
                              {subj.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {isAvailable ? subj.release : "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground">
                        {!isAvailable ? subj.release : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider text-[9px] " +
                            (isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800")
                          }
                        >
                          {isAvailable ? "Released" : "Upcoming"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={unlocked ? "outline" : "default"}
                          onClick={() => handleOpenSubject(subj)}
                          className={
                            "h-8 rounded-lg text-xs font-semibold px-4 cursor-pointer transition-all bg-white " +
                            (unlocked
                              ? "border-green-600/30 text-green-700 hover:bg-green-50"
                              : "bg-green-600 hover:bg-green-700 text-white shadow-soft")
                          }
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment / Upgrade Overlay Dialog */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border rounded-2xl max-w-md w-full shadow-elegant overflow-hidden relative animate-in scale-in duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="p-6 sm:p-8 space-y-6">
              {!showUtrStep ? (
                <>
                  <div className="space-y-2 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Premium Activation
                    </span>
                    <h4 className="font-display font-extrabold text-xl text-gray-900">
                      Unlock Complete Series
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {selectedSubject
                        ? `To open papers for "${selectedSubject.name}", please unlock the complete premium bundle.`
                        : "Get instant access to all 20 subjects and 140+ mock tests."}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 border border-border/40 text-center space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      One-Time Premium Unlock
                    </p>
                    <div className="flex justify-center items-baseline gap-2 mt-1">
                      <span className="font-display text-4xl font-extrabold text-gray-900">
                        ₹2,000
                      </span>
                      <span className="text-muted-foreground line-through text-xs">₹3,999</span>
                      <span className="text-xs text-green-600 font-bold">50% off</span>
                    </div>
                    <p className="text-[11px] text-green-700 font-bold mt-1.5">
                      less than 14rs per question paper
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowUtrStep(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 shadow-elegant cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      Pay ₹2,000 & Unlock
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground h-10 cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-extrabold text-lg text-gray-900">UPI Payment</h4>
                    <p className="text-xs text-muted-foreground">Scan QR or pay using UPI ID to request unlock.</p>
                  </div>

                  {/* QR Image Display */}
                  <div className="flex flex-col items-center justify-center">
                    {qrCode ? (
                      <div className="bg-white p-2.5 rounded-xl border shadow-soft inline-block">
                        <img src={qrCode} alt="UPI Payment QR Code" className="h-40 w-40 object-contain" />
                      </div>
                    ) : (
                      <div className="h-40 w-40 flex items-center justify-center border border-dashed rounded-xl bg-gray-50 text-muted-foreground">
                        <QrCode className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* UPI ID Copy Field */}
                  {upiId ? (
                    <div className="flex items-center justify-between gap-2 bg-gray-50 border rounded-xl p-3">
                      <div className="truncate">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-left">UPI ID</span>
                        <span className="text-xs font-mono text-gray-900 font-medium select-all block text-left">{upiId}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyUpi}
                        className="h-8 px-2.5 text-xs font-semibold hover:bg-gray-100 shrink-0 text-green-700 cursor-pointer bg-white border"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100">
                      Payment UPI ID is not configured yet.
                    </div>
                  )}

                  {/* UTR Number Form */}
                  <div className="space-y-2 border-t pt-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Enter UTR / Transaction ID</span>
                      <span className="text-[10px] text-green-700 normal-case font-semibold">Required</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 612345678901 or ref number"
                      value={utr}
                      onChange={handleUtrChange}
                      className="w-full h-10 px-3 bg-white border border-border rounded-xl text-sm font-mono text-center tracking-widest focus:ring-1 focus:ring-green-600 focus:border-green-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground text-center">Enter the UTR, reference number, or transaction ID from your payment app</p>
                  </div>

                  <div className="space-y-2.5">
                    {!utrSubmitted ? (
                      <>
                        <Button
                          onClick={handleSubmitUtr}
                          disabled={submittingUtr || utr.trim().length < 3}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 shadow-elegant cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                        >
                          {submittingUtr ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit UTR & Request Unlock"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowUtrStep(false)}
                          className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground h-9 cursor-pointer"
                          disabled={submittingUtr}
                        >
                          Back
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center text-xs text-green-800 font-semibold">
                          ✅ UTR submitted! Admin will verify and unlock your access soon.
                        </div>
                        {/* WhatsApp Share Button */}
                        <a
                          href={`https://wa.me/917676069181?text=${encodeURIComponent(
                            `Hello! I have made the payment for Agricatalogues AO/AAO Mock Test Series.\n\nName: ${userProfile?.fullName || ""}\nPhone: ${userProfile?.phone || ""}\nUTR / Txn ID: ${utr}\n\nPlease verify and unlock my access. Thank you!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl font-semibold text-xs text-white cursor-pointer"
                          style={{ background: "#25D366" }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Share Payment Details on WhatsApp
                        </a>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowPaymentModal(false);
                            setUtr("");
                            setShowUtrStep(false);
                            setUtrSubmitted(false);
                          }}
                          className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground h-9 cursor-pointer"
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
