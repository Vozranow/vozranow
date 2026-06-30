'use client';
import { useState, useEffect } from "react";
import { 
  Users, UserPlus,  Star, Ban, Mail, 
ShieldCheck, Clock
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

// Components
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import VozranowLoader from "../../components/layout/SolanceLoader";
import AddStaffModal from "../../components/layout/AddStaffModal"; 
import NotificationPill from "../../components/layout/NotificationPill"; 

const ManagerDirectory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // 🟢 Custom Notification State
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_PATHS.MANAGER.GET_LISTENERS}?page=${currentPage}&limit=10`);
      setData(res.data);
    } catch (err) {
      showNotification("Failed to load staff directory.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [currentPage]);

  const handleBanListener = async (listenerId) => {
    if (!window.confirm("Are you sure you want to permanently ban this listener?")) return;
    try {
      await axiosInstance.put(API_PATHS.MANAGER.BAN_LISTENER(listenerId));
      showNotification("Listener has been banned and forced offline.", "success");
      fetchDirectory(); // Refresh list
    } catch (err) {
      showNotification("Failed to ban listener.", "error");
    }
  };

  if (loading && !data) return <VozranowLoader />;

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] overflow-hidden relative">
      
      {/* 🟢 GLOBAL UI COMPONENTS */}
      <NotificationPill notification={notification} />
      
      <ManagerSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 🟢 THE ADD STAFF MODAL */}
      <AddStaffModal 
        isOpen={isAddStaffOpen} 
        onClose={() => setIsAddStaffOpen(false)} 
        onStaffAdded={() => {
          showNotification("Staff account created successfully!", "success");
          fetchDirectory();
        }} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="pt-12 pb-8 px-10 shrink-0 flex items-end justify-between border-b border-[#E8E6E1]">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight flex items-center gap-3">
              <Users size={28} /> Staff Directory
            </h1>
            <p className="text-[#8C877D] font-medium mt-1.5 text-sm">
              Manage your platform listeners, admins, and access privileges.
            </p>
          </div>
          
          <button 
            onClick={() => setIsAddStaffOpen(true)}
            className="px-6 py-3 bg-[#173F3A] text-white rounded-xl font-bold text-sm hover:bg-[#0F2926] transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={18} /> Add New Staff
          </button>
        </header>

        {/* Directory Table */}
        <div className="flex-1 overflow-y-auto px-10 pb-12 pt-8 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-[1400px] mx-auto">
            {data && data.directory && data.directory.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FDFCF8] text-[#8C877D] text-[10px] uppercase tracking-wider font-bold border-b border-[#E8E6E1]">
                      <tr>
                        <th className="px-6 py-5">Staff Member</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Performance</th>
                        <th className="px-6 py-5">Earnings</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F0EC]">
                      {data.directory.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                          
                          {/* Name & Email */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-[#E8F4F1] text-[#173F3A] rounded-full flex items-center justify-center font-bold text-lg">
                                {staff.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#2D2A26] capitalize">{staff.name}</p>
                                <p className="text-xs text-[#8C877D] flex items-center gap-1 mt-0.5">
                                  <Mail size={12} /> {staff.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {staff.isBanned ? (
                              <span className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-red-100 flex items-center gap-1 w-fit">
                                <Ban size={12} /> Banned
                              </span>
                            ) : staff.isOnline ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-100 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-200 flex items-center gap-1 w-fit">
                                <Clock size={12} /> Offline
                              </span>
                            )}
                          </td>

                          {/* Performance Stats */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm font-bold text-[#2D2A26]">
                                {staff.sessionsCompleted} <span className="text-xs font-normal text-[#8C877D]">Sessions</span>
                              </span>
                              <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                                <Star size={12} className="fill-amber-500" /> 
                                {staff.averageRating > 0 ? staff.averageRating.toFixed(1) : "New"}
                              </span>
                            </div>
                          </td>

                          {/* Financials */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-[#173F3A]">
                              ₹{(staff.revenueGenerated || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            {!staff.isBanned && (
                              <button 
                                onClick={() => handleBanListener(staff.id)}
                                className="p-2 text-[#8C877D] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all inline-flex"
                                title="Ban Listener"
                              >
                                <Ban size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {data.pagination.totalPages > 1 && (
                  <div className="p-4 border-t border-[#E8E6E1] flex items-center justify-between bg-[#FDFCF8]/50">
                    <p className="text-xs font-bold text-[#8C877D]">
                      Showing Page {data.pagination.currentPage} of {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold text-[#5C5954] bg-white border border-[#E8E6E1] rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={currentPage === data.pagination.totalPages}
                        className="px-4 py-2 text-xs font-bold text-[#5C5954] bg-white border border-[#E8E6E1] rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={48} className="text-[#E8F4F1] mb-4" />
                <h3 className="font-serif text-xl text-[#2D2A26] mb-2">No Staff Found</h3>
                <p className="text-[#8C877D] text-sm">Click the button above to start onboarding listeners.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDirectory;