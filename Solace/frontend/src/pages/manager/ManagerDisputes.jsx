'use client';
import { useState, useEffect } from "react";
import { 
  Menu, Search, Eye, AlertCircle, Calendar, Clock, 
  UserX, UserCheck, CheckCircle2, X, Wallet, ShieldAlert,
  MessageSquareWarning, Check, Ban
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import NotificationPill from "../../components/layout/NotificationPill";
import ActionModal from "../../components/layout/ActionModal";
import SlideOutPanel from "../../components/layout/SlideOutPanel";
import VozranowLoader from "../../components/layout/SolanceLoader";

const ManagerDisputes = () => {
  // --- STATE ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Reusable UI State
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Resolution Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, actionType: null }); // 'approve' | 'reject'
  const [managerNote, setManagerNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DATA FETCHING ---
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_PATHS.MANAGER.GET_DISPUTES}?page=${currentPage}&limit=15`);
      setData(res.data);
    } catch (err) {
      showNotification("Failed to load active disputes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [currentPage]);

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

  // --- ACTIONS ---
  const triggerResolveModal = (actionType) => {
    setManagerNote(""); // Reset note
    setModalConfig({
      isOpen: true,
      actionType,
      title: actionType === 'approve' ? "Approve Refund" : "Reject Dispute",
      description: actionType === 'approve' 
        ? `Are you sure you want to approve this dispute? This will instantly refund ₹${selectedSession.price} to the client's wallet.`
        : "Are you sure you want to reject this dispute? The session will be marked completed and the listener will receive their standard payout.",
      confirmText: actionType === 'approve' ? "Yes, Refund Client" : "Yes, Reject Dispute",
      confirmColor: actionType === 'approve' ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-800 hover:bg-gray-900",
      icon: actionType === 'approve' ? Wallet : Ban,
      iconColor: actionType === 'approve' ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-800",
    });
  };

  const executeResolution = async () => {
    setIsProcessing(true);
    try {
      await axiosInstance.put(API_PATHS.MANAGER.RESOLVE_DISPUTE(selectedSession._id), {
        action: modalConfig.actionType,
        managerNote: managerNote || (modalConfig.actionType === 'approve' ? "Approved by management." : "Rejected by management.")
      });
      
      showNotification(`Dispute successfully ${modalConfig.actionType}ed.`);
      setModalConfig({ isOpen: false, actionType: null });
      setSelectedSession(null); // Close the slide-out
      fetchDisputes(); // Refresh the table
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to resolve dispute.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && !data) return <VozranowLoader text="Loading disputes..." />;

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] overflow-hidden relative">
      
      {/* 🟢 GLOBALS */}
      <NotificationPill notification={notification} />
      <ManagerSidebar isSidebarOpen={isSidebarOpen} />

      {/* 🟢 RESOLUTION MODAL */}
      <ActionModal 
        isOpen={modalConfig.isOpen}
        onClose={() => !isProcessing && setModalConfig({ isOpen: false, actionType: null })}
        onConfirm={executeResolution}
        isProcessing={isProcessing}
        title={modalConfig.title}
        description={modalConfig.description}
        icon={modalConfig.icon}
        confirmText={modalConfig.confirmText}
        confirmColor={modalConfig.confirmColor}
        iconColor={modalConfig.iconColor}
      >
        <div className="mb-2">
           <label className="block text-sm font-medium text-[#2D2A26] mb-2">Manager Note (Required for Audit Logs)</label>
           <textarea 
             value={managerNote}
             onChange={(e) => setManagerNote(e.target.value)}
             placeholder={`Reason for ${modalConfig.actionType}ing this dispute...`}
             className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm text-[#2D2A26]"
             rows="3"
             disabled={isProcessing}
             required
           />
        </div>
      </ActionModal>

      {/* 🟢 SLIDE-OUT PANEL: THE RESOLUTION DESK */}
      <SlideOutPanel 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
        title="Dispute Resolution Desk"
      >
        {selectedSession && (
          <div className="space-y-8 pb-10">
            
            {/* Header */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                Action Required
              </span>
              <p className="mt-3 text-[#5C5954] font-medium flex items-center justify-center gap-2">
                <Calendar size={16} /> {formatDate(selectedSession.scheduledStartAt || selectedSession.scheduledDate)}
              </p>
            </div>

            {/* THE COMPLAINT TICKET */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 flex items-center gap-2">
                <MessageSquareWarning size={14} /> Client Complaint
              </h4>
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600/80 mb-1">Issue Type</p>
                <p className="font-bold text-[#2D2A26] text-lg mb-4">{selectedSession.dispute?.reason || "Unknown Issue"}</p>
                
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600/80 mb-1">Client Notes</p>
                <p className="text-sm text-[#5C5954] italic bg-white p-3 rounded-lg border border-orange-100/50">
                  "{selectedSession.dispute?.details || "No additional details provided."}"
                </p>
              </div>
            </div>

            {/* THE HARD EVIDENCE (Attendance) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-3 flex items-center gap-2">
                <ShieldAlert size={14} /> System Evidence
              </h4>
              <div className="bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C877D]">Client ({selectedSession.userId?.username})</p>
                    <p className="font-bold text-[#2D2A26] text-xs mt-1">
                      {selectedSession.attendance?.userJoinedAt ? formatDate(selectedSession.attendance.userJoinedAt) : "--:--"}
                    </p>
                  </div>
                  {selectedSession.attendance?.userJoinedAt ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md"><UserCheck size={14}/> Joined</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-md"><UserX size={14}/> Missing</div>
                  )}
                </div>
                
                <div className="border-t border-[#E8E6E1]"></div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C877D]">Listener ({selectedSession.listenerId?.username})</p>
                    <p className="font-bold text-[#2D2A26] text-xs mt-1">
                      {selectedSession.attendance?.listenerJoinedAt ? formatDate(selectedSession.attendance.listenerJoinedAt) : "--:--"}
                    </p>
                  </div>
                  {selectedSession.attendance?.listenerJoinedAt ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md"><UserCheck size={14}/> Joined</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-md"><UserX size={14}/> Missing</div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {selectedSession.status === 'disputed' && (
               <div className="pt-6 border-t border-[#E8E6E1] space-y-3">
                 <button 
                   onClick={() => triggerResolveModal('approve')}
                   className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                 >
                   <Check size={18} /> Approve & Refund ₹{selectedSession.price}
                 </button>
                 
                 <button 
                   onClick={() => triggerResolveModal('reject')}
                   className="w-full py-3.5 border border-gray-300 text-[#5C5954] bg-white hover:bg-gray-50 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <Ban size={18} /> Reject Claim (Pay Listener)
                 </button>
               </div>
            )}

          </div>
        )}
      </SlideOutPanel>

      {/* 🟢 MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="pt-12 pb-8 px-10 shrink-0 flex items-end justify-between border-b border-transparent">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#8C877D] hover:text-[#173F3A] transition-colors">
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight">Active Disputes</h1>
              <p className="text-[#8C877D] font-medium mt-1.5 text-sm">Review client complaints, check attendance logs, and process refunds.</p>
            </div>
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
                        <th className="px-6 py-5">Reported On</th>
                        <th className="px-6 py-5">Client</th>
                        <th className="px-6 py-5">Listener</th>
                        <th className="px-6 py-5">Complaint Type</th>
                        <th className="px-6 py-5 text-center">Disputed Amount</th>
                        <th className="px-6 py-5 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F0EC]">
                      {data.disputes.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-[#8C877D] italic">
                            <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-200" />
                            No active disputes! The queue is clear.
                          </td>
                        </tr>
                      ) : (
                        data.disputes.map((session) => (
                          <tr key={session._id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-6 py-4 text-[#5C5954] whitespace-nowrap">
                              <div className="flex items-center gap-2 font-medium">
                                <Clock size={14} className="text-orange-400" />
                                {formatDate(session.dispute?.reportedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#2D2A26]">{session.userId?.username}</td>
                            <td className="px-6 py-4 text-[#5C5954]">{session.listenerId?.username || "Unassigned"}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block bg-orange-100 text-orange-800 border border-orange-200/50">
                                {session.dispute?.reason || "Other"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-[#173F3A]">
                              ₹{session.price}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => setSelectedSession(session)}
                                className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all inline-flex items-center gap-1.5 border border-orange-100"
                                title="Resolve Ticket"
                              >
                                <Eye size={14} /> View Case
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
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

export default ManagerDisputes;