import React, { useState } from 'react';
import { UserPlus, Shield, Headphones, Mail, Lock, User, CheckCircle2, Loader2, X, Tags, Calendar } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import API_PATHS from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const AddStaffModal = ({ isOpen, onClose, onStaffAdded }) => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('listener'); // Default to listener
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    tags: 'General Support, Anxiety', // Default comma-separated tags
    preferredDays: 'Monday, Tuesday, Wednesday, Thursday, Friday' 
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up comma-separated strings into arrays for the backend
      const payload = {
        ...formData,
        role,
        tags: formData.tags.split(',').map(t => t.trim()),
        preferredDays: formData.preferredDays.split(',').map(d => d.trim())
      };

      await axiosInstance.post(API_PATHS.MANAGER.ADD_STAFF, payload);
      
      toast.success(`${role === 'admin' ? 'Admin' : 'Listener'} account created successfully!`);
      
      if (onStaffAdded) onStaffAdded(); // Refresh lists if needed
      onClose(); // Close modal
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FDFCF8] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#E8E6E1] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-[#E8F4F1] p-2 rounded-lg text-[#173F3A]">
              <UserPlus size={20} />
            </div>
            <h3 className="font-serif text-xl text-[#2D2A26]">Onboard New Staff</h3>
          </div>
          <button onClick={onClose} className="text-[#8C877D] hover:text-[#2D2A26] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-gray-200">
          <form id="add-staff-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Role Selection (The Smart Toggle) */}
            <div>
              <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wider mb-2 block">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('listener')}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all font-medium text-sm
                    ${role === 'listener' ? 'bg-[#173F3A] border-[#173F3A] text-white shadow-md' : 'bg-white border-[#E8E6E1] text-[#5C5954] hover:bg-gray-50'}`}
                >
                  <Headphones size={16} /> Listener
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all font-medium text-sm
                    ${role === 'admin' ? 'bg-[#173F3A] border-[#173F3A] text-white shadow-md' : 'bg-white border-[#E8E6E1] text-[#5C5954] hover:bg-gray-50'}`}
                >
                  <Shield size={16} /> Admin
                </button>
              </div>
            </div>

            {/* 2. Standard User Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C877D]" />
                  <input required type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Jane Doe" className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E6E1] rounded-xl focus:border-[#173F3A] outline-none transition-colors text-sm text-[#2D2A26]"/>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C877D]" />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@vozranow.app" className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E6E1] rounded-xl focus:border-[#173F3A] outline-none transition-colors text-sm text-[#2D2A26]"/>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wider">Temporary Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C877D]" />
                  <input required type="text" name="password" value={formData.password} onChange={handleChange} placeholder="TempPass123!" className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E6E1] rounded-xl focus:border-[#173F3A] outline-none transition-colors text-sm text-[#2D2A26]"/>
                </div>
              </div>
            </div>

            {/* 3. LISTENER ONLY FIELDS */}
            {role === 'listener' && (
              <div className="p-4 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones size={16} className="text-[#173F3A]" />
                  <h4 className="text-sm font-bold text-[#173F3A]">Listener Configuration</h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8C877D] uppercase tracking-wider flex items-center gap-1.5"><Tags size={12}/> Specialties (Comma separated)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg focus:border-[#173F3A] outline-none transition-colors text-sm text-[#5C5954]"/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#8C877D] uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12}/> Working Days (Comma separated)</label>
                  <input type="text" name="preferredDays" value={formData.preferredDays} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-[#E8E6E1] rounded-lg focus:border-[#173F3A] outline-none transition-colors text-sm text-[#5C5954]"/>
                </div>
              </div>
            )}
            
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E6E1] bg-white flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-bold text-[#5C5954] hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-staff-form" 
            disabled={loading}
            className="px-6 py-2.5 bg-[#173F3A] text-white text-sm font-bold rounded-xl hover:bg-[#0F2926] transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddStaffModal;