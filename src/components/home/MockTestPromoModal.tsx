import { useState, useEffect } from 'react';
import { X, Trophy, ArrowRight, BrainCircuit, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MockTestPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has already seen the banner in this session
    const hasSeenPromo = sessionStorage.getItem('mockTestPromoSeen');
    if (!hasSeenPromo) {
      // Small delay for dramatic effect after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('mockTestPromoSeen', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left Side: Graphic / Illustration */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 flex flex-col items-center justify-center text-white text-center relative overflow-hidden hidden md:flex">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_10%,_transparent_20%)] bg-[length:24px_24px]"></div>
            <Trophy className="w-24 h-24 mb-6 drop-shadow-lg text-yellow-300 relative z-10" />
            <h3 className="text-3xl font-black tracking-tight mb-2 relative z-10 leading-tight">Crack Your Ag-B.Sc Exam</h3>
            <p className="text-green-50 text-base max-w-[250px] mx-auto relative z-10">
              Prepare effectively for the state-level agricultural practicals.
            </p>
          </div>

          {/* Right Side: Content & CTA */}
          <div className="p-8 flex flex-col justify-center bg-white relative">
            {/* Mobile-only graphic header */}
            <div className="md:hidden flex items-center gap-3 mb-4 text-green-600">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h3 className="text-xl font-black tracking-tight leading-tight">Crack Your Ag-B.Sc Exam</h3>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide mb-6 w-fit border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              100% Free Mock Test Available
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              Karnataka Agriculture Practical Exam
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Level up your preparation strictly tailored to Karnataka's Agriculture & Veterinary practicals—complete with specimen identification and rich analytics.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="bg-green-100 p-1.5 rounded-md text-green-700">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <strong>Free Essential Mock Tests</strong>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="bg-orange-100 p-1.5 rounded-md text-orange-600">
                  <Users className="w-4 h-4" />
                </div>
                Advanced Student Dashboard
              </li>
            </ul>

            <button
               onClick={() => {
                 setIsOpen(false);
                 navigate('/exam');
               }}
               className="group relative w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 active:scale-[0.98]"
            >
              Start Free Mock Test Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium">
              Join thousands of Karnataka students practicing today!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
