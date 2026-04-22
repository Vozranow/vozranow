'use client';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Wallet, AlertTriangle, Loader2, CheckCircle2, Zap, Lock, Clock, Info } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import API_PATHS from "../../utils/apiPaths.js";
import { useAuth } from "../../context/useAuth.js";
import { ENV } from "@/utils/env.js";

// Helper to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const AddMoneyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user
  
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // For input validation
  const [alert, setAlert] = useState({ type: "", text: "" }); 

  const predefinedAmounts = [100, 500, 1000, 2000];

  const handlePayment = async () => {
  
    setAlert({ type: "", text: "" });

    // 🟢 NEW: Strict ₹50 Minimum Validation
    if (!amount || Number(amount) < 50) {
      setError("Minimum top-up amount is ₹50.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet.");
      }

      // 2. Create Order on Backend
      const orderRes = await axiosInstance.post(API_PATHS.WALLET.CREATE_ORDER, {
        amount: Number(amount),
      });

      const { order } = orderRes.data;

      // 3. Open Razorpay Options
      const options = {
        key: ENV.RAZORPAY_KEY, 
        amount: order.amount, 
        currency: "INR",
        name: "Vozranow",
        description: "Wallet Top-up",
        order_id: order.id,
        modal: {
          ondismiss: function() {
            setLoading(false); 
            setAlert({ type: "error", text: "Payment was cancelled." });
          }
        },
        
        handler: async function (response) {
          // 4. Verify Payment on Backend
          try {
            const verifyRes = await axiosInstance.post(API_PATHS.WALLET.VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === 200 || verifyRes.data?.success) {
              setAlert({ type: "success", text: `Payment Successful! ₹${amount} has been added to your wallet.` });
              setTimeout(() => navigate("/dashboard"), 1500);
            }
          } catch (verifyError) {
             console.error("Verification failed:", verifyError);
             setAlert({ type: "error", text: "Payment verification failed. Contact support if money was deducted." });
             setLoading(false); 
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
          contact: "" 
        },
        theme: {
          color: "#173F3A",
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on("payment.failed", function (response) {
        setAlert({ type: "error", text: response.error.description || "Payment failed or was cancelled." });
        setLoading(false); 
      });

      rzp1.open();

    } catch (err) {
      console.error("Payment Error:", err);
      setAlert({ type: "error", text: err.response?.data?.message || err.message || "Something went wrong initiating payment." });
      setLoading(false);
    } 
    
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-sans selection:bg-[#173F3A] selection:text-white pb-12">
      
      {/* --- 1. Hero Header --- */}
      <div className="bg-[#173F3A] text-white pt-20 pb-32 px-6 relative overflow-hidden">
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 md:left-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-medium transition-all shadow-sm z-30"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#A3C6C0]/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-[60px]"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">Add Money</h1>
            <p className="text-[#A3C6C0] text-base md:text-lg leading-relaxed max-w-xl">
              Securely top up your Vozranow wallet for uninterrupted sessions and a seamless healing experience.
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. Main Content Grid --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Why use the wallet? */}
          <div className="lg:col-span-5 hidden lg:flex flex-col space-y-8 pt-4">
            <div className="bg-white rounded-[2rem] p-8 border border-[#E8E6E1] shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-[#2D2A26] mb-6">Why use the Wallet?</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#F0F7F5] flex items-center justify-center text-[#173F3A] shrink-0 mt-1">
                    <Zap size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2A26] text-sm">Instant Bookings</h4>
                    <p className="text-sm text-[#8C877D] mt-1 leading-relaxed">
                      Skip the payment gateway delays. Book your therapy sessions instantly with one click.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#F0F7F5] flex items-center justify-center text-[#173F3A] shrink-0 mt-1">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2A26] text-sm">Bank-Grade Security</h4>
                    <p className="text-sm text-[#8C877D] mt-1 leading-relaxed">
                      Your funds are secured by Razorpay's enterprise-level encryption. We never store card details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#F0F7F5] flex items-center justify-center text-[#173F3A] shrink-0 mt-1">
                    <Clock size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2A26] text-sm">Zero Drop-offs</h4>
                    <p className="text-sm text-[#8C877D] mt-1 leading-relaxed">
                      Avoid bank server timeouts during critical moments of need by maintaining a wallet balance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Top-up Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] shadow-sm border border-[#E8E6E1] p-6 md:p-10 space-y-8">
              
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wide text-[#5C5954]">Enter Amount</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-serif text-[#173F3A]">₹</span>
                  <input 
                    type="number" 
                    min="50"
                    value={amount}
                    onChange={(e) => {
                       // 🟢 NEW: Physically block them from typing the minus sign (-)
                       const val = e.target.value;
                       if (val.includes('-')) return; 

                       setAmount(val); 
                       setError("");
                       setAlert({ type: "", text: "" }); 
                    }}
                    onKeyDown={(e) => {
                       // Extra safety: block minus key press
                       if (e.key === '-' || e.key === 'e') {
                         e.preventDefault();
                       }
                    }}
                    className={`w-full pl-14 pr-6 py-5 text-4xl font-serif text-[#2D2A26] bg-[#F8FAFC] border-2 focus:border-[#173F3A] rounded-2xl outline-none transition-all placeholder:text-gray-300 ${
                      error ? 'border-red-300 bg-red-50' : 'border-[#E8E6E1]'
                    }`}
                    placeholder="Min. 50"
                    autoFocus
                  />
                </div>
                
                {/* Error OR Helper Text */}
                {error ? (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-1.5 mt-2">
                    <AlertTriangle size={14}/> {error}
                  </p>
                ) : (
                  <p className="text-[#8C877D] text-xs font-medium flex items-center gap-1.5 mt-2">
                    <Info size={14}/> Minimum top-up amount is ₹50
                  </p>
                )}
              </div>

              {/* Quick Chips */}
              <div className="grid grid-cols-4 gap-3">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { 
                      setAmount(amt); 
                      setError(""); 
                      setAlert({ type: "", text: "" }); 
                    }}
                    className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      Number(amount) === amt 
                        ? "bg-[#173F3A] text-white border-[#173F3A] shadow-md" 
                        : "bg-white text-[#5C5954] border-[#E8E6E1] hover:border-[#A3C6C0] hover:bg-[#F0F7F5]"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Disclaimer Box */}
              <div className="bg-[#FFFBF0] border border-[#FDE68A] rounded-2xl p-5 flex gap-4 items-start">
                 <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Non-Refundable</p>
                    <p className="text-sm text-amber-700/80 leading-relaxed">
                      Money added to your wallet can only be used for sessions on Vozranow. It <b className="text-amber-800">cannot</b> be transferred back to your bank account.
                    </p>
                 </div>
              </div>

              {/* Professional Inline Alert Box */}
              {alert.text && (
                <div className={`p-5 rounded-2xl flex items-start gap-3 border ${
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

              {/* Payment Button */}
              <div className="pt-2">
                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 bg-[#173F3A] text-white rounded-xl font-bold text-lg hover:bg-[#0F2926] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#173F3A]/20"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Wallet size={20} /> Proceed to Pay {amount ? `₹${amount}` : ""}
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#8C877D]">
                 <ShieldCheck size={14} className="text-[#A3C6C0]" /> Secured by Razorpay
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddMoneyPage;