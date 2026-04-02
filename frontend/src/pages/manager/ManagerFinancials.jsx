'use client';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { 
  LayoutDashboard, Users, ShieldAlert, LogOut, Headphones, Activity,
  DollarSign, Wallet, Calendar, ChevronDown, ChevronUp, 
  CheckCircle2, Clock, Search, AlertCircle, ArrowRight, Menu, CreditCard, X
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import SolanceLoader from "../../components/layout/SolanceLoader";
const ManagerFinancials = () => {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  
  // Time-Boxing Controls
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  
  // Pagination & UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // 🟢 NEW: Custom Notification & Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, listenerId: null, listenerName: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // --- DATA FETCHING ---
  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${API_PATHS.MANAGER.GET_FINANCIALS}?month=${targetMonth}&year=${targetYear}&page=${currentPage}&limit=10`
      );
      setData(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch financials", err);
      setError("Failed to load financial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [targetMonth, targetYear, currentPage]);

  // --- CUSTOM NOTIFICATION HELPER ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000); // Auto-hide after 4s
  };

  // --- THE PAYOUT ACTIONS ---
  
  // 1. Opens the Custom Confirmation Modal
  const initiatePayout = (listenerId, listenerName, e) => {
    e.stopPropagation(); 
    setConfirmModal({ isOpen: true, listenerId, listenerName });
  };

  // 2. Executes the API Call after Confirmation
  const executePayout = async () => {
    const { listenerId } = confirmModal;
    setConfirmModal({ isOpen: false, listenerId: null, listenerName: '' }); // Close Modal
    setProcessingId(listenerId); // Start Spinner
    
    try {
      await axiosInstance.put(`${API_PATHS.MANAGER.PROCESS_PAYOUT}/${listenerId}`, {
        month: targetMonth,
        year: targetYear
      });
      await fetchFinancials();
      showNotification('Payout successfully processed and recorded.');
    } catch (err) {
      showNotification('Failed to process payout. Please check the server logs.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading && !data) return (
    <SolanceLoader/>
  );

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] overflow-hidden selection:bg-[#173F3A] selection:text-white relative">
      
      {/* 🟢 CUSTOM NOTIFICATION PILL */}
      {notification.show && (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-[#173F3A] text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium tracking-wide">{notification.message}</span>
        </div>
      )}

      {/* 🟢 CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2A26]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-[#D97757] rounded-full">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2D2A26]">Confirm Payout</h3>
                  <p className="text-sm font-medium text-[#8C877D] mt-0.5">For {confirmModal.listenerName}</p>
                </div>
              </div>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, listenerId: null, listenerName: '' })}
                className="text-[#8C877D] hover:text-[#2D2A26] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[#5C5954] text-sm leading-relaxed mb-8">
              Are you sure you want to mark this listener's sessions as paid? This will permanently update their ledger and transfer the funds from pending liabilities. 
              <br/><br/>
              <span className="font-bold text-[#2D2A26]">Note:</span> This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, listenerId: null, listenerName: '' })}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#5C5954] bg-[#F1F0EC] hover:bg-[#E8E6E1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executePayout}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#173F3A] hover:bg-[#112F2A] transition-colors shadow-md flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> Process Payout
              </button>
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
              <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight">Financials & Payouts</h1>
              <p className="text-[#8C877D] font-medium mt-1.5 text-sm">Manage platform revenue and listener payroll.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white border border-[#E8E6E1] p-2 rounded-xl shadow-sm">
            <Calendar size={18} className="text-[#8C877D] ml-2" />
            <select 
              className="bg-transparent text-sm font-bold text-[#2D2A26] focus:outline-none cursor-pointer"
              value={targetMonth}
              onChange={(e) => { setTargetMonth(parseInt(e.target.value)); setCurrentPage(1); }}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <span className="text-[#E8E6E1]">|</span>
            <select 
              className="bg-transparent text-sm font-bold text-[#2D2A26] focus:outline-none cursor-pointer pr-2"
              value={targetYear}
              onChange={(e) => { setTargetYear(parseInt(e.target.value)); setCurrentPage(1); }}
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
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
              <>
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-sm flex items-center justify-between hover:border-[#173F3A]/30 transition-all">
                    <div>
                      <h4 className="text-[#8C877D] text-xs font-bold uppercase tracking-wider mb-2">Net Platform Profit</h4>
                      <span className="text-4xl font-bold text-[#173F3A]">${data.kpis.platformProfitForPeriod.toLocaleString()}</span>
                      <p className="text-xs text-[#8C877D] font-medium mt-2">Revenue from {targetMonth}/{targetYear} sessions</p>
                    </div>
                    <div className="p-4 bg-[#E8F4F1] rounded-2xl text-[#173F3A] shadow-inner">
                      <DollarSign size={28} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-sm flex items-center justify-between hover:border-[#D97757]/30 transition-all">
                    <div>
                      <h4 className="text-[#8C877D] text-xs font-bold uppercase tracking-wider mb-2">Pending Liabilities</h4>
                      <span className="text-4xl font-bold text-[#D97757]">${data.kpis.totalLiabilityForPeriod.toLocaleString()}</span>
                      <p className="text-xs text-[#8C877D] font-medium mt-2">Money owed to listeners for {targetMonth}/{targetYear}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-2xl text-[#D97757] shadow-inner">
                      <Wallet size={28} />
                    </div>
                  </div>
                </div>

                {/* ACTIONABLE PAYOUT QUEUE */}
                <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#E8E6E1] flex justify-between items-center bg-[#FDFCF8]/50">
                    <div>
                      <h3 className="text-lg font-bold text-[#2D2A26]">Pending Payouts Queue</h3>
                      <p className="text-xs text-[#8C877D] mt-1">Listeners waiting to be paid for this period.</p>
                    </div>
                    <span className="bg-orange-100 text-[#D97757] text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                      {data.payoutQueue.length} Pending
                    </span>
                  </div>

                  {data.payoutQueue.length === 0 ? (
                    <div className="p-12 text-center text-[#8C877D] flex flex-col items-center">
                      <CheckCircle2 size={48} className="text-[#173F3A] opacity-20 mb-4" />
                      <p className="font-bold text-[#2D2A26]">All caught up!</p>
                      <p className="text-sm mt-1">There are no pending payouts for this time period.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8E6E1]">
                      {data.payoutQueue.map((listener) => (
                        <div key={listener.listenerId} className="group">
                          <div 
                            onClick={() => setExpandedRowId(expandedRowId === listener.listenerId ? null : listener.listenerId)}
                            className="p-5 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-6 flex-1">
                              <div className="flex-1">
                                <h4 className="font-bold text-[#2D2A26] capitalize text-base">{listener.listenerName}</h4>
                                <p className="text-xs font-medium text-[#8C877D] mt-1">
                                  Lifetime Paid: <span className="text-[#173F3A] font-bold">${listener.lifetimePaidOut.toLocaleString()}</span>
                                </p>
                              </div>
                              <div className="w-32 text-center">
                                <span className="block text-[10px] font-bold text-[#8C877D] uppercase tracking-wider mb-1">Sessions</span>
                                <span className="font-bold text-[#2D2A26]">{listener.sessionCountInPeriod}</span>
                              </div>
                              <div className="w-32 text-right">
                                <span className="block text-[10px] font-bold text-[#8C877D] uppercase tracking-wider mb-1">Owed</span>
                                <span className="font-bold text-lg text-[#D97757]">${listener.periodOwed.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 ml-8 pl-8 border-l border-[#E8E6E1]">
                              <button 
                                onClick={(e) => initiatePayout(listener.listenerId, listener.listenerName, e)} // 🟢 Now opens custom modal
                                disabled={processingId === listener.listenerId}
                                className="bg-[#173F3A] hover:bg-[#112F2A] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70 flex items-center gap-2 shadow-sm"
                              >
                                {processingId === listener.listenerId ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : "Mark as Paid"}
                              </button>
                              <div className="text-[#8C877D] group-hover:text-[#173F3A] transition-colors p-2">
                                {expandedRowId === listener.listenerId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>
                          </div>

                          {expandedRowId === listener.listenerId && (
                            <div className="bg-[#F8FAFC] p-6 border-t border-[#E8E6E1] shadow-inner">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-[#8C877D] mb-4 flex items-center gap-2">
                                <Search size={14} /> Session Receipts for {targetMonth}/{targetYear}
                              </h5>
                              <div className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-[#FDFCF8] text-[#8C877D] text-[10px] uppercase tracking-wider font-bold border-b border-[#E8E6E1]">
                                    <tr>
                                      <th className="px-4 py-3">Date</th>
                                      <th className="px-4 py-3">Duration</th>
                                      <th className="px-4 py-3">Client Paid</th>
                                      <th className="px-4 py-3 text-right">Listener Cut</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#F1F0EC]">
                                    {listener.unpaidSessions.map((session) => (
                                      <tr key={session.sessionId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-[#5C5954]">{formatDate(session.date)}</td>
                                        <td className="px-4 py-3 text-[#5C5954]">{session.durationMinutes} min</td>
                                        <td className="px-4 py-3 text-[#5C5954]">${session.clientPaid}</td>
                                        <td className="px-4 py-3 text-right font-bold text-[#173F3A]">${session.listenerEarned}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* THE MASTER LEDGER */}
                <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden mt-8">
                  <div className="p-6 border-b border-[#E8E6E1]">
                    <h3 className="text-lg font-bold text-[#2D2A26]">Master Ledger</h3>
                    <p className="text-xs text-[#8C877D] mt-1">Audit trail of all platform transactions.</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FDFCF8] text-[#8C877D] text-[10px] uppercase tracking-wider font-bold border-b border-[#E8E6E1]">
                        <tr>
                          <th className="px-6 py-4">Session Date</th>
                          <th className="px-6 py-4">Listener</th>
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4 text-emerald-600">Our Cut</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F0EC]">
                        {data.historicalLedger.transactions.map((txn) => (
                          <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-[#5C5954] whitespace-nowrap">{formatDate(txn.createdAt)}</td>
                            <td className="px-6 py-4 font-bold text-[#2D2A26] capitalize">{txn.listenerId?.username || "N/A"}</td>
                            <td className="px-6 py-4 text-[#5C5954] capitalize">{txn.userId?.username || "N/A"}</td>
                            <td className="px-6 py-4 font-bold text-[#2D2A26]">${txn.price}</td>
                            <td className="px-6 py-4 font-bold text-emerald-600">+${txn.platformFee}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max
                                ${txn.payoutStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}
                              `}>
                                {txn.payoutStatus === 'paid' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                {txn.payoutStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {data.historicalLedger.pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-[#E8E6E1] flex items-center justify-between bg-[#FDFCF8]/50">
                      <p className="text-xs font-bold text-[#8C877D]">
                        Showing Page {data.historicalLedger.pagination.currentPage} of {data.historicalLedger.pagination.totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="px-4 py-2 border border-[#E8E6E1] rounded-lg text-sm font-bold text-[#5C5954] hover:bg-white disabled:opacity-50 transition-all"
                        >
                          Previous
                        </button>
                        <button 
                          disabled={!data.historicalLedger.pagination.hasNextPage}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="px-4 py-2 border border-[#E8E6E1] rounded-lg text-sm font-bold text-[#5C5954] hover:bg-white disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          Next <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
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

export default ManagerFinancials;