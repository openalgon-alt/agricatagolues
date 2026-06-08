import { useState, useEffect } from 'react';
import { X, Trophy, ArrowRight, BrainCircuit, Users, GraduationCap, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { examDataService, MockTest } from '@/services/examDataService';

export function MockTestPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [freeTests, setFreeTests] = useState<MockTest[]>([]);
  const navigate = useNavigate();
  const { activeExam, isLoading } = useSiteSettings();

  useEffect(() => {
    examDataService.getMockTests().then(tests => {
      setFreeTests(tests.filter(t => Number(t.price) === 0 && Number(t.id) !== -1));
    });
  }, []);

  useEffect(() => {
    if (isLoading || !activeExam) return;
    
    const promoKey = `mockTestPromoSeen_${activeExam}`;
    const hasSeenPromo = sessionStorage.getItem(promoKey);
    
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(promoKey, 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, activeExam]);

  if (!isOpen || isLoading) return null;

  const isPractical = activeExam === 'practical';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left graphic */}
          <div className={`p-8 flex-col items-center justify-center text-white text-center relative overflow-hidden hidden md:flex ${
            isPractical
              ? 'bg-gradient-to-br from-green-500 to-green-700'
              : 'bg-gradient-to-br from-blue-500 to-blue-800'
          }`}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_10%,_transparent_20%)] bg-[length:24px_24px]" />
            {isPractical ? (
              <>
                <Trophy className="w-24 h-24 mb-6 drop-shadow-lg text-yellow-300 relative z-10" />
                <h3 className="text-3xl font-black tracking-tight mb-2 relative z-10 leading-tight">
                  Crack Your Ag-B.Sc Exam
                </h3>
                <p className="text-green-50 text-base max-w-[250px] mx-auto relative z-10">
                  Prepare effectively for the state-level agricultural practicals.
                </p>
              </>
            ) : (
              <>
                <GraduationCap className="w-24 h-24 mb-6 drop-shadow-lg text-yellow-300 relative z-10" />
                <h3 className="text-3xl font-black tracking-tight mb-2 relative z-10 leading-tight">
                  Ace the AO / AAO Exam
                </h3>
                <p className="text-blue-50 text-base max-w-[250px] mx-auto relative z-10">
                  Karnataka Agriculture Officer & Assistant Agriculture Officer preparation.
                </p>
              </>
            )}
          </div>

          {/* Right content */}
          <div className="p-8 flex flex-col justify-center bg-white relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg text-green-700 shrink-0">
                  <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                Try a Free Mock Test
              </h2>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {freeTests.length > 0 ? freeTests.map((test) => (
                <div key={test.id} className="border border-green-200 shadow-sm hover:shadow-md transition-all group bg-white rounded-xl overflow-hidden cursor-pointer" onClick={() => { setIsOpen(false); navigate(isPractical ? '/exam' : '/exam/ao-aao'); }}>
                    <div className="h-2 bg-green-500 w-full"></div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={test.title}>{test.title}</h3>
                        <p className="text-gray-500 text-xs mb-4">{test.description || "Essential practice for beginners."}</p>
                    </div>
                    <div className="p-4 pt-0">
                        <button 
                            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-bold py-2.5 px-4 rounded-lg transition-colors"
                        >
                            Take Test
                        </button>
                    </div>
                </div>
              )) : (
                <div className="border border-green-200 shadow-sm hover:shadow-md transition-all group bg-white rounded-xl overflow-hidden cursor-pointer" onClick={() => { setIsOpen(false); navigate(isPractical ? '/exam' : '/exam/ao-aao'); }}>
                    <div className="h-2 bg-green-500 w-full"></div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">Mock Test 1</h3>
                        <p className="text-gray-500 text-xs mb-4">Free introductory mock test covering agricultural specimen identification. Includes 50 practical questions.</p>
                    </div>
                    <div className="p-4 pt-0">
                        <button 
                            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-bold py-2.5 px-4 rounded-lg transition-colors"
                        >
                            Take Test
                        </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
