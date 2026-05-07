'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Heart, UserCheck, Loader2, ArrowLeft,
  AlertTriangle, Sparkles, CreditCard
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ALL_PLANS = [
  { id: "5", duration: 5, price: 0, name: "Free Trial", desc: "First 5 minutes free to try.", isTrial: true },
  { id: "10", duration: 10, price: 100, name: "Quick Check-in", desc: "A brief 10-minute check-in." },
  { id: "15", duration: 15, price: 299, name: "Short Relief", desc: "15 minutes for immediate calm." },
  { id: "30", duration: 30, price: 499, name: "Standard Healing", desc: "Standard 30-minute duration." },
];

const SessionBookingPage = () => {
  const navigate = useNavigate();
  
  // State for Booking
  const [selectedPlan, setSelectedPlan] = useState(null); 
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // State for User Data
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false); 
  const [fetchingUser, setFetchingUser] = useState(true);

  // Professional Inline Alert State
  const [alert, setAlert] = useState({ type: "", text: "" });

  // 1. FETCH FRESH DATA
  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        const user = res.data.user;
        setWalletBalance(user.walletBalance);
        setHasUsedFreeTrial(user.hasUsedFreeTrial || false);

        if (user.hasUsedFreeTrial) {
          setSelectedPlan(ALL_PLANS.find(p => p.id === "15"));
        } else {
          setSelectedPlan(ALL_PLANS.find(p => p.id === "5"));
        }
        
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setAlert({ type: "error", text: "Could not sync profile data. Please refresh the page." });
      } finally {
        setFetchingUser(false);
      }
    };
    fetchFreshProfile();
  }, []);

  const handleBooking = async () => {
    setAlert({ type: "", text: "" });
    
    if (!date || !startTime || !endTime || !selectedPlan) {
      setAlert({ type: "error", text: "Please select a plan, date, and time window." });
      return;
    }

    setBookingLoading(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const durationMinutes = (endDateTime - startDateTime) / (1000 * 60);
      
      if (durationMinutes < 120 || durationMinutes > 180) {
        throw new Error("Preferred window must be between 2 to 3 hours. (e.g., 10:00 PM to 12:00 AM)");
      }
      
      if (endDateTime <= startDateTime) throw new Error("End time must be after start time.");

      if (selectedPlan.price > 0 && walletBalance < selectedPlan.price) {
        setAlert({ type: "error", text: "Insufficient Balance. Redirecting to top-up..." });
        setTimeout(() => navigate("/add-money"), 1500);
        return;
      }

      const payload = {
        scheduledDate: date,
        preferredTimeStart: startDateTime.toISOString(),
        preferredTimeEnd: endDateTime.toISOString(),
        plan: selectedPlan.id
      };

      const res = await axiosInstance.post(API_PATHS.SESSION.APPLY, payload);

      if (res.status === 201) {
        setAlert({ type: "success", text: "Request Sent! An admin will assign a listener soon." });
        setTimeout(() => navigate("/dashboard"), 1500);
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Booking failed. Please try again.";
      setAlert({ type: "error", text: msg });
    } finally {
      setBookingLoading(false);
    }
  };

  const visiblePlans = ALL_PLANS.filter(plan => !(plan.isTrial && hasUsedFreeTrial));

  return (
    // Using a slightly richer background so the white cards pop.
    <div className="min-h-screen bg-[#F4F7F6] pb-12 font-sans selection:bg-[#173F3A] selection:text-white">
      
      {/* 1. Hero Header */}
      <div className="bg-[#173F3A] text-white pt-20 pb-32 px-6 relative overflow-hidden">
        
        {/* Proper Button styling, absolutely positioned to top left */}
        <button 
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 md:left-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-medium transition-all shadow-sm z-30"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#A3C6C0]/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-[60px]"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">Book Your Session</h1>
            <p className="text-[#A3C6C0] text-base md:text-lg leading-relaxed max-w-xl">
              Take a step towards healing. Choose a duration that feels right for you today, and we'll connect you with the perfect listener.
            </p>
          </div>
        </div>
      </div>

      {/*Two-Column Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Plan Selection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#E8E6E1]">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#E8F4F1] p-2.5 rounded-xl text-[#173F3A]"><CheckCircle2 size={20} strokeWidth={2.5}/></div>
                <div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">Select a Duration</h2>
                  <p className="text-sm text-[#8C877D]">How much time do you need?</p>
                </div>
              </div>

              {fetchingUser ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#173F3A]" size={32}/></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visiblePlans.map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 relative overflow-hidden group flex flex-col ${
                        selectedPlan?.id === plan.id 
                          ? "border-[#173F3A] bg-[#F0F7F5] shadow-md transform scale-[1.02]" 
                          : "border-[#E8E6E1] bg-white hover:border-[#A3C6C0] hover:shadow-sm"
                      }`}
                    >
                      {plan.isTrial && (
                        <span className="absolute top-4 left-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Sparkles size={12} /> Free Trial
                        </span>
                      )}
                      
                      <div className="absolute top-4 right-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan?.id === plan.id ? 'border-[#173F3A] bg-[#173F3A]' : 'border-gray-300 bg-transparent'}`}>
                          {selectedPlan?.id === plan.id && <CheckCircle2 size={12} className="text-white" strokeWidth={4} />}
                        </div>
                      </div>

                      <div className={`mt-${plan.isTrial ? '8' : '2'}`}>
                        <h3 className="font-bold text-[#2D2A26] text-xl mb-1">{plan.duration} Mins</h3>
                        <p className="text-sm text-[#8C877D] flex-1">{plan.desc}</p>
                        
                        <div className="mt-6 pt-4 border-t border-black/5 flex items-baseline gap-1">
                          {plan.price === 0 ? (
                            <span className="text-2xl font-serif text-emerald-600">Free</span>
                          ) : (
                            <>
                              <span className="text-2xl font-serif text-[#173F3A]">₹{plan.price}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Time & Checkout */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#E8E6E1] lg:sticky lg:top-8">
              
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#E8F4F1] p-2.5 rounded-xl text-[#173F3A]"><Clock size={20} strokeWidth={2.5}/></div>
                <div>
                  <h2 className="text-xl font-bold text-[#2D2A26]">Schedule</h2>
                  <p className="text-sm text-[#8C877D]">When are you free?</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C5954] uppercase tracking-wide">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C877D]" size={18} />
                    <input 
                      type="date" 
                      min={new Date().toISOString().split("T")[0]} 
                      value={date}
                      onChange={(e) => { setDate(e.target.value); setAlert({ type: "", text: "" }); }}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl text-[#2D2A26] font-medium focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] outline-none transition-all cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium bg-amber-50 w-fit px-2 py-0.5 rounded-md">
                     <AlertCircle size={12} /> Book at least 6 hours in advance
                  </p>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-[#5C5954] uppercase tracking-wide">Time Window (2-3 Hrs)</label>
                   <div className="flex items-center gap-3">
                     <input 
                       type="time" 
                       value={startTime}
                       onChange={(e) => { setStartTime(e.target.value); setAlert({ type: "", text: "" }); }}
                       className="flex-1 px-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl text-[#2D2A26] font-medium focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] outline-none transition-all cursor-pointer"
                     />
                     <span className="text-[#8C877D] font-medium">to</span>
                     <input 
                       type="time" 
                       value={endTime}
                       onChange={(e) => { setEndTime(e.target.value); setAlert({ type: "", text: "" }); }}
                       className="flex-1 px-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl text-[#2D2A26] font-medium focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] outline-none transition-all cursor-pointer"
                     />
                   </div>
                </div>
              </div>

              <hr className="my-8 border-[#E8E6E1]" />

              {/* Checkout Summary */}
              {selectedPlan && (
                <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E8E6E1] mb-6 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-[#8C877D] font-medium">Session Duration</span>
                     <span className="font-bold text-[#2D2A26]">{selectedPlan.duration} Mins</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-[#8C877D] font-medium">Session Cost</span>
                     <span className={`font-bold ${selectedPlan.price === 0 ? 'text-emerald-600' : 'text-[#2D2A26]'}`}>
                       {selectedPlan.price === 0 ? 'Free' : `₹${selectedPlan.price}`}
                     </span>
                   </div>
                   
                   <div className="pt-4 border-t border-[#E8E6E1] flex justify-between items-center">
                     <div className="flex items-center gap-2 text-[#173F3A]">
                        <CreditCard size={18} />
                        <span className="text-sm font-bold">Wallet Balance</span>
                     </div>
                     {fetchingUser ? (
                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                     ) : (
                        <span className="font-bold text-[#2D2A26]">₹{walletBalance}</span>
                     )}
                   </div>
                </div>
              )}

              {alert.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                  alert.type === "error" ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                }`}>
                  {alert.type === "error" ? <AlertTriangle className="shrink-0 mt-0.5" size={18} /> : <CheckCircle2 className="shrink-0 mt-0.5" size={18} />}
                  <p className="text-sm font-medium leading-relaxed">{alert.text}</p>
                </div>
              )}

              <button 
                onClick={handleBooking}
                disabled={bookingLoading || fetchingUser || !selectedPlan}
                className="w-full py-4 bg-[#173F3A] text-white rounded-xl font-bold text-lg hover:bg-[#0F2926] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#173F3A]/20"
              >
                {bookingLoading ? <Loader2 className="animate-spin" /> : (
                  <>Confirm Request <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </div>

        </div>
        
        {/* 4. "How it Works" - Timeline (Unchanged, beautifully centered at bottom) */}
        <div className="mt-20 pt-10 border-t border-[#E8E6E1]">
           <div className="text-center mb-12">
             <h3 className="font-serif text-3xl text-[#2D2A26]">How it works</h3>
             <p className="text-sm md:text-base text-[#8C877D] mt-2">A simple, transparent path to your healing space.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
              <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-[1px] bg-[#E8E6E1] z-0"></div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                 <div className="w-12 h-12 bg-white border border-[#E8E6E1] text-[#173F3A] rounded-full flex items-center justify-center shadow-sm">
                   <UserCheck size={20} strokeWidth={1.5} />
                 </div>
                 <div>
                   <h4 className="font-bold text-[#2D2A26] text-base">1. You Request</h4>
                   <p className="text-sm text-[#8C877D] leading-relaxed mt-2 max-w-[220px] mx-auto">
                     Select a date and a 2-3 hour window. Must be booked at least 6 hours in advance.
                   </p>
                 </div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                 <div className="w-12 h-12 bg-white border border-[#E8E6E1] text-[#173F3A] rounded-full flex items-center justify-center shadow-sm">
                   <ShieldCheck size={20} strokeWidth={1.5} />
                 </div>
                 <div>
                   <h4 className="font-bold text-[#2D2A26] text-base">2. We Match</h4>
                   <p className="text-sm text-[#8C877D] leading-relaxed mt-2 max-w-[220px] mx-auto">
                     Our admin carefully assigns the best available listener for your specific time slot.
                   </p>
                 </div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                 <div className="w-12 h-12 bg-[#173F3A] text-white border-2 border-white rounded-full flex items-center justify-center shadow-md shadow-[#173F3A]/20">
                   <Heart size={20} strokeWidth={1.5} />
                 </div>
                 <div>
                   <h4 className="font-bold text-[#2D2A26] text-base">3. Healing Begins</h4>
                   <p className="text-sm text-[#8C877D] leading-relaxed mt-2 max-w-[220px] mx-auto">
                     You get a notification with the confirmed time and your assigned listener's details.
                   </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SessionBookingPage;