'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, Clock, Calendar, Star, Plus, 
  ArrowRight, History, Video, Loader2, AlertCircle, User, Search, ChevronDown 
} from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import DashboardFooter from "../../components/dashboard/DashboardFooter";
const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- WALLET STATE ---
  const [transactions, setTransactions] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);

  // --- SESSION HISTORY STATE ---
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionHasMore, setSessionHasMore] = useState(true);
  const [sessionLoadingMore, setSessionLoadingMore] = useState(false);
  const sessionScrollRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.USER.DASHBOARD);
        setData(res.data);
        
        // 1. Initial Wallet Load
        const initialTx = res.data.walletHistory || [];
        setTransactions(initialTx);
        if (initialTx.length < 3) setHasMore(false);

        // 2. Initial Session Load
        // We slice the initial data to 2 just to enforce the small list feel immediately
        const initialSessions = res.data.pastSessions || [];
        setSessionHistory(initialSessions);
        
        // If the initial batch is small, stop infinite scroll
        if (initialSessions.length < 2) setSessionHasMore(false);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // --- WALLET SCROLL LOGIC ---
  const loadMoreTransactions = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = historyPage + 1;
      const res = await axiosInstance.get(API_PATHS.WALLET.HISTORY, {
        params: { page: nextPage, limit: 3 }
      });
      const newTx = res.data.transactions;

      if (newTx.length === 0) {
        setHasMore(false);
      } else {
        setTransactions(prev => [...prev, ...newTx]);
        setHistoryPage(nextPage);
        if (newTx.length < 3) setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load wallet history", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      loadMoreTransactions();
    }
  };

  // --- SESSION SCROLL LOGIC (Updated Limit to 2) ---
  const loadMoreSessions = async () => {
    if (sessionLoadingMore || !sessionHasMore) return;
    setSessionLoadingMore(true);
    try {
      const nextPage = sessionPage + 1;
      // Fetch only 2 items at a time
      const res = await axiosInstance.get(API_PATHS.SESSION.HISTORY, {
        params: { page: nextPage, limit: 2 } 
      });
      
      const newSessions = res.data.sessions || res.data; 

      if (!newSessions || newSessions.length === 0) {
        setSessionHasMore(false);
      } else {
        setSessionHistory(prev => [...prev, ...newSessions]);
        setSessionPage(nextPage);
        // Stop if we received fewer than requested (means end of list)
        if (newSessions.length < 2) setSessionHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load session history", err);
    } finally {
      setSessionLoadingMore(false);
    }
  };

  const handleSessionScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      loadMoreSessions();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#173F3A]" />
          <p className="text-[#5C5954] font-serif">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <div className="text-center space-y-4">
          <AlertCircle size={40} className="mx-auto text-red-500" />
          <p className="text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[#173F3A] underline hover:text-[#0F2926]">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { user, overview, upcomingSessions } = data;

  return (
    <div className="min-h-screen w-full bg-[#FDFCF8] flex flex-col ">
      <div className="flex-1 p-6 md:p-12">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#2D2A26]">
              Hello, {user?.username || "Friend"}
            </h1>
            <p className="text-[#5C5954] mt-2">
              Manage your journey and session history.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm text-[#8C877D] font-medium uppercase tracking-wider">Current Balance</p>
              <p className="font-serif text-3xl text-[#173F3A]">₹{overview.walletBalance}</p>
            </div>
            
            <button onClick={() => navigate('/profile')} className="group relative h-14 w-14 rounded-full bg-[#173F3A] text-[#E5F0EE] flex items-center justify-center text-xl font-serif border-4 border-[#E8F4F1] shadow-sm hover:scale-105 transition-transform duration-200">
              {user?.username ? user.username.charAt(0).toUpperCase() : <User size={24} />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Total Sessions" value={overview.totalSessions} color="bg-[#E8F4F1] text-[#3A6B48]" />
          <StatCard icon={Clock} label="Time Spent" value={`${overview.totalTimeMinutes} min`} color="bg-[#E3EDF8] text-[#2C5282]" />
          <StatCard icon={Wallet} label="Total Spent" value={`₹${overview.totalSpent}`} color="bg-[#F4E3E8] text-[#9B2C2C]" />
          <StatCard icon={Star} label="Avg Rating Given" value={overview.avgRatingGiven > 0 ? overview.avgRatingGiven : "-"} color="bg-[#F8F4E3] text-[#975A16]" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* UPCOMING SESSIONS */}
            <SectionContainer title="Upcoming Sessions" icon={Calendar}>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {upcomingSessions.map((session) => (
                    <SessionCard key={session._id} session={session} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No upcoming sessions scheduled." actionLabel="Book a Session" onAction={() => navigate("/book-session")} />
              )}
            </SectionContainer>
            
            {/* SESSION HISTORY */}
            <SectionContainer title="Session History" icon={History}>
              {/* UPDATED HEIGHT: 
                  h-[160px] is roughly header (45px) + 2 rows (50px each) + minimal breathing room.
                  This forces the scrollbar to appear immediately after the 2nd item.
              */}
              <div className="flex flex-col h-[160px]"> 
                
                {/* Fixed Header */}
                <div className="grid grid-cols-4 text-sm text-[#8C877D] border-b border-gray-100 py-3 font-medium bg-white z-10 sticky top-0">
                  <div className="pl-2">Listener</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div className="text-right pr-2">Price</div>
                </div>

                {/* Scrollable Content */}
                <div 
                  ref={sessionScrollRef}
                  onScroll={handleSessionScroll}
                  className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200"
                >
                  {sessionHistory.length > 0 ? (
                    <>
                      {sessionHistory.map((session) => (
                        <div key={session._id} className="grid grid-cols-4 text-sm text-[#5C5954] py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center">
                          <div className="font-medium text-[#2D2A26] pl-2 truncate pr-2">
                            {session.listenerId?.username || "Unassigned"}
                          </div>
                          <div>{new Date(session.scheduledDate).toLocaleDateString()}</div>
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                              session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="text-right pr-2">₹{session.price}</div>
                        </div>
                      ))}

                      {/* Loading Spinner */}
                      {sessionLoadingMore && (
                        <div className="flex justify-center py-4">
                          <Loader2 size={16} className="animate-spin text-[#173F3A]" />
                        </div>
                      )}
                      
                      {/* Manual Load More (if infinite scroll misses) */}
                      {sessionHasMore && !sessionLoadingMore && (
                         <button onClick={loadMoreSessions} className="w-full py-2 mt-2 text-xs text-[#173F3A] bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1 transition-colors">
                           Load more <ChevronDown size={12}/>
                         </button>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-[#8C877D] text-sm italic">
                      No session history yet.
                    </div>
                  )}
                </div>
              </div>
            </SectionContainer>
          </div>

          <div className="space-y-8">
            {/* Wallet (Unchanged) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1] flex flex-col h-auto max-h-[380px]"> 
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-serif text-lg text-[#2D2A26] flex items-center gap-2">
                  <Wallet size={20} className="text-[#173F3A]" /> Wallet
                </h3>
                <button onClick={() => navigate("/add-money")} className="text-xs font-medium bg-[#173F3A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0F2926] transition-colors flex items-center gap-1">
                  <Plus size={14} /> Add Money
                </button>
              </div>
              <div 
                ref={scrollContainerRef}
                className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                onScroll={handleScroll}
              >
                {transactions.length > 0 ? (
                  <>
                    {transactions.map((tx) => {
                      const isCredit = tx.type === 'TOPUP' || tx.type === 'credit'; 
                      return (
                        <div key={tx._id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                             <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                                isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                             }`}>
                                {isCredit ? <Plus size={14} /> : <ArrowRight size={14} className="-rotate-45" />}
                             </div>
                             <div>
                                <p className="font-medium text-[#2D2A26] capitalize text-xs sm:text-sm">
                                   {tx.type.toLowerCase()}
                                </p>
                                <p className="text-[10px] sm:text-xs text-[#8C877D]">
                                   {new Date(tx.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                          </div>
                          <span className={`font-medium text-xs sm:text-sm ${isCredit ? 'text-green-600' : 'text-[#2D2A26]'}`}>
                            {isCredit ? '+' : '-'} ₹{tx.amount}
                          </span>
                        </div>
                      );
                    })}
                    {loadingMore && <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-[#173F3A]" /></div>}
                    {hasMore && !loadingMore && transactions.length < 5 && (
                      <button onClick={loadMoreTransactions} className="w-full py-2 mt-2 text-xs text-[#173F3A] bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          Load more <ChevronDown size={12}/>
                      </button>
                    )}
                  </>
                ) : <p className="text-xs text-[#8C877D] italic text-center py-8">No transactions yet.</p>}
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-[#173F3A] rounded-2xl p-6 text-white shadow-lg">
               <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#E8F4F1] rounded-full opacity-10 blur-2xl" />
               <h3 className="relative z-10 font-serif text-xl mb-2">Need to talk?</h3>
               <p className="relative z-10 text-[#BCCECE] text-sm mb-6 leading-relaxed">
                  Our listeners are available 24/7. Find someone who resonates with you.
               </p>
               <button onClick={() => navigate("/book-session")} className="relative z-10 w-full py-3 bg-[#E8F4F1] text-[#173F3A] font-medium rounded-xl hover:bg-white transition-colors">Book a Session</button>
            </div>
          </div>
        </div>
      </div>
      </div>
      <DashboardFooter/>
    </div>
  );
};

// --- SESSION CARD ---
function SessionCard({ session }) {
  const [canJoin, setCanJoin] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [checking, setChecking] = useState(false);
  
  const status = session.status;
  const isPending = status === 'pending';
  const isAssigned = status === 'assigned' || status === 'ongoing';
  const navigate = useNavigate();
  const targetTime = isAssigned ? session.scheduledStartAt : (session.preferredTimeStart || session.scheduledDate);
  const dateObj = new Date(targetTime);
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  useEffect(() => {
    if (!isAssigned) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(targetTime);
      const lobbyOpenTime = new Date(start.getTime() - 15 * 60 * 1000); 
      
      const diffMs = start - now;
      const hoursLeft = diffMs / (1000 * 60 * 60);

      if (now >= lobbyOpenTime) {
        setCanJoin(true);
        setStatusText("Lobby Open");
        return;
      }

      setCanJoin(false);
      if (hoursLeft > 24) setStatusText(`at ${timeStr}`);
      else if (hoursLeft > 1) setStatusText(`Opens in ${Math.ceil(hoursLeft)} hrs`);
      else if (hoursLeft > 0) {
        const minsToOpen = Math.ceil((lobbyOpenTime - now) / (1000 * 60));
        setStatusText(`Opens in ${minsToOpen} min`);
      } else if (hoursLeft < -1) setStatusText("Session Ended");
    };

    updateCountdown(); 
    const timerId = setInterval(updateCountdown, 1000); 

    const start = new Date(targetTime);
    const now = new Date();
    const hoursLeft = (start - now) / (1000 * 60 * 60);
    
    let pollId;
    if (hoursLeft < 1 && hoursLeft > -1) {
      pollId = setInterval(async () => {
        try {
           await axiosInstance.get(API_PATHS.SESSION.CAN_JOIN(session._id));
        } catch(e) { /* silent fail */ }
      }, 5 * 60 * 1000);
    }

    return () => {
      clearInterval(timerId);
      if(pollId) clearInterval(pollId);
    };

  }, [targetTime, isAssigned, timeStr, session._id]);

  const handleJoin = async () => {
    if (!canJoin) return;
    setChecking(true);
    try {
      const res = await axiosInstance.get(API_PATHS.SESSION.CAN_JOIN(session._id));
      if (res.data.allowed) {
        navigate(`/session/${session._id}/lobby`);
      }
    } catch (err) {
      console.log(err)
      alert(err.response?.data?.message || "Cannot join right now");
    } finally {
      setChecking(false);
    }
  };

  let icon = <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center"><Calendar size={20}/></div>;
  if(isPending) icon = <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold"><Search size={20} /></div>;
  if(isAssigned) icon = <div className="h-12 w-12 rounded-full bg-[#E8F4F1] text-[#3A6B48] flex items-center justify-center text-lg font-bold">{session.listenerId?.username?.charAt(0).toUpperCase()}</div>;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-gray-100 gap-4 transition-colors hover:border-[#173F3A]/20">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h4 className="font-medium text-[#2D2A26]">
            {isPending ? "Looking for a listener..." : `Session with ${session.listenerId?.username}`}
          </h4>
          <p className="text-sm text-[#5C5954] mt-0.5">
            {isPending ? (
              <span className="text-orange-600/80">Requested for {dateStr}. Notify when assigned.</span>
            ) : (
              <span className="flex items-center gap-1.5"><Calendar size={14}/> {dateStr} • {statusText}</span>
            )}
          </p>
        </div>
      </div>

      <button 
        onClick={handleJoin}
        disabled={isPending || (!canJoin && isAssigned)}
        className={`w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          canJoin 
            ? "bg-[#173F3A] text-white hover:bg-[#0F2926] shadow-md shadow-[#173F3A]/10 scale-100" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {checking ? <Loader2 size={16} className="animate-spin" /> : (
           isPending ? "Waiting..." : (canJoin ? <><Video size={16} /> Join Lobby</> : "Lobby Closed")
        )}
      </button>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8E6E1] flex flex-col justify-between h-32 transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <p className="text-[#5C5954] text-sm font-medium">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="font-serif text-3xl text-[#2D2A26]">{value}</p>
    </div>
  );
}

function SectionContainer({ title, icon: Icon, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1]">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <Icon size={20} className="text-[#173F3A]" />
        <h2 className="font-serif text-xl text-[#2D2A26]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
       <div className="h-16 w-16 bg-[#FDFCF8] rounded-full flex items-center justify-center border border-dashed border-[#8C877D]">
         <Calendar size={24} className="text-[#8C877D] opacity-50" />
       </div>
       <p className="text-[#5C5954]">{message}</p>
       {actionLabel && (
         <button onClick={onAction} className="text-[#173F3A] font-medium text-sm hover:underline">
             {actionLabel}
         </button>
       )}
    </div>
  );
}

export default DashboardPage;