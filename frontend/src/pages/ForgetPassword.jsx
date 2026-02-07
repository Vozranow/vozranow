'use client';
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" }); // type: 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      // Backend returns: "If the email exists, a reset link has been sent"
      setStatus({ 
        type: "success", 
        message: res.data.message 
      });
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Something went wrong. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDFCF8] overflow-hidden">
      
      {/* --- LEFT SIDE: Visual (Calm Aesthetic) --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#173F3A]">
        {/* <img 
          src="https://images.unsplash.com/photo-1502421898236-81534f59795b?q=80&w=1974&auto=format&fit=crop" 
          alt="Foggy forest path" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#173F3A]/30 to-[#173F3A]/90" />
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-[#E5F0EE]">
           <div className="font-serif text-3xl font-bold tracking-tight">Solance.</div>
           <div className="space-y-6 max-w-md">
              <blockquote className="font-serif text-4xl leading-tight">
                "Hope is being able to see that there is light despite all of the darkness."
              </blockquote>
              <cite className="block text-lg font-light opacity-80 not-italic">— Desmond Tutu</cite>
           </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: The Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-serif text-4xl text-[#2D2A26]">Forgot password?</h1>
            <p className="text-[#5C5954]">
              Don't worry, it happens. We'll send you a link to reset it.
            </p>
          </div>

          {/* Success State */}
          {status.type === 'success' ? (
            <div className="rounded-xl bg-[#E8F4F1] p-6 text-center space-y-4 border border-[#3A6B48]/20">
               <div className="h-12 w-12 bg-[#3A6B48] rounded-full flex items-center justify-center mx-auto text-white">
                  <Mail size={24} />
               </div>
               <h3 className="text-[#173F3A] font-serif text-xl">Check your inbox</h3>
               <p className="text-[#5C5954] text-sm">
                 {status.message}
               </p>
               <div className="pt-4">
                  <Link to="/login" className="text-[#173F3A] font-semibold hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D2A26]" htmlFor="email">Email address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-4 text-[#2D2A26] placeholder-[#8C877D] outline-none focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                  />
                </div>
              </div>

              {status.type === 'error' && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-[#173F3A] py-3.5 text-white shadow-lg transition-all hover:bg-[#0F2926] disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending...</>
                  ) : (
                    <>Send Link <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
                  )}
                </span>
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-[#5C5954] hover:text-[#173F3A] transition-colors flex items-center justify-center gap-2">
                   <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;