'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, ShieldCheck, 
  LogOut, Loader2, AlertTriangle, Lock, Award, Briefcase
} from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { useAuth } from "../../context/useAuth";
import VozranowLoader from "../../components/layout/SolanceLoader";

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.PROFILE);
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load your account settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
      if (logout) logout(); 
      navigate("/login", { replace: true });
    } catch (err) {
      if (logout) logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <VozranowLoader/>
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] space-y-4">
        <AlertTriangle size={40} className="text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-[#173F3A] hover:underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FDFCF8] flex flex-col relative">
      <div className="flex-1 p-6 md:p-12">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="flex items-center gap-2 text-[#8C877D] hover:text-[#173F3A] transition-colors font-medium text-sm w-fit"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            
            <div className="border-b border-[#E8E6E1] pb-6">
              <h1 className="font-serif text-3xl md:text-4xl text-[#2D2A26]">Admin Profile</h1>
              <p className="text-[#5C5954] mt-2">View your system details and platform impact.</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: IDENTIFICATION CARD */}
            <div className="md:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8E6E1] flex flex-col items-center text-center">
                
                {/* Clean, un-editable Avatar */}
                <div className="mb-6 h-28 w-28 bg-[#173F3A] rounded-full flex items-center justify-center text-white font-serif text-5xl font-medium shadow-md">
                  {profile?.name?.charAt(0).toUpperCase() || 'A'}
                </div>

                <div className="mb-8 w-full border-b border-gray-100 pb-8">
                  <h3 className="font-serif text-2xl text-[#2D2A26]">{profile?.name}</h3>
                  <p className="text-sm text-[#8C877D] mt-1">{profile?.email}</p>
                  
                  {/* Admin Badge */}
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-[#E8F4F1] text-[#3A6B48] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} /> System Admin
                  </div>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 group"
                >
                  {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                  Secure Sign Out
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: LOCKED DETAILS & STATS */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Manager Disclaimer Banner */}
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 text-lg">Managed Account</h4>
                  <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    {profile?.securityNote || "Your credentials and profile details are securely managed by the System Manager. If you need to update your name or password, please contact them directly."}
                  </p>
                </div>
              </div>

              {/* Locked Information Panel */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E8E6E1] space-y-8">
                <h2 className="font-serif text-2xl text-[#2D2A26] border-b border-gray-100 pb-4">Personal Details</h2>

                <div className="space-y-6">
                  {/* Locked Field: Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wide flex items-center gap-1.5">
                      <User size={14} /> Full Name
                    </label>
                    <div className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-xl text-[#5C5954] flex justify-between items-center cursor-not-allowed">
                      <span className="font-medium">{profile?.name}</span>
                      <Lock size={16} className="text-gray-300" />
                    </div>
                  </div>

                  {/* Locked Field: Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wide flex items-center gap-1.5">
                      <Mail size={14} /> Email Address
                    </label>
                    <div className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-xl text-[#5C5954] flex justify-between items-center cursor-not-allowed">
                      <span className="font-medium">{profile?.email}</span>
                      <Lock size={16} className="text-gray-300" />
                    </div>
                  </div>
                  
                  {/* Locked Field: Role */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wide flex items-center gap-1.5">
                      <Briefcase size={14} /> Assigned Role
                    </label>
                    <div className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-xl text-[#5C5954] flex justify-between items-center cursor-not-allowed">
                      <span className="font-medium capitalize">{profile?.role}</span>
                      <Lock size={16} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact / Stats Panel */}
              <div className="bg-[#173F3A] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-[#0F2926]">
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-[#E8F4F1] rounded-full opacity-10 blur-2xl" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-[#A3C6C0] font-medium flex items-center gap-2 mb-1">
                      <Award size={20} /> Your Platform Impact
                    </h3>
                    <p className="font-serif text-3xl md:text-4xl text-white">
                      {profile?.stats?.totalAssignedSessions || 0}
                    </p>
                    <p className="text-sm text-[#A3C6C0] mt-2">Lifetime successful session assignments.</p>
                  </div>
                  
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <User size={32} className="text-[#E8F4F1]" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;