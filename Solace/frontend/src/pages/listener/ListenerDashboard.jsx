'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Clock, DollarSign, Star, Calendar, 
  Video, Loader2, ChevronDown 
} from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import toast from "react-hot-toast";
import VozranowLoader from "../../components/layout/SolanceLoader";

const ListenerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- Availability State ---
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  // --- Session Pagination State ---
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'history'
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const scrollRef = useRef(null);

  // 1️⃣ INITIAL LOAD
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.LISTENER.DASHBOARD);
        setData(res.data);
        setIsOnline(res.data.availability.isOnline);
        
        // Fast load upcoming
        if (activeTab === 'upcoming') {
           setSessions(res.data.upcomingSessions);
           // If we got 3 or more, assume there might be more pages
           setHasMore(res.data.upcomingSessions.length >= 3);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // 2️⃣ TAB SWITCHING
  useEffect(() => {
    if (loading) return;

    const fetchTabSessions = async () => {
      setLoadingMore(true);
      try {
        setPage(1);
        setSessions([]); 
        
        const res = await axiosInstance.get(API_PATHS.LISTENER.SESSION, {
          params: { page: 1, limit: 3, type: activeTab }
        });

        setSessions(res.data.sessions);
        setHasMore(res.data.pagination.totalPages > 1);

      } catch (err) {
        console.error("Tab fetch error", err);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchTabSessions();
  }, [activeTab]); 

  // 3️⃣ LOAD MORE
  const loadMoreSessions = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const res = await axiosInstance.get(API_PATHS.LISTENER.SESSION, {
        params: { page: nextPage, limit: 3, type: activeTab }
      });
      
      const newSessions = res.data.sessions;
      
      if (newSessions.length === 0) {
        setHasMore(false);
      } else {
        setSessions(prev => [...prev, ...newSessions]);
        setPage(nextPage);
        if (newSessions.length < 3) setHasMore(false);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMoreSessions();
    }
  };

  // --- TOGGLE AVAILABILITY ---
  const handleToggleAvailability = async () => {
    if (toggling) return;
    setToggling(true);
    const previousState = isOnline;
    const newState = !isOnline;
    
    setIsOnline(newState); 
    
    try {
      const res = await axiosInstance.put(API_PATHS.LISTENER.TOGGLE_AVAILABILITY, { isOnline: newState });
      toast.success(res.data.message || (newState ? "You are now Online" : "You are now Offline"));
    } catch (err) {
      setIsOnline(previousState); 
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <VozranowLoader/>

  const { user, overview, monthlyEarnings } = data;

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-6 md:p-10 font-sans text-[#2D2A26]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#173F3A] text-[#E8F4F1] flex items-center justify-center text-2xl font-serif border-4 border-[#E8F4F1] shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-serif text-[#173F3A]">Listener Dashboard</h1>
              <p className="text-[#5C5954]">Welcome back, {user.username.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 px-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium text-[#5C5954]">{isOnline ? "Available" : "Unavailable"}</span>
             </div>
             <button 
                onClick={handleToggleAvailability}
                disabled={toggling}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${isOnline ? 'bg-[#173F3A]' : 'bg-gray-200'}`}
             >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-5' : 'translate-x-0'}`} />
             </button>
             <button onClick={()=> navigate("/listener/profile")} className="bg-[#173F3A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0F2926] transition-colors">
                Profile
             </button>
          </div>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard icon={Users} label="Total Sessions" value={overview.totalSessions} sub={`All time`} />
          <DashboardCard icon={Clock} label="Total Time" value={`${overview.totalHours}h`} sub="Hours spent listening" />
          <DashboardCard icon={DollarSign} label="Total Earnings" value={`₹${overview.totalEarnings.toLocaleString()}`} sub="All-time earnings" />
          <DashboardCard icon={Star} label="Avg. Rating" value={overview.rating} sub="From reviews" isStar />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Session Management */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E6E1] shadow-sm flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl z-10 sticky top-0">
                 <h3 className="font-serif text-xl text-[#173F3A]">Session Management</h3>
                 <div className="bg-[#F3F4F6] p-1 rounded-lg flex text-sm font-medium">
                    <button 
                      onClick={() => setActiveTab("upcoming")}
                      className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'upcoming' ? 'bg-white text-[#173F3A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Upcoming
                    </button>
                    <button 
                      onClick={() => setActiveTab("history")}
                      className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-[#173F3A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      History
                    </button>
                 </div>
              </div>

              {/* SCROLLABLE LIST */}
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-[450px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-200"
              >
                 {sessions.length > 0 ? (
                   sessions.map((session) => (
                     <ListenerSessionCard 
                       key={session._id} 
                       session={session} 
                       isHistory={activeTab === 'history'} 
                     />
                   ))
                 ) : (
                   !loadingMore && (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                       <Calendar size={48} className="mb-2 opacity-20"/>
                       <p>No sessions found.</p>
                     </div>
                   )
                 )}
                 
                 {!loadingMore && hasMore && (
                   <button 
                     onClick={loadMoreSessions}
                     className="w-full py-3 mt-2 text-sm text-[#173F3A] bg-gray-50 hover:bg-[#E8F4F1] rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     View More Sessions <ChevronDown size={16}/>
                   </button>
                 )}

                 {loadingMore && (
                   <div className="flex justify-center py-4">
                      <Loader2 size={24} className="animate-spin text-[#173F3A]" />
                   </div>
                 )}
              </div>
          </div>

          {/* RIGHT: Earnings Card */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-6 h-fit sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                 <DollarSign className="text-green-600" size={20}/>
                 <h3 className="font-serif text-xl text-[#173F3A]">Earnings This Month</h3>
              </div>

              <div className="bg-[#E8F4F1] rounded-xl p-6 mb-6 text-center border border-[#D1E5E1]">
                 <p className="text-sm text-[#5C5954] mb-1">Total Earnings ({monthlyEarnings.month})</p>
                 <h2 className="text-4xl font-serif text-[#173F3A]">₹{monthlyEarnings.earnings.toLocaleString()}</h2>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                    <span className="text-gray-500">Sessions Completed</span>
                    <span className="font-bold text-[#2D2A26]">{monthlyEarnings.sessions}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                    <span className="text-gray-500">Hours Worked</span>
                    <span className="font-bold text-[#2D2A26]">{monthlyEarnings.hours}h</span>
                 </div>
                 <p className="text-[10px] text-gray-400 mt-6 text-center leading-tight">
                   Payments are processed by upper management at the end of each month.
                 </p>
              </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// --- STATS CARD ---
const DashboardCard = ({ icon: Icon, label, value, sub, isStar }) => (
  <div className="bg-white p-6 rounded-2xl border border-[#E8E6E1] shadow-sm flex flex-col justify-between min-h-[140px]">
    <div className="flex justify-between items-start mb-2">
      <div className="flex flex-col">
         <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</span>
         <span className={`text-3xl font-serif mt-1 ${isStar ? 'text-amber-500' : 'text-[#2D2A26]'}`}>
            {value}
         </span>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
         <Icon size={20} />
      </div>
    </div>
    <p className="text-xs text-gray-400">{sub}</p>
  </div>
);

// --- 🌟 SMART SESSION CARD 🌟 ---
const ListenerSessionCard = ({ session, isHistory }) => {
  const navigate = useNavigate();
  const [canJoin, setCanJoin] = useState(false);
  const [btnText, setBtnText] = useState("Locked");
  const [checking, setChecking] = useState(false);
  
  const startTime = new Date(session.scheduledStartAt);
  const duration = session.bookedDurationMinutes;
  
  // Rating Logic (History Tab)
  const rating = session.review?.rating || 0;

  // 1️⃣ COUNTDOWN LOGIC (UI Only)
  useEffect(() => {
    if (isHistory) return;

    const updateCountdown = () => {
       const now = new Date();
       const lobbyOpenTime = new Date(startTime.getTime() - 15 * 60000); 
       const diffMs = lobbyOpenTime - now;

       if (now >= lobbyOpenTime) {
         setCanJoin(true);
         setBtnText("Join Now");
       } else {
         setCanJoin(false);
         const hoursLeft = diffMs / (1000 * 60 * 60);
         
         if (hoursLeft > 24) {
           setBtnText("Upcoming");
         } else if (hoursLeft > 1) {
           setBtnText(`In ${Math.ceil(hoursLeft)}h`);
         } else {
           const minsToOpen = Math.ceil(diffMs / 60000);
           setBtnText(`In ${minsToOpen}m`);
         }
       }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); 
    return () => clearInterval(interval);
  }, [startTime, isHistory]);

  // 2️⃣ SECURE JOIN HANDLER
  const handleJoin = async () => {
     if (!canJoin) return;
     
     setChecking(true);
     try {
       // A. Backend Security Check
       const res = await axiosInstance.get(API_PATHS.SESSION.CAN_JOIN(session._id));
       
       if (res.data.allowed) {
         // B. Navigate to INTERNAL Lobby
         navigate(`/session/${session._id}/lobby`);
       }
     } catch (err) {
       toast.error(err.response?.data?.message || "Cannot join right now");
     } finally {
       setChecking(false);
     }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#173F3A]/30 transition-all group">
       
       {/* User Info */}
       <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-12 w-12 rounded-full bg-[#E8F4F1] text-[#173F3A] flex items-center justify-center font-bold text-lg">
             {session.userId?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          
          <div>
             <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#2D2A26]">{session.userId?.username || "Anonymous User"}</h4>
             </div>
             
             <div className="text-xs text-[#5C5954] mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                    <Calendar size={12}/> {startTime.toLocaleDateString()}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"/>
                <span>{startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"/>
                <span>({duration} min)</span>
             </div>
          </div>
       </div>

       {/* Action Area */}
       <div className="mt-4 sm:mt-0 w-full sm:w-auto">
          {isHistory ? (
             /* HISTORY VIEW: Stars ⭐️ */
             <div className="flex items-center justify-center sm:justify-end gap-1">
               {session.status === 'cancelled' ? (
                 <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                   Cancelled
                 </span>
               ) : session.status === 'refunded' ? (
                 <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                   Refunded to Client
                 </span>
               ) : session.status === 'completed' && rating === 0 ? (
                 // 🟢 NEW: Shows "Paid" if they won a dispute or client didn't rate
                 <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                   Paid (No Review)
                 </span>
               ) : (
                 <>
                   {[1, 2, 3, 4, 5].map((star) => (
                     <Star 
                       key={star} 
                       size={16} 
                       className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} 
                     />
                   ))}
                 </>
               )}
             </div>
          ) : (
             /* UPCOMING VIEW: Button 🟢 */
             <button 
               disabled={!canJoin || checking}
               onClick={handleJoin}
               className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${canJoin 
                     ? 'bg-[#173F3A] text-white hover:bg-[#0F2926] shadow-md' 
                     : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
             >
               {checking ? (
                 <Loader2 size={14} className="animate-spin" />
               ) : (
                 canJoin && <Video size={14} />
               )}
               {btnText}
             </button>
          )}
       </div>
    </div>
  );
};

export default ListenerDashboard;