import { useState, useEffect } from 'react';
import { X, GraduationCap, Trophy, ArrowRight, Clock, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export function MockTestPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { activeExam, isLoading } = useSiteSettings();


  useEffect(() => {
    if (isLoading || !activeExam) return;
    const promoKey = `mockTestPromoSeen_${activeExam}`;
    const hasSeenPromo = sessionStorage.getItem(promoKey);
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(promoKey, 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, activeExam]);

  if (!isOpen || isLoading) return null;

  const isPractical = activeExam === 'practical';

  const handleTakeTest = () => {
    setIsOpen(false);
    navigate(isPractical ? '/exam' : '/exam/ao-aao');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-in fade-in zoom-in-90 duration-500"
        style={{ background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)' }}
      >
        {/* Decorative glowing orbs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl"
          style={{ background: isPractical ? '#22c55e' : '#6366f1' }} />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ background: isPractical ? '#16a34a' : '#4f46e5' }} />

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-30 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-full p-1.5 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top spacing */}
        <div className="pt-8" />

        {/* Hero section */}
        <div className="relative z-10 px-7 pt-4 pb-5 text-white text-center">
          {/* Big icon */}
          <div className="mb-4 relative inline-block mx-auto">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isPractical ? 'bg-green-500/20 border border-green-400/30' : 'bg-indigo-500/20 border border-indigo-400/30'}`}>
              {isPractical
                ? <Trophy className="w-9 h-9 text-yellow-400 drop-shadow" />
                : <GraduationCap className="w-9 h-9 text-indigo-300 drop-shadow" />
              }
            </div>
            {/* Pulse ring */}
            <div className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${isPractical ? 'bg-green-400' : 'bg-indigo-400'}`} style={{ animationDuration: '2s' }} />
          </div>

          <h2 className="text-2xl font-black leading-tight mb-1 tracking-tight">
            {isPractical ? (
              <>Crack Your<br /><span className="text-green-400">Practical Exam</span> 🌱</>
            ) : (
              <>Ace the<br /><span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">AO / AAO Exam</span> 🎓</>
            )}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            {isPractical
              ? 'Start with a free mock test. No payment, no signup.'
              : 'Try a free mock test and get exam-ready today.'}
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 mx-7 mb-5 grid grid-cols-3 gap-2">
          {[
            { icon: <Star className="w-3 h-3 text-yellow-400" />, label: 'Top Rated' },
            { icon: <Users className="w-3 h-3 text-blue-300" />, label: '1000+ Users' },
            { icon: <Clock className="w-3 h-3 text-green-400" />, label: 'Instant Access' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl py-2 px-1">
              {s.icon}
              <span className="text-[9px] text-white/60 font-semibold text-center leading-tight">{s.label}</span>
            </div>
          ))}
        </div>



        {/* CTA Button */}
        <div className="relative z-10 px-7 pb-7">
          <button
            onClick={handleTakeTest}
            className={`w-full py-4 rounded-2xl font-black text-white text-sm tracking-wide transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${
              isPractical
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-500'
            }`}
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              Start Free Test Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>

          <p className="text-center text-[11px] text-white/30 mt-3 font-medium">
            ✦ No signup required &nbsp;·&nbsp; Completely free &nbsp;·&nbsp; Instant access ✦
          </p>
        </div>
      </div>
    </div>
  );
}
