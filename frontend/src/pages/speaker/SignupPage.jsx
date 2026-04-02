'use client';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance.js";
import API_PATHS from "../../utils/apiPaths.js";
import { useAuth } from "../../context/useAuth.js";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // --- State ---
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60); // 60s cooldown matches backend limiter

  // --- Handlers ---

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // STEP 1: Submit Registration Form
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Call Register API
      await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        username: form.name,
        email: form.email,
        password: form.password
      });

      // Success -> Move to OTP Step
      setStep(2);
      setResendTimer(60); // Start countdown
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.VERIFY_OTP, {
        email: form.email,
        otp: otp
      });

      // Success -> Auto Login & Redirect
      if (res.data?.user) {
         login(res.data.user);
         navigate("/dashboard");
      } else {
         navigate("/login");
      }
    } catch (err) {
      // Handle locked account message specifically if needed
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESEND_OTP, { email: form.email });
      setResendTimer(60); // Reset timer
      // Optional: Show success toast/message
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Redirect if already logged in
  if (isAuthenticated) {
      setTimeout(() => navigate("/dashboard"), 1000);
      return null;
  }

  return (
    <div className="min-h-screen w-full flex bg-[#FDFCF8] overflow-hidden">
      
      {/* --- LEFT SIDE: Form Area --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative animate-in slide-in-from-left-10 duration-700 fade-in">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 font-serif text-2xl font-bold text-[#173F3A]">
           Solance.
        </div>

        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-serif text-4xl text-[#2D2A26]">
              {step === 1 ? "Begin your journey" : "Verify Email"}
            </h1>
            <p className="text-[#5C5954]">
              {step === 1 
                ? "Create a safe space for yourself today." 
                : `We sent a code to ${form.email}`
              }
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2 animate-pulse">
               <span className="block h-1.5 w-1.5 rounded-full bg-red-600"/> {error}
            </div>
          )}

          {/* --- STEP 1: Registration Form --- */}
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D2A26]" htmlFor="name">Username</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]"><User size={18} /></div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Sarah Mitchell"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-4 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D2A26]" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]"><Mail size={18} /></div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-4 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D2A26]" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]"><Lock size={18} /></div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-12 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877D] hover:text-[#2D2A26]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D2A26]" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]"><Lock size={18} /></div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-12 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-[#173F3A] py-3.5 text-white shadow-lg transition-all hover:bg-[#0F2926] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
                  ) : (
                    <>Get Started <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
                  )}
                </span>
              </button>
            </form>
          )}

          {/* --- STEP 2: OTP Verification --- */}
          {step === 2 && (
             <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-[#2D2A26]">Enter 6-digit Code</label>
                   <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center text-3xl tracking-[1em] font-serif rounded-xl border border-[#E8E6E1] bg-white py-4 text-[#173F3A] placeholder-gray-200 outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                      placeholder="000000"
                      autoFocus
                   />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-xl bg-[#173F3A] py-3.5 text-white shadow-lg transition-all hover:bg-[#0F2926] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Login"}
                </button>

                <div className="flex items-center justify-between text-sm">
                   <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-[#5C5954] hover:text-[#173F3A] flex items-center gap-1"
                   >
                      <ArrowLeft size={14} /> Change Email
                   </button>

                   <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      className={`flex items-center gap-1 font-medium ${
                         resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#3A6B48] hover:underline'
                      }`}
                   >
                      {loading && resendTimer === 0 ? (
                         <Loader2 size={14} className="animate-spin" />
                      ) : (
                         <RefreshCw size={14} className={resendTimer > 0 ? "" : "hover:rotate-180 transition-transform"} />
                      )}
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                   </button>
                </div>
             </form>
          )}

          {/* Footer */}
          {step === 1 && (
            <div className="text-center text-sm text-[#5C5954]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#173F3A] hover:underline">
                Sign in
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* --- RIGHT SIDE: Visual (Swapped) --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#173F3A] animate-in slide-in-from-right-10 duration-700 fade-in">
        {/* <img 
          src="https://images.unsplash.com/photo-1499244571973-2e2e80326ad1?q=80&w=1974&auto=format&fit=crop" 
          alt="Peaceful horizon" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#173F3A]/30 to-[#173F3A]/90" />
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-[#E5F0EE]">
           <div className="flex justify-end">
              <div className="font-serif text-3xl font-bold tracking-tight">Solance.</div>
           </div>
           <div className="space-y-6 max-w-md ml-auto text-right">
              <blockquote className="font-serif text-4xl leading-tight">
                "It is never too late to be what you might have been."
              </blockquote>
              <cite className="block text-lg font-light opacity-80 not-italic">— George Eliot</cite>
           </div>
           <div className="text-sm opacity-60 text-right">© 2024 Solance. All rights reserved.</div>
        </div>
      </div>

    </div>
  );
};

export default SignupPage;