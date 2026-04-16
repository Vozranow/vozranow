'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Heart, UserCheck, Loader2, ArrowLeft,
  AlertTriangle, Sparkles
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

// 🟢 NEW: Updated Config
const ALL_PLANS = [
  { id: "5", duration: 5, price: 0, name: "Free Trial", desc: "First 5 minutes free to try.", isTrial: true },
  { id: "10", duration: 10, price: 100, name: "Quick Check-in", desc: "A brief 10-minute check-in." },
  { id: "15", duration: 15, price: 299, name: "Short Relief", desc: "15 minutes for immediate calm." },
  { id: "30", duration: 30, price: 499, name: "Standard Healing", desc: "Standard 30-minute therapy duration." },
];

const SessionBookingPage = () => {
  const navigate = useNavigate();
  
  // State for Booking
  const [selectedPlan, setSelectedPlan] = useState(null); // Set dynamically after fetch
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // State for User Data
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false); // 🟢 NEW State
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

        // 🟢 Default Selection: Select 5 min if available, otherwise 15 min
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

      // 🟢 NEW: Wallet Check ONLY if price is greater than 0
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

  // 🟢 Filter out the trial plan if they've used it
  const visiblePlans = ALL_PLANS.filter(plan => !(plan.isTrial && hasUsedFreeTrial));

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-12">
      
      {/* 1. Hero Header */}
      <div className="bg-[#173F3A] text-white pt-8 pb-24 rounded-b-[3rem] px-6 relative overflow-hidden">
        
        <div className="max-w-4xl mx-auto relative z-20 mb-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-[#A3C6C0] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 w-fit"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#A3C6C0]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-serif mb-3">Book Your Session</h1>
          <p className="text-[#A3C6C0] max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Take a step towards healing. Choose a plan and let us match you with the perfect listener for your needs.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20 space-y-8">
        
        {/* 2. Step 1: Choose Plan */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#E8F4F1] p-2 rounded-full text-[#173F3A]"><CheckCircle2 size={20}/></div>
            <h2 className="text-xl font-bold text-gray-800">1. Choose a Plan</h2>
          </div>

          {fetchingUser ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#173F3A]" size={32}/></div>
          ) : (
            // 🟢 Dynamic Grid: Adjusts beautifully whether there are 3 or 4 plans visible
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${visiblePlans.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
              {visiblePlans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden group flex flex-col ${
                    selectedPlan?.id === plan.id 
                      ? "border-[#173F3A] bg-[#F0F7F5] shadow-md transform scale-[1.02]" 
                      : "border-gray-100 bg-white hover:border-[#A3C6C0] hover:shadow-sm"
                  }`}
                >
                  {/* Badge & Selection Ring */}
                  {plan.isTrial && (
                    <span className="absolute top-3 left-3 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> Free Trial
                    </span>
                  )}
                  {selectedPlan?.id === plan.id && (
                    <div className="absolute top-3 right-3 text-[#173F3A]"><CheckCircle2 size={18} fill="#173F3A" color="white" /></div>
                  )}

                  <div className={`mt-${plan.isTrial ? '6' : '0'}`}>
                    <h3 className="font-bold text-gray-800 text-lg">{plan.duration} Mins</h3>
                    <p className="text-xs text-gray-500 mt-1 flex-1">{plan.desc}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-2xl font-serif text-emerald-600">Free</span>
                      ) : (
                        <>
                          <span className="text-2xl font-serif text-[#173F3A]">₹{plan.price}</span>
                          <span className="text-xs text-gray-400">/ session</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Step 2: Schedule Time */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#E8F4F1] p-2 rounded-full text-[#173F3A]"><Clock size={20}/></div>
            <h2 className="text-xl font-bold text-gray-800">2. Preferred Time</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]} 
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setAlert({ type: "", text: "" });
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preferred Window (2-3 Hours)</label>
               <div className="flex items-center gap-2">
                 <input 
                   type="time" 
                   value={startTime}
                   onChange={(e) => {
                     setStartTime(e.target.value);
                     setAlert({ type: "", text: "" });
                   }}
                   className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#173F3A] outline-none transition-all cursor-pointer"
                 />
                 <span className="text-gray-400 font-medium">to</span>
                 <input 
                   type="time" 
                   value={endTime}
                   onChange={(e) => {
                     setEndTime(e.target.value);
                     setAlert({ type: "", text: "" });
                   }}
                   className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#173F3A] outline-none transition-all cursor-pointer"
                 />
               </div>
               <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                 <AlertCircle size={10} /> Must be between 8:00 AM - 11:59 PM
               </p>
            </div>
          </div>

          {selectedPlan && (
            <div className="mt-8 mb-6 bg-[#F8FAFC] rounded-xl p-4 flex justify-between items-center border border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm text-[#173F3A]"><ShieldCheck size={18}/></div>
                  <div>
                     <p className="text-xs text-gray-500">Wallet Balance</p>
                     {fetchingUser ? (
                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                     ) : (
                        <p className="font-bold text-gray-800">₹{walletBalance}</p>
                     )}
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-500">Session Cost</p>
                  <p className={`font-bold text-lg ${selectedPlan.price === 0 ? 'text-emerald-600' : 'text-[#173F3A]'}`}>
                    {selectedPlan.price === 0 ? '₹0 (Free)' : `- ₹${selectedPlan.price}`}
                  </p>
               </div>
            </div>
          )}

          {/* Professional Inline Alert Box */}
          {alert.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
              alert.type === "error" 
                ? "bg-red-50 border-red-100 text-red-700" 
                : "bg-emerald-50 border-emerald-100 text-emerald-700"
            }`}>
              {alert.type === "error" ? (
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              ) : (
                <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
              )}
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

        {/* 4. "How it Works" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-12">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto"><UserCheck size={24} /></div>
              <h3 className="font-bold text-gray-800">1. You Request</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Select your preferred date and a 2-3 hour window where you are free.</p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto"><ShieldCheck size={24} /></div>
              <h3 className="font-bold text-gray-800">2. We Match</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Our admin assigns the best available listener for your specific time slot.</p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto"><Heart size={24} /></div>
              <h3 className="font-bold text-gray-800">3. Healing Begins</h3>
              <p className="text-xs text-gray-500 leading-relaxed">You get a notification with the confirmed time and meeting link.</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SessionBookingPage;