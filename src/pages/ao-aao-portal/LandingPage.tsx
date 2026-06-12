import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-field.jpg";
import { Button } from "@/components/ui/button";
import { SUBJECTS, subjectStatus, type Subject } from "@/lib/subjects";
import { aoAaoService } from "@/services/aoAaoService";
import {
  Sprout,
  CheckCircle2,
  ClipboardList,
  BookOpen,
  Trophy,
  Calendar,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react";
import mainLogo from "@/assets/main-logo.png";

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Scroll visibility hook ─── */
function useVisible(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(1deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-24px) rotate(2deg); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpDelay {
          0%, 20% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin3d {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 60px 60px; }
        }
        .anim-float { animation: float 6s ease-in-out infinite; }
        .anim-float-b { animation: floatB 8s ease-in-out infinite; }
        .anim-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }
        .anim-slide-up { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-slide-up-d1 { animation: slideUp 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-slide-up-d2 { animation: slideUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-slide-up-d3 { animation: slideUp 0.7s 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-fade { animation: fadeIn 1s ease both; }
        .text-shimmer {
          background: linear-gradient(90deg, #16a34a 0%, #4ade80 40%, #16a34a 60%, #15803d 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s;
        }
        .card-3d:hover {
          transform: perspective(800px) rotateX(-4deg) rotateY(4deg) translateY(-6px);
          box-shadow: 0 24px 60px -8px rgba(22,163,74,0.18), 0 8px 24px -4px rgba(0,0,0,0.12);
        }
        .orb {
          border-radius: 50%;
          filter: blur(60px);
          position: absolute;
          pointer-events: none;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(22,163,74,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(22,163,74,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 8s linear infinite;
        }
        .reveal-up {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .badge-glow {
          box-shadow: 0 0 20px rgba(22,163,74,0.3), 0 0 40px rgba(22,163,74,0.1);
        }
      `}</style>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Timeline />
      <Footer />
    </div>
  );
}

/* ───────────────────── Navbar ───────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-2xl bg-background/85 border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/exam/ao-aao" className="flex items-center gap-2">
          <img src={mainLogo} alt="Agricatalogues Logo" className="h-9 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/exam/ao-aao/auth">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white shadow-soft group"
            >
              Login / Sign Up
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 flex flex-col gap-1">
            <div className="flex gap-2">
              <Link to="/exam/ao-aao/auth" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Login / Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ───────────────────── Hero ───────────────────── */
function Hero() {
  return (
    <section id="home" className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Animated grid background */}
      <div className="absolute inset-0 -z-10 grid-bg opacity-60" />

      {/* Hero image with overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Agriculture field at golden hour"
          className="h-full w-full object-cover opacity-20 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* Floating glowing orbs */}
      <div className="orb anim-float w-96 h-96 bg-green-500/20 -top-24 -left-24 opacity-50" />
      <div
        className="orb anim-float-b w-80 h-80 bg-emerald-400/15 top-1/3 -right-20 opacity-40"
        style={{ animationDelay: "2s" }}
      />
      <div className="orb anim-pulse-slow w-64 h-64 bg-green-500/10 bottom-0 left-1/2 opacity-30" />
      <div
        className="orb anim-float w-48 h-48 bg-green-300/10 top-20 right-1/3 opacity-25"
        style={{ animationDelay: "3s" }}
      />

      {/* Floating 3D decorative shapes */}
      <div
        className="absolute top-16 right-16 hidden lg:block anim-float"
        style={{ animationDelay: "1s" }}
      >
        <div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/20 backdrop-blur-sm border border-green-500/20 shadow-2xl"
          style={{ transform: "perspective(400px) rotateX(15deg) rotateY(-20deg)" }}
        />
      </div>
      <div
        className="absolute bottom-32 left-16 hidden lg:block anim-float-b"
        style={{ animationDelay: "0.5s" }}
      >
        <div
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400/20 to-green-500/30 backdrop-blur-sm border border-green-500/20 shadow-xl"
          style={{ transform: "perspective(400px) rotateX(-10deg) rotateY(25deg)" }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="anim-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-700 badge-glow">
              <Sparkles className="h-3.5 w-3.5 anim-pulse-slow" />
              AO / AAO Exam Prep 2026 · Karnataka's Most Comprehensive Series
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.04] anim-slide-up-d1">
            AO/AAO Complete <span className="text-shimmer">Mock Test Series</span>
            <br />
            <span className="text-3xl sm:text-5xl md:text-6xl">2026</span>
          </h1>

          {/* Subheading pills */}
          <div className="mt-7 flex flex-wrap justify-center gap-3 anim-slide-up-d2">
            {["20 Subjects", "140+ Mock Tests", "14,000+ Questions"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-4 py-1.5 text-sm font-semibold shadow-soft"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 inline-block" />
                {item}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center anim-slide-up-d3">
            <Link to="/exam/ao-aao/auth">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white shadow-elegant w-full sm:w-auto text-base px-8 py-6 rounded-2xl group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Attempt Free Mock Test
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <a href="#subjects">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8 py-6 rounded-2xl border-2 hover:border-green-600/50 hover:bg-green-50/50 transition-all border-green-600/30 text-green-700 font-semibold"
              >
                Browse Subjects
              </Button>
            </a>
          </div>
        </div>

        {/* 3D floating dashboard preview card */}
        <div className="mt-20 mx-auto max-w-2xl anim-fade" style={{ animationDelay: "0.8s" }}>
          <div
            className="relative rounded-3xl border border-green-500/20 bg-card/80 backdrop-blur-xl shadow-2xl p-6 bg-white"
            style={{
              transform: "perspective(1000px) rotateX(4deg)",
              boxShadow: "0 40px 100px -20px rgba(22,163,74,0.2), 0 0 0 1px rgba(22,163,74,0.1)",
            }}
          >
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/40">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-muted/60 flex items-center px-3">
                <span className="text-[10px] text-muted-foreground">
                  agricatalogues.in/exam/ao-aao/dashboard
                </span>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tests Attempted", val: "12", color: "from-green-500/20 to-emerald-500/10" },
                { label: "Score Average", val: "76%", color: "from-blue-500/20 to-blue-400/10" },
                {
                  label: "Rank Estimate",
                  val: "Top 15%",
                  color: "from-purple-500/20 to-purple-400/10",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className={`rounded-xl bg-gradient-to-br ${c.color} border border-border/40 p-3 text-center`}
                >
                  <div className="font-bold text-lg">{c.val}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Stats ───────────────────── */
function Stats() {
  const { ref, visible } = useVisible(0.3);
  const s1 = useCounter(20, 1200, visible);
  const s2 = useCounter(140, 1600, visible);
  const s3 = useCounter(14000, 2000, visible);

  const items = [
    { value: s1, suffix: "", label: "Subjects", icon: BookOpen },
    { value: s2, suffix: "+", label: "Papers", icon: ClipboardList },
    { value: s3, suffix: "+", label: "Questions", icon: Trophy },
  ];

  return (
    <section className="border-y border-border/60 bg-card/40 relative overflow-hidden bg-white/60">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5" />
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-3 gap-8 relative"
      >
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`text-center reveal-up ${visible ? "visible" : ""}`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-soft">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-4xl sm:text-5xl font-extrabold tabular-nums">
              {s.value.toLocaleString()}
              {s.suffix}
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── Features ───────────────────── */
function Features() {
  const { ref, visible } = useVisible(0.2);
  const f = [
    {
      title: "Real Exam Pattern",
      desc: "Papers built to match the latest AO/AAO blueprint, marking scheme and difficulty.",
      icon: ClipboardList,
      color: "from-emerald-500/20 to-green-400/10",
      glow: "group-hover:shadow-emerald-500/20",
    },
    {
      title: "Detailed Solutions",
      desc: "Every question comes with an explanation written by agriculture subject experts.",
      icon: BookOpen,
      color: "from-blue-500/20 to-blue-400/10",
      glow: "group-hover:shadow-blue-500/20",
    },
    {
      title: "Subject-wise Practice",
      desc: "Drill into all 20 subjects independently — master one topic before moving on.",
      icon: Sprout,
      color: "from-purple-500/20 to-purple-400/10",
      glow: "group-hover:shadow-purple-500/20",
    },
    {
      title: "Instant Analytics",
      desc: "See your score, accuracy, and time-per-question the moment you finish a test.",
      icon: Target,
      color: "from-orange-500/20 to-orange-400/10",
      glow: "group-hover:shadow-orange-500/20",
    },
    {
      title: "All Karnataka Rank",
      desc: "Track your estimated rank against thousands of candidates preparing nationwide.",
      icon: Trophy,
      color: "from-yellow-500/20 to-yellow-400/10",
      glow: "group-hover:shadow-yellow-500/20",
    },
    {
      title: "Lightning Fast",
      desc: "Optimized test engine — load questions, submit, and see results in seconds.",
      icon: Zap,
      color: "from-cyan-500/20 to-cyan-400/10",
      glow: "group-hover:shadow-cyan-500/20",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <div ref={ref} className={`max-w-2xl reveal-up ${visible ? "visible" : ""}`}>
        <span className="text-xs font-bold uppercase tracking-widest text-green-600">Features</span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Everything you need to crack <span className="text-shimmer">AO/AAO 2026</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Designed for serious aspirants. No fluff, no distractions — just deep practice.
        </p>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {f.map((x, i) => (
          <div
            key={x.title}
            className={`group card-3d relative rounded-2xl border bg-card p-6 shadow-soft cursor-default bg-white reveal-up ${visible ? "visible" : ""}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {/* Gradient top accent */}
            <div
              className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${x.color} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${x.color} border border-border/40 shadow-soft transition-shadow ${x.glow}`}
            >
              <x.icon className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="mt-4 font-semibold text-base">{x.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{x.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── Timeline ───────────────────── */
function Timeline() {
  const [now, setNow] = useState(new Date());
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const { ref, visible } = useVisible(0.1);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    aoAaoService.listSubjects()
      .then((result) => {
        if (result.subjects && result.subjects.length > 0) {
          setSubjects(result.subjects);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="subjects" className="relative border-y border-border/60 overflow-hidden bg-white/40">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 relative">
        <div ref={ref} className={`max-w-2xl reveal-up ${visible ? "visible" : ""}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
            Release Schedule
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            20 Subjects, rolled out across <span className="text-shimmer">June – July 2026</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Subjects unlock automatically on their release date. Get full access to all materials
            upon release.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((s, idx) => {
            const status = subjectStatus(s, now);
            const available = status === "Available";
            return (
              <div
                key={s.name}
                className={`flex items-start gap-3 rounded-xl border bg-card p-4 hover:shadow-soft transition-all hover:-translate-y-0.5 bg-white reveal-up ${visible ? "visible" : ""}`}
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <div
                  className={
                    "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                    (available ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")
                  }
                >
                  {available ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {String(idx + 1).padStart(2, "0")}. {s.name}
                    </p>
                    <span
                      className={
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " +
                        (available
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800")
                      }
                    >
                      {available ? "Live" : "Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Releases {s.release}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Footer ───────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src={mainLogo} alt="Agricatalogues Logo" className="h-9 w-auto object-contain" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            The most comprehensive AO/AAO mock test series. Built by educators, designed for serious
            aspirants.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-green-600 transition-colors" href="#subjects">
                Subjects
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/exam/ao-aao/auth" className="hover:text-green-600 transition-colors">
                Login / Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
          <span>© 2026 Agricatalogues. All rights reserved.</span>
          <span>Made with care for AO/AAO aspirants.</span>
        </div>
      </div>
    </footer>
  );
}
