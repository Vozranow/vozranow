'use client';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Don't forget this import
import { User, Mail, Save, Camera, AlertCircle, Loader2, CheckCircle, Lock, ArrowLeft, LogOut } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { useAuth } from "../../context/useAuth";

const ProfilePage = () => {
  const { user, login, logout } = useAuth(); // Added logout here
  
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
      const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE); // Ensure this path matches your API_PATHS
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
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, formData); // Ensure path matches
      
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
      const res = await axiosInstance.post(API_PATHS.AUTH.VERIFY_EMAIL_OTP, { otp }); // Ensure path matches
      setStatus({ type: "success", message: "Email verified & updated!" });
      setShowOtpModal(false);
      login({ ...user, email: res.data.email }); 
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Invalid OTP" });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]"><Loader2 className="animate-spin text-[#173F3A]" /></div>;

  return (
    <div className="min-h-screen w-full bg-[#FDFCF8] p-6 md:p-12 relative">
      <div className="mx-auto max-w-5xl">
        
        {/* --- 1. Back to Dashboard Button --- */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[#8C877D] hover:text-[#173F3A] mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <h1 className="font-serif text-3xl text-[#2D2A26] mb-2">Account Settings</h1>
        <p className="text-[#5C5954] mb-8">Manage your profile and personal details.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: Sidebar / Avatar --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] text-center shadow-sm">
              <div className="relative inline-block">
                 <div className="h-24 w-24 rounded-full bg-[#173F3A] text-[#E5F0EE] flex items-center justify-center text-3xl font-serif mx-auto mb-4 border-4 border-[#E8F4F1]">
                    {formData.username?.[0]?.toUpperCase()}
                 </div>
                 <button className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
                    <Camera size={14} className="text-[#5C5954]"/>
                 </button>
              </div>
              <h2 className="font-serif text-xl text-[#2D2A26]">{formData.username}</h2>
              <p className="text-sm text-[#8C877D]">{formData.email}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-1">
                 <div className="text-xs font-semibold text-[#8C877D] uppercase tracking-wider mb-2">Member Since</div>
                 <div className="text-sm text-[#5C5954]">September 2024</div>
              </div>

              {/* --- 2. Logout Button --- */}
              <button 
                onClick={logout}
                className="w-full mt-6 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* --- RIGHT: Edit Form --- */}
          <div className="lg:col-span-8">
             <div className="bg-white p-8 rounded-2xl border border-[#E8E6E1] shadow-sm">
                <h3 className="font-serif text-lg text-[#2D2A26] mb-6 border-b border-gray-100 pb-4">
                  Personal Information
                </h3>

                {status.message && !showOtpModal && (
                   <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                      status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                   }`}>
                      {status.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                      {status.message}
                   </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                   
                   {/* Username Input */}
                   <div>
                      <label className="block text-sm font-medium text-[#2D2A26] mb-2">Username</label>
                      <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]" size={18} />
                         <input 
                            type="text" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E6E1] focus:ring-1 focus:ring-[#173F3A] focus:border-[#173F3A] outline-none text-[#2D2A26]"
                         />
                      </div>
                      <p className="text-xs text-[#8C877D] mt-2 flex items-center gap-1">
                         <Lock size={10} /> Can be changed once every 30 days.
                      </p>
                   </div>

                   {/* Email Input */}
                   <div>
                      <label className="block text-sm font-medium text-[#2D2A26] mb-2">Email Address</label>
                      <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]" size={18} />
                         <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E6E1] focus:ring-1 focus:ring-[#173F3A] focus:border-[#173F3A] outline-none text-[#2D2A26]"
                         />
                      </div>
                      <p className="text-xs text-[#8C877D] mt-2 flex items-center gap-1">
                         <Lock size={10} /> Changing this requires OTP verification (Once every 60 days).
                      </p>
                   </div>

                   {/* Action Buttons */}
                   <div className="pt-4 flex justify-end gap-4">
                      <button 
                         type="button" 
                         className="px-6 py-2.5 rounded-xl border border-[#E8E6E1] text-[#5C5954] hover:bg-gray-50 transition-colors"
                         onClick={fetchProfile} // Reset form
                      >
                         Cancel
                      </button>
                      <button 
                         type="submit" 
                         disabled={saving}
                         className="px-6 py-2.5 rounded-xl bg-[#173F3A] text-white hover:bg-[#0F2926] transition-colors flex items-center gap-2 disabled:opacity-70"
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
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                 <h3 className="font-serif text-2xl text-[#173F3A] mb-2">Verify New Email</h3>
                 <p className="text-[#5C5954] mb-6">
                    We sent a code to your <span className="font-semibold text-black">new</span> email address to authorize this change.
                 </p>
                 
                 <input 
                    type="text" 
                    placeholder="Enter OTP Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 text-center text-2xl tracking-widest border border-[#E8E6E1] rounded-xl mb-6 focus:border-[#173F3A] outline-none font-serif"
                 />
                 
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setShowOtpModal(false)}
                       className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleVerifyEmail}
                       disabled={verifying || !otp}
                       className="flex-1 py-3 rounded-xl bg-[#173F3A] text-white hover:bg-[#0F2926] disabled:opacity-70"
                    >
                       {verifying ? "Verifying..." : "Confirm Change"}
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