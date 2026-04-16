'use client';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, LogOut, User, Calendar, 
  Clock, CheckCircle2, Loader2 
} from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";
import VozranowLoader from "../../components/layout/SolanceLoader";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ListenerProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Assuming you have this from context

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        
        const res = await axiosInstance.get(API_PATHS.LISTENER.DASHBOARD);
        const { user, availability, profile } = res.data; // Adjust based on your actual response structure
        
        // Use the 'profile' object if your backend sends it separately, 
        // otherwise check where 'bio' and 'preferredDays' live in your response.
        // Based on previous code, it might be in 'overview' or root.
        // Let's assume the backend sends `profile: { bio, preferredDays }` inside dashboard response
        // OR we fetch from a dedicated /profile endpoint if you made one.
        
        // Fallback if data is structured differently:
        const bioData = res.data.profile?.bio || res.data.bio || "";
        const daysData = res.data.availability?.preferredDays || [];

        setUser(res.data.user);
        setBio(bioData);
        setSelectedDays(daysData);

      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle Day Toggle
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(prev => prev.filter(d => d !== day));
    } else {
      setSelectedDays(prev => [...prev, day]);
    }
  };

  // Save Changes
  const handleSave = async () => {
    setSaving(true);
    try {
     
      await axiosInstance.put(API_PATHS.LISTENER.UPDATE_PROFILE, {
        bio,
        preferredDays: selectedDays
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // 4️⃣ Handle Logout
  const handleLogout = () => {
    logout(); 
    navigate("/login");
    toast.success("Logged out successfully");
  };

  if (loading) return <VozranowLoader/>

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-6 md:p-10 font-sans text-[#2D2A26]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/listener/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#173F3A] transition-colors"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-serif text-[#173F3A]">Profile Settings</h1>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E1] overflow-hidden">
          
          {/* User Info Section */}
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 bg-[#F8FAFC]">
            <div className="h-24 w-24 rounded-full bg-[#173F3A] text-[#E8F4F1] flex items-center justify-center text-4xl font-serif border-4 border-white shadow-md">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#2D2A26]">{user?.username}</h2>
              <p className="text-[#5C5954]">{user?.email}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F4F1] text-[#173F3A]">
                 Verified Listener <CheckCircle2 size={12} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* 📝 BIO EDITOR */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <User size={16} /> About You (Bio)
              </label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your experience or approach to listening..."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A] outline-none transition-all resize-none text-sm leading-relaxed"
              />
              <p className="text-xs text-gray-400 text-right">{bio.length}/500 chars</p>
            </div>

            {/* 📅 SCHEDULE EDITOR */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={16} /> Availability Schedule
              </label>
              <p className="text-sm text-[#5C5954] mb-2">Select the days you are typically available to take sessions.</p>
              
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2
                        ${isSelected 
                          ? 'bg-[#173F3A] text-white border-[#173F3A] shadow-md scale-105' 
                          : 'bg-white text-gray-400 border-gray-200 hover:border-[#173F3A] hover:text-[#173F3A]'
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              
              {/* Sign Out (Red) */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <LogOut size={18} /> Sign Out
              </button>

              {/* Save (Green) */}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#173F3A] text-white px-8 py-3 rounded-xl hover:bg-[#0F2926] transition-all shadow-lg shadow-[#173F3A]/20 disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ListenerProfile;