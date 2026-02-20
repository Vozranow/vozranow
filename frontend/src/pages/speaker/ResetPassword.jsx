'use client';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract token from URL (e.g., ?token=xyz)
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Redirect if no token is present
  useEffect(() => {
    if (!token) {
      setStatus({ type: "error", message: "Invalid or missing reset token." });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        token: token,
        newPassword: form.newPassword
      });

      setStatus({ type: "success", message: "Password reset successfully!" });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Failed to reset password. Link may be expired." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDFCF8] overflow-hidden">
      
      {/* --- LEFT SIDE: Visual --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#173F3A]">
        <img 
          src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1974&auto=format&fit=crop" 
          alt="Light opening" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#173F3A]/30 to-[#173F3A]/90" />
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-[#E5F0EE]">
           <div className="font-serif text-3xl font-bold tracking-tight">Solance.</div>
           <div className="space-y-6 max-w-md">
              <blockquote className="font-serif text-4xl leading-tight">
                "Every fresh beginning comes from some other beginning's end."
              </blockquote>
              <cite className="block text-lg font-light opacity-80 not-italic">— Seneca</cite>
           </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-serif text-4xl text-[#2D2A26]">Reset Password</h1>
            <p className="text-[#5C5954]">
              Choose a new password to secure your account.
            </p>
          </div>

          {status.type === 'success' ? (
             <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-2xl border border-green-100 text-center animate-in fade-in zoom-in">
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-serif text-[#173F3A] mb-2">All Set!</h3>
                <p className="text-[#5C5954]">Your password has been updated. Redirecting to login...</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Token Error Warning */}
              {!token && (
                 <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    Error: No reset token found in URL. Please use the link from your email.
                 </div>
              )}

              {/* Password Fields */}
              <div className="space-y-4">
                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]"><Lock size={18} /></div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      required
                      disabled={!token}
                      className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-12 text-[#2D2A26] outline-none focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] disabled:opacity-50"
                      value={form.newPassword}
                      onChange={(e) => setForm({...form, newPassword: e.target.value})}
                    />
                 </div>

                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]"><Lock size={18} /></div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      required
                      disabled={!token}
                      className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-12 text-[#2D2A26] outline-none focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] disabled:opacity-50"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877D] hover:text-[#2D2A26]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>

              {status.type === 'error' && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="group relative w-full overflow-hidden rounded-xl bg-[#173F3A] py-3.5 text-white shadow-lg transition-all hover:bg-[#0F2926] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Updating...</>
                  ) : (
                    <>Reset Password <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>
                  )}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;