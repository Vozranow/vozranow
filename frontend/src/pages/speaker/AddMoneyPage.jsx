import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Wallet, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import API_PATHS from "../../utils/apiPaths.js";
import { useAuth } from "../../context/useAuth.js"; // Assuming you have this
import toast from "react-hot-toast";
import { ENV } from "@/utils/env.js"
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
  const { user } = useAuth(); // Get user details for prefill
  
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predefinedAmounts = [100, 500, 1000, 2000];

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
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
        key: ENV.RAZORPAY_KEY, // Add this to your frontend .env
        amount: order.amount, 
        currency: "INR",
        name: "Solance",
        description: "Wallet Top-up",
        image: "/logo.png", // Ensure you have a logo in public folder
        order_id: order.id,
        
        handler: async function (response) {
          // 4. Verify Payment on Backend
          try {
            const verifyRes = await axiosInstance.post(API_PATHS.WALLET.VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                         <CheckCircle2 className="h-10 w-10 text-green-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">Payment Successful!</p>
                        <p className="mt-1 text-sm text-gray-500">₹{amount} has been added to your wallet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ));
              navigate("/dashboard");
            }
          } catch (verifyError) {
             console.error("Verification failed:", verifyError);
             toast.error("Payment verified failed. Contact support if money was deducted.");
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
          contact: "" // Optional
        },
        theme: {
          color: "#173F3A",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp1.open();

    } catch (err) {
      console.error("Payment Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#173F3A] rounded-b-[3rem] z-0" />
      
      <div className="relative z-10 w-full max-w-md mx-auto mt-8 px-4">
        {/* Header */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[#E8F4F1] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#E8F4F1]">Add Money</h1>
          <p className="text-[#A3C6C0] text-sm mt-1">Securely top up your Solance wallet</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
          
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Enter Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-serif text-[#173F3A]">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => {
                   setAmount(e.target.value); 
                   setError("");
                }}
                className="w-full pl-10 pr-4 py-4 text-3xl font-serif text-[#173F3A] bg-[#F8FAFC] border-2 border-transparent focus:border-[#173F3A]/20 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                placeholder="0"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm flex items-center gap-1 mt-1"><AlertTriangle size={14}/> {error}</p>}
          </div>

          {/* Quick Chips */}
          <div className="grid grid-cols-4 gap-2">
            {predefinedAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => { setAmount(amt); setError(""); }}
                className={`py-2 px-1 rounded-xl text-sm font-medium border transition-all ${
                  Number(amount) === amt 
                    ? "bg-[#173F3A] text-white border-[#173F3A]" 
                    : "bg-white text-[#5C5954] border-gray-200 hover:border-[#173F3A] hover:bg-[#F0F7F5]"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* Disclaimer Box */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
             <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
             <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Non-Refundable</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Money added to your wallet can only be used for sessions on Solance. It <b>cannot</b> be transferred back to your bank account.
                </p>
             </div>
          </div>

          {/* Payment Button */}
          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-[#173F3A] text-white rounded-xl font-medium text-lg hover:bg-[#0F2926] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#173F3A]/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
               <>
                 <Wallet size={20} /> Proceed to Pay {amount ? `₹${amount}` : ""}
               </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
             <ShieldCheck size={14} /> Secured by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyPage;