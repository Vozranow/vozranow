'use client';
import { useState, useEffect } from "react";
import { 
  Calendar, Clock, Users, ArrowRight, X, AlertTriangle, 
  CheckCircle2, Search, ArrowLeft, Loader2, ShieldAlert, 
  ListPlus, Menu, AlertCircle
} from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import VozranowLoader from "../../components/layout/SolanceLoader";

const ManagerAssignSession = () => {
  // --- STATE MANAGEMENT ---
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Custom Notification State
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Assignment Modal State
  const [selectedSession, setSelectedSession] = useState(null);
  const [listeners, setListeners] = useState([]);
  const [loadingListeners, setLoadingListeners] = useState(false);
  const [selectedListener, setSelectedListener] = useState(null);
  const [assignDate, setAssignDate] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [modalAlert, setModalAlert] = useState({ type: "", text: "" });

  // --- DATA FETCHING ---
  const fetchEscalatedSessions = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.MANAGER.GET_ESCALATED);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load escalated sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalatedSessions();
  }, []);

  // --- CUSTOM NOTIFICATION HELPER ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000); 
  };

  // --- MODAL LOGIC ---
  const handleOpenAssign = async (session) => {
    setSelectedSession(session);
    setSelectedListener(null);
    setModalAlert({ type: "", text: "" });
    setLoadingListeners(true);
    
    const defaultDate = new Date(session.scheduledDate).toISOString().split('T')[0];
    setAssignDate(defaultDate);
    setAssignTime("");

    try {
      const res = await axiosInstance.get(API_PATHS.ADMIN.FIND_LISTENERS(session._id));
      setListeners(res.data.listeners || []);
    } catch (err) {
      setModalAlert({ type: "error", text: "Failed to fetch available listeners." });
    } finally {
      setLoadingListeners(false);
    }
  };

  const handleAssign = async () => {
    if (!assignDate || !assignTime) {
      setModalAlert({ type: "error", text: "Please select both a date and a time." });
      return;
    }

    setAssigning(true);
    setModalAlert({ type: "", text: "" });
    const finalStartString = `${assignDate}T${assignTime}`;

    try {
      await axiosInstance.put(API_PATHS.ADMIN.ASSIGN_SESSION(selectedSession._id), {
        listenerId: selectedListener.listenerId,
        finalStartTime: finalStartString
      });

      showNotification('Emergency assignment successful!');
      
      // Remove the successfully assigned session from the queue
      setSessions(prev => prev.filter(s => s._id !== selectedSession._id));
      
      setTimeout(() => {
        closeModal();
      }, 1000);

    } catch (err) {
      setModalAlert({ 
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
    setModalAlert({ type: "", text: "" });
  };

  if (loading) return <VozranowLoader/>;

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

      {/* MODAL OVERLAY */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2A26]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FDFCF8]">
              {selectedListener ? (
                <button onClick={() => { setSelectedListener(null); setModalAlert({type:"", text:""}); }} className="flex items-center gap-2 text-[#8C877D] hover:text-[#173F3A] transition-colors text-sm font-medium">
                  <ArrowLeft size={16} /> Back to Listeners
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={20}/>
                  <h3 className="font-serif text-xl text-[#2D2A26]">Emergency Rescue: {selectedSession.clientName}</h3>
                </div>
              )}
              <button onClick={closeModal} className="p-2 text-[#8C877D] hover:text-[#2D2A26] hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-200">
              
              {/* STEP 1: SELECT LISTENER */}
              {!selectedListener && (
                <div className="space-y-4">
                  <p className="text-sm text-[#5C5954] mb-4">Showing listeners available on {new Date(selectedSession.scheduledDate).toLocaleDateString()}</p>
                  
                  {modalAlert.text && (
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-500 bg-red-50/50 py-2 rounded-lg">
                      <AlertTriangle size={16} /> <p>{modalAlert.text}</p>
                    </div>
                  )}

                  {loadingListeners ? (
                    <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-[#173F3A]" /></div>
                  ) : listeners.filter(l => l.bookingsOnDate < 3).length === 0 ? (
                    <p className="text-center text-[#8C877D] italic py-8">No listeners available for this day.</p>
                  ) : (
                    listeners.filter(l => l.bookingsOnDate < 3).map((listener) => (
                      <div 
                        key={listener.listenerId} 
                        onClick={() => setSelectedListener(listener)}
                        className="p-4 border border-[#E8E6E1] rounded-2xl hover:border-red-300 cursor-pointer transition-all hover:bg-red-50/30 group flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-lg text-[#2D2A26]">{listener.name}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">★ {listener.rating}</span>
                          </div>
                          
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
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-red-600 transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* STEP 2: SELECT TIME & CONFIRM */}
              {selectedListener && (
                <div className="space-y-8">
                  <div className="bg-[#FDFCF8] border border-[#E8E6E1] p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-12 w-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {selectedListener.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-[#8C877D] uppercase tracking-wider font-bold">Selected Listener</p>
                      <p className="font-medium text-[#2D2A26] text-lg">{selectedListener.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-[#5C5954] flex items-start gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
                      <Clock size={18} className="text-red-500 shrink-0 mt-0.5" />
                      <p>
                        URGENT: User requested <b>{selectedSession.duration} mins</b> between <br/>
                        <span className="text-red-600 font-medium">
                          {new Date(selectedSession.preferredTimeStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedSession.preferredTimeEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </p>
                    </div>

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
                            onChange={(e) => { setAssignDate(e.target.value); setModalAlert({type:"", text:""}); }}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl focus:border-red-400 focus:bg-white outline-none transition-all text-[#2D2A26]"
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
                            onChange={(e) => { setAssignTime(e.target.value); setModalAlert({type:"", text:""}); }}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E8E6E1] rounded-xl focus:border-red-400 focus:bg-white outline-none transition-all text-[#2D2A26]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    {modalAlert.text && (
                      <div className={`flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-2 ${
                        modalAlert.type === "error" ? "text-red-500" : "text-[#3A6B48]"
                      }`}>
                        {modalAlert.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                        <p>{modalAlert.text}</p>
                      </div>
                    )}

                    <button 
                      onClick={handleAssign}
                      disabled={assigning}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-red-600/20"
                    >
                      {assigning ? <Loader2 className="animate-spin" size={20} /> : <><ShieldAlert size={20} /> Confirm Rescue Assignment</>}
                    </button>
                  </div>
                </div>
              )}
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
              <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight">Assign Session</h1>
              <p className="text-[#8C877D] font-medium mt-1.5 text-sm">Manage and rescue emergency escalations.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-12 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* High-Urgency Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-50 border border-red-200 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 p-3 rounded-xl text-white animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-red-900">Emergency Escalations</h2>
                  <p className="text-red-700 text-sm mt-1">Sessions approaching deadline without a listener assignment.</p>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2 shadow-sm">
                <span className="text-2xl font-bold text-red-600">{sessions.length}</span>
                <span className="text-xs uppercase tracking-wide text-red-800 font-semibold">Active<br/>Alerts</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* MAIN QUEUE */}
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-16 text-center h-[300px] flex flex-col items-center justify-center">
                  <div className="bg-emerald-50 p-4 rounded-full mb-4">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-serif text-[#2D2A26] mb-2">Queue Clear</h3>
                  <p className="text-[#8C877D]">There are no emergency escalations at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((session) => {
                    const dateObj = new Date(session.scheduledDate);
                    const startStr = new Date(session.preferredTimeStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(session.preferredTimeEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={session._id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-500 border-y border-r border-[#E8E6E1] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle size={12}/> Escalated
                            </span>
                            <h3 className="font-medium text-[#2D2A26] text-lg">{session.clientName}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#5C5954]">
                            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-[#8C877D]"/> {dateObj.toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-red-500"/> Danger Zone: {startStr} - {endStr}</span>
                            <span className="flex items-center gap-1.5"><Users size={16} className="text-[#8C877D]"/> {session.duration} Mins</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleOpenAssign(session)}
                          className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
                        >
                          Force Assign <ArrowRight size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerAssignSession;