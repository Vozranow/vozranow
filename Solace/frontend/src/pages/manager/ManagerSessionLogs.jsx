'use client';
import { useState, useEffect } from "react";
import { 
  Menu, Search, Eye, Video, UserX, UserCheck, 
  Clock, Calendar, AlertCircle, X, Copy, Trash2, ShieldAlert, CheckCircle2, VideoOff, PlayCircle, ExternalLink, History, AlertTriangle
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

// 🟢 OUR REUSABLE COMPONENTS
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import NotificationPill from "../../components/layout/NotificationPill";
import ActionModal from "../../components/layout/ActionModal";
import SlideOutPanel from "../../components/layout/SlideOutPanel";
import VozranowLoader from "../../components/layout/SolanceLoader";

const ManagerSessionLogs = () => {
  // --- CORE STATE ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);

  // --- REUSABLE UI STATE ---
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to page 1 whenever we do a new search
    }, 500); // Wait 500ms after they stop typing
    
    return () => clearTimeout(timer); // Clean up if they keep typing
  }, [searchInput]);

  // --- DATA FETCHING ---
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_PATHS.MANAGER.GET_SESSION_LOGS}?page=${currentPage}&limit=15&search=${debouncedSearch}`);
      setData(res.data);
    } catch (err) {
      showNotification("Failed to load session logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage , debouncedSearch]);

  // --- HELPERS ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification("Recording link copied to clipboard!", "success");
  };

  // --- ACTIONS ---
  const triggerCancelModal = (sessionId) => {
    setModalConfig({
      isOpen: true,
      title: "Force Cancel Session",
      description: "Are you sure you want to forcibly cancel this session? If the user has already paid, you may need to process a manual refund.",
      confirmText: "Cancel Session",
      confirmColor: "bg-red-600 hover:bg-red-700",
      icon: Trash2,
      iconColor: "bg-red-50 text-red-600",
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, isProcessing: true }));
        try {
          // Placeholder for your cancel endpoint: await axiosInstance.post(`/api/manager/sessions/${sessionId}/cancel`);
          showNotification("Session has been cancelled.", "success");
          fetchLogs(); // Refresh table
          setModalConfig({ isOpen: false });
          setSelectedSession(null); // Close panel if open
        } catch (error) {
          showNotification("Failed to cancel session.", "error");
          setModalConfig(prev => ({ ...prev, isProcessing: false }));
        }
      }
    });
  };

  if (loading && !data) return (
    <VozranowLoader/>
  );

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] overflow-hidden relative">
      
      {/* 🟢 GLOBAL UI COMPONENTS */}
      <NotificationPill notification={notification} />
      <ActionModal {...modalConfig} onClose={() => setModalConfig({ isOpen: false })} />
      
      <ManagerSidebar isSidebarOpen={isSidebarOpen} />

      {/* 🟢 SLIDE-OUT DEEP DIVE PANEL */}
      {/* 🟢 SLIDE-OUT DEEP DIVE PANEL */}
      <SlideOutPanel 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
        title="Session Audit"
      >
        {selectedSession && (
          <div className="space-y-8 pb-10">
            {/* Status Header */}
            <div className="text-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${selectedSession.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                  selectedSession.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                {selectedSession.status}
              </span>
              <p className="mt-3 text-[#5C5954] font-medium flex items-center justify-center gap-2">
                <Calendar size={16} /> {formatDate(selectedSession.scheduledStartAt || selectedSession.preferredTimeStart || selectedSession.scheduledDate)}
              </p>
            </div>

            {/* Attendance Box */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3">Attendance</h4>
              <div className="bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C877D]">Client</p>
                    <p className="font-bold text-[#2D2A26] capitalize">{selectedSession.userId?.username || "Unknown"}</p>
                  </div>
                  {selectedSession.attendance?.userJoinedAt ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold"><UserCheck size={18}/> Joined</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><UserX size={18}/> No-Show</div>
                  )}
                </div>
                <div className="border-t border-[#E8E6E1]"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C877D]">Listener</p>
                    <p className="font-bold text-[#2D2A26] capitalize">{selectedSession.listenerId?.username || "Unknown"}</p>
                  </div>
                  {selectedSession.attendance?.listenerJoinedAt ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold"><UserCheck size={18}/> Joined</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><UserX size={18}/> No-Show</div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Ledger */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3">Financial Split</h4>
              <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-[#5C5954]">Total Paid by Client</span>
                  <span className="font-bold text-[#2D2A26]">₹{selectedSession.price || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-red-500">
                  <span className="text-sm">Platform Fee (80%)</span>
                  <span className="font-medium">- ₹{selectedSession.platformFee || 0}</span>
                </div>
                <div className="border-t border-[#E8E6E1] pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#173F3A]">Listener Payout (20%)</span>
                  <span className="font-bold text-[#173F3A] text-lg">₹{selectedSession.listenerPayout || 0}</span>
                </div>
              </div>
            </div>

            {/* --- SESSION RECORDING --- */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 flex items-center gap-2">
                <Video size={14} /> Session Recording
              </h4>
              <div className="bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl p-4 shadow-sm">
                {selectedSession.recordingUrl ? (
                  <div className="space-y-3">
                    <a 
                      href={selectedSession.recordingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm font-medium text-[#173F3A] hover:text-[#0F2926]"
                    >
                      <span className="flex items-center gap-2">
                        <PlayCircle size={18} className="text-emerald-600" />
                        View Recording
                      </span>
                      <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => copyToClipboard(selectedSession.recordingUrl)}
                      className="w-full py-2.5 text-xs font-bold text-[#5C5954] bg-[#F1F0EC] hover:bg-[#E8E6E1] rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <Copy size={14} /> Copy URL
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                    <VideoOff size={16} className="text-gray-400" />
                    {selectedSession.status === 'completed' 
                      ? "No recording saved (Potential Dispute Risk)" 
                      : "Session was not completed, no recording available."}
                  </div>
                )}
              </div>
            </div>

            {/* --- DISPUTE / REFUND DETAILS --- */}
            {(selectedSession.dispute?.reason || selectedSession.refund) && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> Resolution Details
                </h4>
                <div className={`border rounded-xl p-4 shadow-sm ${selectedSession.status === 'refunded' ? 'bg-purple-50 border-purple-100' : 'bg-orange-50 border-orange-100'}`}>
                  {selectedSession.dispute?.reason && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Client Complaint</p>
                      <p className="text-sm font-medium text-gray-800">"{selectedSession.dispute.reason}" - {selectedSession.dispute.details}</p>
                    </div>
                  )}
                  {selectedSession.dispute?.managerNote && (
                    <div className="pt-3 border-t border-gray-200/50">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Manager Note</p>
                      <p className="text-sm text-gray-700 italic">"{selectedSession.dispute.managerNote}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- THE MASTER TIMELINE --- */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-4 flex items-center gap-2">
                <History size={14} /> Audit Timeline
              </h4>
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {selectedSession.timeline?.map((event, idx) => (
                  <div key={idx} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${
                      event.status === 'created' ? 'bg-blue-400' :
                      event.status === 'assigned' ? 'bg-amber-400' :
                      event.status === 'disputed' ? 'bg-orange-500' :
                      event.status === 'refunded' ? 'bg-purple-500' :
                      event.status === 'completed' ? 'bg-emerald-500' :
                      'bg-gray-400'
                    }`} />
                    
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#5C5954] uppercase tracking-wider">
                        {event.status}
                      </span>
                      <span className="text-[10px] text-gray-400 mb-1">
                        {new Date(event.time).toLocaleString('en-US', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                      <span className="text-sm text-[#2D2A26] bg-gray-50 px-3 py-2 rounded-lg inline-block mt-1 border border-gray-200 shadow-sm">
                        {event.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            {selectedSession.status === 'pending' && (
               <div className="pt-6 border-t border-[#E8E6E1]">
                 <button 
                   onClick={() => triggerCancelModal(selectedSession._id)}
                   className="w-full py-3 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <Trash2 size={18} /> Force Cancel Session
                 </button>
               </div>
            )}

          </div>
        )}
      </SlideOutPanel>

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
              <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight">Session Logs</h1>
              <p className="text-[#8C877D] font-medium mt-1.5 text-sm">Audit platform interactions, financials, and recordings.</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8C877D]" size={18} />
            <input 
              type="text" 
              placeholder="Search by username.." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[#E8E6E1] rounded-xl text-sm focus:outline-none focus:border-[#173F3A] shadow-sm w-64 transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-12 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-[1400px] mx-auto">
            {data && (
              <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FDFCF8] text-[#8C877D] text-[10px] uppercase tracking-wider font-bold border-b border-[#E8E6E1]">
                      <tr>
                        <th className="px-6 py-5">Date & Time</th>
                        <th className="px-6 py-5">Listener</th>
                        <th className="px-6 py-5">Client</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-6 py-5 text-center">Recording</th>
                        <th className="px-6 py-5 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F0EC]">
                      {data.logs.map((session) => (
                        <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-[#5C5954] whitespace-nowrap">
                            <div className="flex items-center gap-2 font-medium">
                              <Clock size={14} className="text-[#8C877D]" />
                              {session.scheduledStartAt
                                ? new Date(session.scheduledStartAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : new Date(session.scheduledDate).toLocaleDateString() 
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#2D2A26] capitalize">{session.listenerId?.username || "N/A"}</td>
                          <td className="px-6 py-4 text-[#5C5954] capitalize">{session.userId?.username || "N/A"}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block
                              ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                session.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                            `}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {session.recordingUrl ? (
                              <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg inline-flex items-center justify-center" title="Recording Available">
                                <Video size={16} />
                              </span>
                            ) : (
                              <span className="text-gray-300 font-bold">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedSession(session)}
                              className="p-2 text-[#8C877D] hover:text-[#173F3A] hover:bg-[#E8F4F1] rounded-lg transition-all inline-flex"
                              title="View Deep Dive"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 🟢 NEW: Pagination Controls */}
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

export default ManagerSessionLogs;