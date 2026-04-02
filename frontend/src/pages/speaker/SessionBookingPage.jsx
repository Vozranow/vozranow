'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Heart, UserCheck, Loader2, ArrowLeft,
  AlertTriangle 
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const PLANS = [
  { id: "30", duration: 30, price: 300, name: "Quick Relief", desc: "Short session for immediate calm." },
  { id: "45", duration: 45, price: 500, name: "Standard Healing", desc: "Standard therapy duration." },
  { id: "60", duration: 60, price: 650, name: "Deep Dive", desc: "In-depth analysis and support." },
];

const SessionBookingPage = () => {
  const navigate = useNavigate();
  
  // State for Booking
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]); 
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // State for User Data
  const [walletBalance, setWalletBalance] = useState(0);
  const [fetchingUser, setFetchingUser] = useState(true);

  // 🟢 Professional Inline Alert State
  const [alert, setAlert] = useState({ type: "", text: "" });

  // 1. FETCH FRESH DATA
  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setWalletBalance(res.data.user.walletBalance);
      } catch (err) {
        console.error("Failed to fetch wallet", err);
        setAlert({ type: "error", text: "Could not sync wallet balance. Please refresh the page." });
      } finally {
        setFetchingUser(false);
      }
    };
    fetchFreshProfile();
  }, []);

  const handleBooking = async () => {
    // Clear previous alerts on new attempt
    setAlert({ type: "", text: "" });
    
    // 1. Basic Validation
    if (!date || !startTime || !endTime) {
      setAlert({ type: "error", text: "Please select a date and a time window." });
      return;
    }

    setBookingLoading(true);

    try {
      // 2. Construct Dates
      // 2. Construct Dates
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // 🟢 NEW: Frontend Auto-Rollover Logic
      // If end time is mathematically before start time, add 1 day to the end time
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      // 3. Validation Logic
      const durationMinutes = (endDateTime - startDateTime) / (1000 * 60);
      
      if (durationMinutes < 120 || durationMinutes > 180) {
        throw new Error("Preferred window must be between 2 to 3 hours. (e.g., 10:00 PM to 12:00 AM)");
      }
      
      if (endDateTime <= startDateTime) throw new Error("End time must be after start time.");

      // 4. Wallet Check
      if (walletBalance < selectedPlan.price) {
        setAlert({ type: "error", text: "Insufficient Balance. Redirecting to top-up..." });
        setTimeout(() => navigate("/add-money"), 1500);
        return;
      }

      // 5. Payload
      const payload = {
        scheduledDate: date,
        preferredTimeStart: startDateTime.toISOString(),
        preferredTimeEnd: endDateTime.toISOString(),
        plan: selectedPlan.id
      };

      // 6. API Call
      const res = await axiosInstance.post(API_PATHS.SESSION.APPLY, payload);

      if (res.status === 201) {
        setAlert({ type: "success", text: "Request Sent! An admin will assign a listener soon." });
        // Tiny delay so the user can actually read the success message before it navigates
        setTimeout(() => navigate("/dashboard"), 1500);
      }

    } catch (err) {
      console.error(err);
      // Priority: Backend Error -> Axios Error -> Hardcoded Fallback
      const msg = err.response?.data?.message || err.message || "Booking failed. Please try again.";
      setAlert({ type: "error", text: msg });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-12">
      
      {/* 1. Hero Header */}
      <div className="bg-[#173F3A] text-white pt-8 pb-24 rounded-b-[3rem] px-6 relative overflow-hidden">
        
        {/* 🟢 BACK BUTTON */}
        <div className="max-w-4xl mx-auto relative z-20 mb-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-[#A3C6C0] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 w-fit"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>

        {/* Abstract Background */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden group ${
                  selectedPlan.id === plan.id 
                    ? "border-[#173F3A] bg-[#F0F7F5] shadow-md transform scale-[1.02]" 
                    : "border-gray-100 bg-white hover:border-[#A3C6C0] hover:shadow-sm"
                }`}
              >
                {selectedPlan.id === plan.id && (
                  <div className="absolute top-3 right-3 text-[#173F3A]"><CheckCircle2 size={18} fill="#173F3A" color="white" /></div>
                )}
                <h3 className="font-bold text-gray-800 text-lg">{plan.duration} Mins</h3>
                <p className="text-xs text-gray-500 mt-1 h-8">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-serif text-[#173F3A]">₹{plan.price}</span>
                  <span className="text-xs text-gray-400">/ session</span>
                </div>
              </div>
            ))}
          </div>
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
                    setAlert({ type: "", text: "" }); // Clear errors on change
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
                     setAlert({ type: "", text: "" }); // Clear errors on change
                   }}
                   className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#173F3A] outline-none transition-all cursor-pointer"
                 />
                 <span className="text-gray-400 font-medium">to</span>
                 <input 
                   type="time" 
                   value={endTime}
                   onChange={(e) => {
                     setEndTime(e.target.value);
                     setAlert({ type: "", text: "" }); // Clear errors on change
                   }}
                   className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#173F3A] outline-none transition-all cursor-pointer"
                 />
               </div>
               <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                 <AlertCircle size={10} /> Must be between 8:00 AM - 11:59 PM
               </p>
            </div>
          </div>

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
                <p className="font-bold text-[#173F3A] text-lg">- ₹{selectedPlan.price}</p>
             </div>
          </div>

          {/* 🟢 Professional Inline Alert Box */}
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
            disabled={bookingLoading || fetchingUser}
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