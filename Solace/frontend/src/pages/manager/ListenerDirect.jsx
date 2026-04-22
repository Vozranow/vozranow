'use client';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { 
  LayoutDashboard, Users, ShieldAlert, LogOut, Headphones, Activity,
  Calendar, CheckCircle2, AlertCircle, Menu, CreditCard, 
  Eye, Trash2, Star, X, MessageSquare // Removed Search icon
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import ManagerSidebar from "../../components/layout/ManagerSidebar"; 
import VozranowLoader from "../../components/layout/SolanceLoader";

const ListenerDirectory = () => {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Notifications
  const [profileModal, setProfileModal] = useState({ isOpen: false, listener: null });
  const [banModal, setBanModal] = useState({ isOpen: false, listenerId: null, listenerName: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [processingId, setProcessingId] = useState(null);

  // --- DATA FETCHING ---
  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/manager/directory/listeners?page=${currentPage}&limit=10`);
      setData(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch directory", err);
      setError("Failed to load listener directory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [currentPage]);

  // --- HELPERS ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  // --- ACTIONS ---
  const executeBan = async () => {
    const { listenerId } = banModal;
    setBanModal({ isOpen: false, listenerId: null, listenerName: '' });
    setProcessingId(listenerId);
    
    try {
      await axiosInstance.put(`/api/manager/directory/listeners/${listenerId}/ban`);
      await fetchDirectory(); // Refresh the list
      showNotification('Listener has been successfully banned and taken offline.');
    } catch (err) {
      showNotification('Failed to ban listener. Please check logs.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !data) return (
    <VozranowLoader/>
  );

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] overflow-hidden selection:bg-[#173F3A] selection:text-white relative">
      
      {/* CUSTOM NOTIFICATION PILL */}
      {notification.show && (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-[#173F3A] text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium tracking-wide">{notification.message}</span>
        </div>
      )}

      {/* BAN CONFIRMATION MODAL */}
      {banModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2A26]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2D2A26]">Ban Listener</h3>
                  <p className="text-sm font-medium text-[#8C877D] mt-0.5">Revoke access for {banModal.listenerName}</p>
                </div>
              </div>
            </div>
            <p className="text-[#5C5954] text-sm leading-relaxed mb-8">
              Are you sure you want to permanently ban this listener? They will be instantly logged out, removed from the client search directory, and blocked from future logins.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBanModal({ isOpen: false, listenerId: null, listenerName: '' })}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#5C5954] bg-[#F1F0EC] hover:bg-[#E8E6E1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeBan}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW PROFILE MODAL */}
      {profileModal.isOpen && profileModal.listener && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#2D2A26]/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white h-full w-full max-w-md shadow-2xl animate-in slide-in-from-right overflow-y-auto">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E6E1] flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#173F3A] font-serif">Listener Profile</h3>
              <button 
                onClick={() => setProfileModal({ isOpen: false, listener: null })}
                className="p-2 hover:bg-[#F1F0EC] rounded-full text-[#8C877D] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {/* Profile Card */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-24 w-24 rounded-full bg-[#173F3A] text-white flex items-center justify-center text-3xl font-serif mb-4 shadow-inner">
                  {profileModal.listener.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-[#2D2A26] capitalize">{profileModal.listener.name}</h2>
                <p className="text-[#8C877D] text-sm mt-1">{profileModal.listener.email}</p>
                <div className="mt-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${profileModal.listener.isBanned ? 'bg-red-100 text-red-700' : profileModal.listener.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {profileModal.listener.isBanned ? 'Banned' : profileModal.listener.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 border-b border-[#E8E6E1] pb-2">Biography</h4>
                <p className="text-sm text-[#5C5954] leading-relaxed bg-[#FDFCF8] p-4 rounded-xl border border-[#E8E6E1]">
                  {profileModal.listener.bio || "No biography provided by listener."}
                </p>
              </div>

              {/* Working Days */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 border-b border-[#E8E6E1] pb-2">Schedule</h4>
                <div className="flex flex-wrap gap-2">
                  {profileModal.listener.preferredDays?.length > 0 ? (
                    profileModal.listener.preferredDays.map(day => (
                      <span key={day} className="px-3 py-1.5 bg-[#E8F4F1] text-[#173F3A] text-xs font-bold rounded-lg border border-[#173F3A]/20">
                        {day}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#8C877D]">No schedule set.</span>
                  )}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 border-b border-[#E8E6E1] pb-2 flex items-center gap-2">
                  <MessageSquare size={14}/> Recent Feedback
                </h4>
                {profileModal.listener.recentReviews?.length > 0 ? (
                  <div className="space-y-4">
                    {profileModal.listener.recentReviews.map((review, idx) => (
                      <div key={idx} className="bg-white border border-[#E8E6E1] p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex text-[#D97757]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#8C877D] font-bold uppercase tracking-wider">{formatDate(review.date)}</span>
                        </div>
                        <p className="text-sm text-[#2D2A26] italic">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8C877D] bg-[#FDFCF8] p-4 rounded-xl border border-[#E8E6E1]">No written feedback available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THE SIDEBAR */}
      <ManagerSidebar isSidebarOpen={isSidebarOpen} />

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="pt-12 pb-8 px-10 shrink-0 flex items-end justify-between border-b border-transparent">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#8C877D] hover:text-[#173F3A] transition-colors">
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight">Listener Directory</h1>
              <p className="text-[#8C877D] font-medium mt-1.5 text-sm">Manage platform talent, reviews, and access.</p>
            </div>
          </div>
          {/* SEARCH BAR COMPLETELY REMOVED FROM HERE */}
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-12 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {data && (
              <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FDFCF8] text-[#8C877D] text-[10px] uppercase tracking-wider font-bold border-b border-[#E8E6E1]">
                      <tr>
                        <th className="px-6 py-5">Listener Name</th>
                        <th className="px-6 py-5 text-center">Sessions</th>
                        <th className="px-6 py-5 text-center">Avg Rating</th>
                        <th className="px-6 py-5">Revenue Generated</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F0EC]">
                      {data.directory.map((listener) => (
                        <tr key={listener.id} className={`hover:bg-gray-50 transition-colors ${listener.isBanned ? 'opacity-60 bg-red-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-[#173F3A]/10 text-[#173F3A] flex items-center justify-center font-serif font-bold">
                                {listener.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className={`font-bold capitalize text-base ${listener.isBanned ? 'text-gray-500 line-through' : 'text-[#2D2A26]'}`}>{listener.name}</p>
                                <p className="text-[#8C877D] text-xs mt-0.5">{listener.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-[#5C5954]">{listener.sessionsCompleted}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 font-bold text-[#D97757]">
                              {listener.averageRating} <Star size={14} fill="currentColor" />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#173F3A]">${listener.revenueGenerated.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                             <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block
                                ${listener.isBanned ? 'bg-red-100 text-red-700' : listener.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}
                              `}>
                                {listener.isBanned ? 'Banned' : listener.isOnline ? 'Online' : 'Offline'}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setProfileModal({ isOpen: true, listener })}
                                className="p-2 text-[#8C877D] hover:text-[#173F3A] hover:bg-[#E8F4F1] rounded-lg transition-all"
                                title="View Profile & Reviews"
                              >
                                <Eye size={18} />
                              </button>
                              
                              {!listener.isBanned && (
                                <button 
                                  onClick={() => setBanModal({ isOpen: true, listenerId: listener.id, listenerName: listener.name })}
                                  disabled={processingId === listener.id}
                                  className="p-2 text-[#8C877D] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Ban Listener"
                                >
                                  {processingId === listener.id ? <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" /> : <Trash2 size={18} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 🟢 FULL PAGINATION UI */}
                {data.pagination.totalPages > 1 && (
                  <div className="p-4 border-t border-[#E8E6E1] flex items-center justify-between bg-[#FDFCF8]/50 mt-auto">
                    <p className="text-xs font-bold text-[#8C877D]">
                      Showing Page {data.pagination.currentPage} of {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold text-[#5C5954] bg-white border border-[#E8E6E1] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={currentPage === data.pagination.totalPages}
                        className="px-4 py-2 text-xs font-bold text-[#5C5954] bg-white border border-[#E8E6E1] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- REUSABLE SIDEBAR COMPONENT ---
const SidebarItem = ({ icon, label, active, isOpen }) => (
  <div className={`flex items-center w-full p-3.5 rounded-xl transition-all overflow-hidden group cursor-pointer
    ${active ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}
  `}>
    <div className={`shrink-0 transition-transform ${!active && 'group-hover:scale-110'}`}>{icon}</div>
    {isOpen && <span className="ml-4 text-sm font-medium tracking-wide">{label}</span>}
  </div>
);

export default ListenerDirectory;