'use client';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { User, Mail, Save, AlertCircle, Loader2, CheckCircle, Lock, ArrowLeft, LogOut } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { useAuth } from "../../context/useAuth";

const ProfilePage = () => {
  const { user, login, logout } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE); 
      setFormData({
        username: res.data.user.username,
        email: res.data.user.email
      });
    } catch (err) {
      setStatus({ type: "error", message: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, formData); 
      
      if (res.data.emailChangePending) {
        setShowOtpModal(true);
        setStatus({ type: "success", message: "Please verify your new email." });
      } else {
        setStatus({ type: "success", message: "Profile updated successfully" });
        login({ ...user, ...res.data.user }); 
      }
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.VERIFY_EMAIL_CHANGE, { otp }); 
      setStatus({ type: "success", message: "Email verified & updated!" });
      setShowOtpModal(false);
      login({ ...user, email: res.data.email }); 
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Invalid OTP" });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]"><Loader2 className="animate-spin text-[#173F3A]" size={32} /></div>;

  // Formats "2024-04-19T..." into "April 2024"
  const memberSinceDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen bg-[#F4F7F6] font-sans selection:bg-[#173F3A] selection:text-white pb-12">
      
      {/* --- 1. Hero Header --- */}
      <div className="bg-[#173F3A] text-white pt-20 pb-32 px-6 relative overflow-hidden">
        
        {/* Back Button (Frosted Glass & Absolute Top Left) */}
        <Link 
          to="/dashboard" 
          className="absolute top-6 left-6 md:left-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-medium transition-all shadow-sm z-30"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#A3C6C0]/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-[60px]"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">Account Settings</h1>
            <p className="text-[#A3C6C0] text-base md:text-lg leading-relaxed max-w-xl">
              Manage your profile, update your personal details, and securely control your account access.
            </p>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Sidebar / Avatar --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-[#E8E6E1] text-center shadow-sm">
              <div className="relative inline-block">
                 <div className="h-28 w-28 rounded-full bg-[#173F3A] text-[#E5F0EE] flex items-center justify-center text-4xl font-serif mx-auto mb-5 border-4 border-[#E8F4F1] shadow-sm">
                    {formData.username?.[0]?.toUpperCase()}
                 </div>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">{formData.username}</h2>
              <p className="text-sm text-[#8C877D] mt-1">{formData.email}</p>
              
              <div className="mt-8 pt-6 border-t border-[#E8E6E1] text-left space-y-1">
                 <div className="text-xs font-bold text-[#8C877D] uppercase tracking-wider mb-2">Member Since</div>
                 <div className="text-sm font-medium text-[#2D2A26]">{memberSinceDate}</div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={logout}
                className="w-full mt-8 py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors font-bold text-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* --- RIGHT: Edit Form --- */}
          <div className="lg:col-span-8">
             <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-[#E8E6E1] shadow-sm">
                <h3 className="font-serif text-2xl font-bold text-[#2D2A26] mb-8 border-b border-[#E8E6E1] pb-4">
                  Personal Information
                </h3>

                {status.message && !showOtpModal && (
                   <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${
                      status.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                   }`}>
                      {status.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                      <span className="text-sm font-medium">{status.message}</span>
                   </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-8">
                   
                   {/* Username Input */}
                   <div>
                      <label className="block text-sm font-bold text-[#5C5954] mb-2 uppercase tracking-wide">Username</label>
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C877D]" size={18} />
                         <input 
                            type="text" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#E8E6E1] bg-[#F8FAFC] focus:bg-white focus:ring-1 focus:ring-[#173F3A] focus:border-[#173F3A] outline-none text-[#2D2A26] font-medium transition-all"
                         />
                      </div>
                      <p className="text-xs font-medium text-[#8C877D] mt-2 flex items-center gap-1">
                         <Lock size={12} /> Can be changed once every 30 days.
                      </p>
                   </div>

                   {/* Email Input */}
                   <div>
                      <label className="block text-sm font-bold text-[#5C5954] mb-2 uppercase tracking-wide">Email Address</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C877D]" size={18} />
                         <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#E8E6E1] bg-[#F8FAFC] focus:bg-white focus:ring-1 focus:ring-[#173F3A] focus:border-[#173F3A] outline-none text-[#2D2A26] font-medium transition-all"
                         />
                      </div>
                      <p className="text-xs font-medium text-[#8C877D] mt-2 flex items-center gap-1">
                         <Lock size={12} /> Changing this requires OTP verification (Once every 60 days).
                      </p>
                   </div>

                   {/* Action Buttons */}
                   <div className="pt-6 border-t border-[#E8E6E1] flex flex-col-reverse sm:flex-row justify-end gap-4">
                      <button 
                         type="button" 
                         className="px-6 py-3.5 rounded-xl border border-[#E8E6E1] text-[#5C5954] font-bold hover:bg-gray-50 transition-colors w-full sm:w-auto"
                         onClick={fetchProfile} // Reset form
                      >
                         Cancel
                      </button>
                      <button 
                         type="submit" 
                         disabled={saving}
                         className="px-8 py-3.5 rounded-xl bg-[#173F3A] text-white font-bold hover:bg-[#0F2926] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[#173F3A]/20 w-full sm:w-auto"
                      >
                         {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                         Save Changes
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>

        {/* --- OTP MODAL --- */}
        {showOtpModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                 <div className="w-12 h-12 bg-[#E8F4F1] text-[#173F3A] rounded-full flex items-center justify-center mb-6">
                   <Mail size={24} />
                 </div>
                 <h3 className="font-serif text-3xl font-bold text-[#173F3A] mb-3">Verify New Email</h3>
                 <p className="text-[#8C877D] mb-8 leading-relaxed">
                    We sent a 6-digit code to your <span className="font-bold text-[#2D2A26]">new</span> email address to authorize this change.
                 </p>
                 
                 <input 
                    type="text" 
                    placeholder="Enter OTP Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 text-center text-3xl tracking-[0.5em] border border-[#E8E6E1] rounded-xl mb-8 focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] outline-none font-serif text-[#2D2A26] bg-[#F8FAFC] focus:bg-white transition-all"
                 />
                 
                 <div className="flex gap-4">
                    <button 
                       onClick={() => setShowOtpModal(false)}
                       className="flex-1 py-3.5 rounded-xl border border-[#E8E6E1] text-[#5C5954] font-bold hover:bg-gray-50 transition-colors"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleVerifyEmail}
                       disabled={verifying || !otp}
                       className="flex-1 py-3.5 rounded-xl bg-[#173F3A] text-white font-bold hover:bg-[#0F2926] transition-colors disabled:opacity-70 shadow-lg shadow-[#173F3A]/20"
                    >
                       {verifying ? "Verifying..." : "Confirm"}
                    </button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;