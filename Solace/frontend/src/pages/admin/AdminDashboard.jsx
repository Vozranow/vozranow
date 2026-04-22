'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, Users, ArrowRight, X, AlertTriangle, 
  CheckCircle2, Search, ArrowLeft, Loader2, ShieldCheck, 
  History, ArrowRightLeft, ChevronDown, ListPlus
} from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import VozranowLoader from "../../components/layout/SolanceLoader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  // --- STATE: PENDING SESSIONS ---
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE: MATCH HISTORY (Server-Side Pagination) ---
  const [displayHistory, setDisplayHistory] = useState([]); 
  const [totalHistoryCount, setTotalHistoryCount] = useState(0); 
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const historyScrollRef = useRef(null);

  // --- STATE: ASSIGNMENT MODAL ---
  const [selectedSession, setSelectedSession] = useState(null);
  const [listeners, setListeners] = useState([]);
  const [loadingListeners, setLoadingListeners] = useState(false);
  const [selectedListener, setSelectedListener] = useState(null);
  const [assignDate, setAssignDate] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });

  // 1. Initial Data Load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [pendingRes, historyRes] = await Promise.all([
          axiosInstance.get(API_PATHS.ADMIN.GET_REQUESTS),
          axiosInstance.get(API_PATHS.ADMIN.HISTORY, { params: { page: 1, limit: 5 } }) 
        ]);
        
        setSessions(pendingRes.data);
        
        const historyData = historyRes.data.history || [];
        setDisplayHistory(historyData);
        setTotalHistoryCount(historyRes.data.totalCount || 0);
        setHasMoreHistory(historyRes.data.hasMore);

      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- INFINITE SCROLL LOGIC ---
  const loadMoreHistory = async () => {
    if (loadingMoreHistory || !hasMoreHistory) return;
    
    setLoadingMoreHistory(true);
    
    try {
      const nextPage = historyPage + 1;
      const res = await axiosInstance.get(API_PATHS.ADMIN.HISTORY, {
        params: { page: nextPage, limit: 5 }
      });
      
      const newMatches = res.data.history || [];
      
      setDisplayHistory(prev => [...prev, ...newMatches]);
      setHistoryPage(nextPage);
      setHasMoreHistory(res.data.hasMore);
      
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setLoadingMoreHistory(false);
    }
  };

  const handleHistoryScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMoreHistory();
    }
  };

  // --- MODAL LOGIC ---
  const handleOpenAssign = async (session) => {
    setSelectedSession(session);
    setSelectedListener(null);
    setAlert({ type: "", text: "" });
    setLoadingListeners(true);
    
    // Pre-fill the date with user's requested date
    const defaultDate = new Date(session.scheduledDate).toISOString().split('T')[0];
    setAssignDate(defaultDate);
    setAssignTime("");

    try {
      const res = await axiosInstance.get(API_PATHS.ADMIN.FIND_LISTENERS(session._id));
      setListeners(res.data.listeners || []);
    } catch (err) {
      setAlert({ type: "error", text: "Failed to fetch available listeners." });
    } finally {
      setLoadingListeners(false);
    }
  };

  const handleAssign = async () => {
    if (!assignDate || !assignTime) {
      setAlert({ type: "error", text: "Please select both a date and a time." });
      return;
    }

    setAssigning(true);
    setAlert({ type: "", text: "" });
    const finalStartString = `${assignDate}T${assignTime}`;

    try {
      await axiosInstance.put(API_PATHS.ADMIN.ASSIGN_SESSION(selectedSession._id), {
        listenerId: selectedListener.listenerId,
        finalStartTime: finalStartString
      });

      setAlert({ type: "success", text: "Session successfully assigned!" });
      
      setSessions(prev => prev.filter(s => s._id !== selectedSession._id));
      
      const newHistoryItem = {
        _id: selectedSession._id,
        clientName: selectedSession.clientName,
        listenerName: selectedListener.name,
        scheduledStartAt: finalStartString,
        status: "assigned",
      };
      setDisplayHistory(prev => [newHistoryItem, ...prev]);
      setTotalHistoryCount(prev => prev + 1);
      
      setTimeout(() => {
        closeModal();
      }, 1500);

    } catch (err) {
      setAlert({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to assign session." 
      });
    } finally {
      setAssigning(false);
    }
  };

  const closeModal = () => {
    setSelectedSession(null);
    setSelectedListener(null);
    setAssignDate("");
    setAssignTime("");
    setAlert({ type: "", text: "" });
  };

  if (loading) {
    return <VozranowLoader/>
  }

  return (
    <div className="min-h-screen w-full bg-[#FDFCF8] flex flex-col relative">
      <div className="flex-1 p-6 md:p-12">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E8E6E1] pb-6">
            <div className="bg-[#173F3A] p-3 rounded-xl text-white">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-[#2D2A26]">Admin Command Center</h1>
              <p className="text-[#5C5954] mt-1">Manage pending requests and track your assignments.</p>
            </div>
          </div>
          <button 
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-3 px-4 py-2 bg-white border border-[#E8E6E1] rounded-full hover:border-[#173F3A] hover:bg-[#F8FAFC] transition-all group shadow-sm shrink-0"
            >
              <div className="h-8 w-8 bg-[#E8F4F1] text-[#173F3A] rounded-full flex items-center justify-center">
                <Users size={16} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-sm text-[#5C5954] group-hover:text-[#173F3A] pr-1 transition-colors">
                Admin Profile
              </span>
            </button>
          {error && (
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 p-4 rounded-xl">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: PENDING REQUESTS */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-serif text-xl text-[#2D2A26] flex items-center gap-2 mb-4">
                <Search size={20} className="text-[#8C877D]" /> 
                Action Required ({sessions.length})
              </h2>

              {sessions.length === 0 ? (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-12 text-center h-[300px] flex flex-col items-center justify-center">
                  <ShieldCheck size={40} className="text-[#E8F4F1] mb-4" />
                  <p className="text-[#8C877D] italic">No pending requests at the moment. You're all caught up!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((session) => {
                    const dateObj = new Date(session.scheduledDate);
                    const startStr = new Date(session.preferredTimeStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(session.preferredTimeEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={session._id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:border-[#A3C6C0]">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                              Pending
                            </span>
                            <h3 className="font-medium text-[#2D2A26] text-lg">{session.clientName}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#5C5954]">
                            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-[#8C877D]"/> {dateObj.toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-[#8C877D]"/> Window: {startStr} - {endStr}</span>
                            <span className="flex items-center gap-1.5"><Users size={16} className="text-[#8C877D]"/> {session.duration} Mins</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleOpenAssign(session)}
                          className="bg-[#173F3A] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0F2926] transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
                        >
                          Assign Listener <ArrowRight size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: MATCH HISTORY */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-[#E8E6E1] flex flex-col h-[500px]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-serif text-xl text-[#2D2A26] flex items-center gap-2">
                    <History size={20} className="text-[#173F3A]" /> Match History
                  </h3>
                  <span className="text-xs font-bold text-[#8C877D] bg-gray-100 px-2 py-1 rounded-md">
                    {totalHistoryCount} Total
                  </span>
                </div>

                <div 
                  ref={historyScrollRef}
                  onScroll={handleHistoryScroll}
                  className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-200"
                >
                  {displayHistory.length > 0 ? (
                    <>
                      {displayHistory.map((match) => (
                        <div key={match._id} className="bg-[#F8FAFC] border border-[#E8E6E1] rounded-2xl p-4 hover:border-[#173F3A]/30 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${
                              match.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              match.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {match.status}
                            </span>
                            <span className="text-xs text-[#8C877D] flex items-center gap-1">
                              <Clock size={12} /> 
                              {new Date(match.scheduledStartAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl">
                            <div className="text-center w-1/3 truncate">
                              <p className="text-[10px] text-[#8C877D] uppercase font-bold tracking-wider mb-0.5">User</p>
                              <p className="font-medium text-[#2D2A26] text-sm truncate">{match.clientName}</p>
                            </div>
                            <div className="w-1/3 flex justify-center text-[#173F3A]">
                              <ArrowRightLeft size={16} />
                            </div>
                            <div className="text-center w-1/3 truncate">
                              <p className="text-[10px] text-[#8C877D] uppercase font-bold tracking-wider mb-0.5">Listener</p>
                              <p className="font-medium text-[#2D2A26] text-sm truncate">{match.listenerName}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {loadingMoreHistory && (
                        <div className="flex justify-center py-4">
                          <Loader2 size={20} className="animate-spin text-[#173F3A]" />
                        </div>
                      )}

                      {hasMoreHistory && !loadingMoreHistory && (
                        <button 
                          onClick={loadMoreHistory} 
                          className="w-full py-2.5 mt-2 text-xs font-medium text-[#173F3A] bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-gray-100"
                        >
                          Load more matches <ChevronDown size={14}/>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                      <History size={32} className="text-[#8C877D]" />
                      <p className="text-sm text-[#8C877D]">No assignments yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FDFCF8]">
              {selectedListener ? (
                <button onClick={() => { setSelectedListener(null); setAlert({type:"", text:""}); }} className="flex items-center gap-2 text-[#8C877D] hover:text-[#173F3A] transition-colors text-sm font-medium">
                  <ArrowLeft size={16} /> Back to Listeners
                </button>
              ) : (
                <h3 className="font-serif text-xl text-[#2D2A26]">Assigning for {selectedSession.clientName}</h3>
              )}
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-200">
              
              {/* STEP 1: SELECT LISTENER */}
              {!selectedListener && (
                <div className="space-y-4">
                  <p className="text-sm text-[#5C5954] mb-4">Showing listeners available on {new Date(selectedSession.scheduledDate).toLocaleDateString()}</p>
                  
                  {alert.text && (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-500 bg-red-50/50 py-2 rounded-lg">
                      <AlertTriangle size={16} /> <p>{alert.text}</p>
                    </div>
                  )}

                  {loadingListeners ? (
                    <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#173F3A]" /></div>
                  ) : listeners.filter(l => l.bookingsOnDate < 3).length === 0 ? (
                    <p className="text-center text-[#8C877D] italic py-8">No listeners available for this day.</p>
                  ) : (
                    // 🟢 NEW: Hard filter to strictly remove anyone with 3 or more sessions
                    listeners.filter(l => l.bookingsOnDate < 3).map((listener) => (
                      <div 
                        key={listener.listenerId} 
                        onClick={() => setSelectedListener(listener)}
                        className="p-4 border border-[#E8E6E1] rounded-2xl hover:border-[#173F3A] cursor-pointer transition-all hover:bg-[#FDFCF8] group flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-lg text-[#2D2A26]">{listener.name}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">★ {listener.rating}</span>
                          </div>
                          
                          {/* 🟢 NEW: Clean rendering of their existing schedule */}
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-[#8C877D] font-medium flex items-center gap-1">
                              <ListPlus size={12}/> {listener.bookingsOnDate} {listener.bookingsOnDate === 1 ? 'session' : 'sessions'} booked today
                            </p>
                            {listener.existingSchedule && listener.existingSchedule.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {listener.existingSchedule.map((slot, idx) => {
                                  const sTime = new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                  const eTime = new Date(slot.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                  return (
                                    <span key={idx} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Clock size={10}/> {sTime} - {eTime}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            {listener.tags.map((tag, i) => {
                              const isWarn = tag.includes("Warning");
                              return (
                                <span key={i} className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-md ${
                                  isWarn ? "bg-[#F4E3E8] text-[#9B2C2C]" : "bg-[#E8F4F1] text-[#3A6B48]"
                                }`}>
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-[#173F3A] transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* STEP 2: SELECT TIME & CONFIRM */}
              {selectedListener && (
                <div className="space-y-8">
                  <div className="bg-[#FDFCF8] border border-[#E8E6E1] p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#173F3A] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {selectedListener.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-[#8C877D] uppercase tracking-wider font-bold">Selected Listener</p>
                      <p className="font-medium text-[#2D2A26] text-lg">{selectedListener.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-[#5C5954] flex items-start gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
                      <Clock size={18} className="text-[#8C877D] shrink-0 mt-0.5" />
                      <p>
                        User requested <b>{selectedSession.duration} mins</b> between <br/>
                        <span className="text-[#173F3A] font-medium">
                          {new Date(selectedSession.preferredTimeStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedSession.preferredTimeEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </p>
                    </div>

                    {/* 🟢 NEW: Visual warning if listener has sessions */}
                    {selectedListener.existingSchedule && selectedListener.existingSchedule.length > 0 && (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <AlertTriangle size={14}/> Listener's Unavailable Times
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {selectedListener.existingSchedule.map((slot, idx) => {
                            const sTime = new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            const eTime = new Date(slot.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            return (
                              <div key={idx} className="text-sm text-red-600 bg-white px-2 py-1 rounded border border-red-100 w-fit">
                                🚫 {sTime} to {eTime}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wide">Date</label>
                        <div className="relative">
                          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C877D]" />
                          <input 
                            type="date" 
                            value={assignDate}
                            onChange={(e) => { setAssignDate(e.target.value); setAlert({type:"", text:""}); }}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl focus:border-[#173F3A] focus:bg-white outline-none transition-all text-[#2D2A26]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#8C877D] uppercase tracking-wide">Time</label>
                        <div className="relative">
                          <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C877D]" />
                          <input 
                            type="time" 
                            value={assignTime}
                            onChange={(e) => { setAssignTime(e.target.value); setAlert({type:"", text:""}); }}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl focus:border-[#173F3A] focus:bg-white outline-none transition-all text-[#2D2A26]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    {alert.text && (
                      <div className={`flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-2 ${
                        alert.type === "error" ? "text-red-500" : "text-[#3A6B48]"
                      }`}>
                        {alert.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                        <p>{alert.text}</p>
                      </div>
                    )}

                    <button 
                      onClick={handleAssign}
                      disabled={assigning}
                      className="w-full py-4 bg-[#173F3A] text-white rounded-xl font-bold text-lg hover:bg-[#0F2926] transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-[#173F3A]/20"
                    >
                      {assigning ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Confirm Assignment</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;