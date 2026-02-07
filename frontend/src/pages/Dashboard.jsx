

// 'use client';
// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   Wallet, Clock, Calendar, Star, Plus, 
//   ArrowRight, History, Video, Loader2, AlertCircle, User, Search, ChevronDown 
// } from 'lucide-react';
// import axiosInstance from "../utils/axiosInstance";
// import API_PATHS from "../utils/apiPaths";

// const DashboardPage = () => {
//   const navigate = useNavigate();
  
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // --- PAGINATION STATE ---
//   const [transactions, setTransactions] = useState([]);
//   const [historyPage, setHistoryPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await axiosInstance.get(API_PATHS.USER.DASHBOARD);
//         setData(res.data);
        
//         // Initial Load (Page 1)
//         const initialTx = res.data.walletHistory;
//         setTransactions(initialTx);
        
//         if (initialTx.length < 3) {
//           setHasMore(false);
//         }
//       } catch (err) {
//         console.error("Dashboard fetch error:", err);
//         setError("Failed to load dashboard data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   // --- INFINITE SCROLL LOGIC ---
//   const loadMoreTransactions = async () => {
//     if (loadingMore || !hasMore) return;
    
//     setLoadingMore(true);
//     try {
//       const nextPage = historyPage + 1;
      
//       const res = await axiosInstance.get(API_PATHS.WALLET.HISTORY, {
//         params: { 
//           page: nextPage, 
//           limit: 3 
//         }
//       });
      
//       const newTx = res.data.transactions;

//       if (newTx.length === 0) {
//         setHasMore(false);
//       } else {
//         setTransactions(prev => [...prev, ...newTx]);
//         setHistoryPage(nextPage);
        
//         if (newTx.length < 3) {
//           setHasMore(false);
//         }
//       }
//     } catch (err) {
//       console.error("Failed to load history", err);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // Event Listener for Scroll
//   const handleScroll = (e) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.target;
//     // Load more when user is 10px from bottom
//     if (scrollTop + clientHeight >= scrollHeight - 10) {
//       loadMoreTransactions();
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 size={40} className="animate-spin text-[#173F3A]" />
//           <p className="text-[#5C5954] font-serif">Loading your space...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
//         <div className="text-center space-y-4">
//           <AlertCircle size={40} className="mx-auto text-red-500" />
//           <p className="text-red-600">{error}</p>
//           <button onClick={() => window.location.reload()} className="text-[#173F3A] underline hover:text-[#0F2926]">
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const { user, overview, upcomingSessions, pastSessions } = data;

//   return (
//     <div className="min-h-screen w-full bg-[#FDFCF8] p-6 md:p-12">
//       <div className="mx-auto max-w-7xl space-y-8">
        
//         {/* --- Header --- */}
//         <div className="flex items-end justify-between gap-4">
//           <div>
//             <h1 className="font-serif text-3xl md:text-4xl text-[#2D2A26]">
//               Hello, {user?.username || "Friend"}
//             </h1>
//             <p className="text-[#5C5954] mt-2">
//               Manage your journey and session history.
//             </p>
//           </div>

//           <div className="flex items-center gap-6">
//             <div className="text-right hidden md:block">
//               <p className="text-sm text-[#8C877D] font-medium uppercase tracking-wider">Current Balance</p>
//               <p className="font-serif text-3xl text-[#173F3A]">₹{overview.walletBalance}</p>
//             </div>
            
//             <button onClick={() => navigate('/profile')} className="group relative h-14 w-14 rounded-full bg-[#173F3A] text-[#E5F0EE] flex items-center justify-center text-xl font-serif border-4 border-[#E8F4F1] shadow-sm hover:scale-105 transition-transform duration-200">
//               {user?.username ? user.username.charAt(0).toUpperCase() : <User size={24} />}
//             </button>
//           </div>
//         </div>

//         {/* --- Stats Row --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard icon={Calendar} label="Total Sessions" value={overview.totalSessions} color="bg-[#E8F4F1] text-[#3A6B48]" />
//           <StatCard icon={Clock} label="Time Spent" value={`${overview.totalTimeMinutes} min`} color="bg-[#E3EDF8] text-[#2C5282]" />
//           <StatCard icon={Wallet} label="Total Spent" value={`₹${overview.totalSpent}`} color="bg-[#F4E3E8] text-[#9B2C2C]" />
//           <StatCard icon={Star} label="Avg Rating" value={overview.avgRatingGiven > 0 ? overview.avgRatingGiven : "-"} color="bg-[#F8F4E3] text-[#975A16]" />
//         </div>

//         {/* --- Main Content Grid --- */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* LEFT COLUMN (2/3 Width) */}
//           <div className="lg:col-span-2 space-y-8">
            
//             {/* Upcoming Sessions */}
//             <SectionContainer title="Upcoming Sessions" icon={Calendar}>
//               {upcomingSessions.length > 0 ? (
//                 <div className="space-y-4">
//                   {upcomingSessions.map((session) => {
//                      const status = session.status;
//                      let targetTime, title, subText, icon, buttonConfig;

//                      if (status === 'pending') {
//                        targetTime = session.preferredTimeStart || session.scheduledDate;
//                        title = "Looking for a listener...";
//                        const dateObj = new Date(targetTime);
//                        const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
//                        subText = <><span className="font-medium text-[#2D2A26]">Requested for {dateStr}</span>.<span className="block sm:inline sm:ml-1 text-orange-600/80">Notify when assigned.</span></>;
//                        icon = <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold"><Search size={20} /></div>;
//                        buttonConfig = { label: "Waiting...", disabled: true, style: "bg-gray-100 text-gray-400 cursor-not-allowed" };
//                      } else if (status === 'assigned' || status === 'ongoing') {
//                        targetTime = session.scheduledStartAt || session.scheduledDate;
//                        title = `Session with ${session.listenerId?.username || "Listener"}`;
//                        const dateObj = new Date(targetTime);
//                        const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
//                        const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
//                        subText = <span className="flex items-center gap-1.5 text-[#5C5954]"><Calendar size={14}/> {dateStr} at {timeStr}</span>;
//                        icon = <div className="h-12 w-12 rounded-full bg-[#E8F4F1] text-[#3A6B48] flex items-center justify-center text-lg font-bold">{session.listenerId?.username?.charAt(0).toUpperCase()}</div>;
//                        buttonConfig = { label: "Join Lobby", disabled: false, style: "bg-[#173F3A] text-white hover:bg-[#0F2926]", icon: <Video size={16} /> };
//                      } else {
//                        targetTime = session.scheduledStartAt || session.scheduledDate;
//                        title = `Session ${status}`;
//                        const dateObj = new Date(targetTime);
//                        subText = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
//                        icon = <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"><History size={20} /></div>;
//                        buttonConfig = { label: "View", disabled: false, style: "bg-gray-100 text-[#173F3A]" };
//                      }

//                      return (
//                        <div key={session._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-gray-100 gap-4 transition-colors hover:border-[#173F3A]/20">
//                          <div className="flex items-center gap-4">
//                            {icon}
//                            <div>
//                              <h4 className="font-medium text-[#2D2A26]">{title}</h4>
//                              <p className="text-sm mt-0.5">{subText}</p>
//                            </div>
//                          </div>
//                          <button disabled={buttonConfig.disabled} className={`w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${buttonConfig.style}`}>
//                            {buttonConfig.icon} {buttonConfig.label}
//                          </button>
//                        </div>
//                      );
//                   })}
//                 </div>
//               ) : (
//                 <EmptyState message="No upcoming sessions scheduled." actionLabel="Book a Session" onAction={() => navigate(API_PATHS.SESSION.BOOK)} />
//               )}
//             </SectionContainer>
            
//             {/* Session History */}
//             <SectionContainer title="Session History" icon={History}>
//               {pastSessions.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="text-sm text-[#8C877D] border-b border-gray-100">
//                         <th className="py-3 font-medium">Listener</th>
//                         <th className="py-3 font-medium">Date</th>
//                         <th className="py-3 font-medium">Status</th>
//                         <th className="py-3 font-medium text-right">Price</th>
//                       </tr>
//                     </thead>
//                     <tbody className="text-sm text-[#5C5954]">
//                       {pastSessions.map((session) => (
//                         <tr key={session._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
//                           <td className="py-3 font-medium text-[#2D2A26]">{session.listenerId?.username || "Unassigned"}</td>
//                           <td className="py-3">{new Date(session.scheduledDate).toLocaleDateString()}</td>
//                           <td className="py-3">
//                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                               session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                             }`}>{session.status}</span>
//                           </td>
//                           <td className="py-3 text-right">₹{session.price}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="py-8 text-center text-[#8C877D] text-sm italic">
//                   No session history yet.
//                 </div>
//               )}
//             </SectionContainer>
//           </div>

//           {/* RIGHT COLUMN - Wallet */}
//           <div className="space-y-8">
            
//             {/* DYNAMIC HEIGHT FIX: h-auto + max-h-[380px]
//                 This makes it start small and grow to a limit.
//             */}
//             <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1] flex flex-col h-auto max-h-[380px] transition-all duration-300 ease-in-out"> 
              
//               <div className="flex items-center justify-between mb-4 flex-shrink-0">
//                 <h3 className="font-serif text-lg text-[#2D2A26] flex items-center gap-2">
//                   <Wallet size={20} className="text-[#173F3A]" /> Wallet
//                 </h3>
//                 <button onClick={() => navigate(API_PATHS.WALLET.ADD_MONEY)} className="text-xs font-medium bg-[#173F3A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0F2926] transition-colors flex items-center gap-1">
//                   <Plus size={14} /> Add Money
//                 </button>
//               </div>

//               <h4 className="text-sm font-medium text-[#5C5954] mb-2 flex-shrink-0">
//                  Recent Transactions
//               </h4>

//               {/* Scrollable Container */}
//               <div 
//                 className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
//                 onScroll={handleScroll}
//               >
//                 {transactions.length > 0 ? (
//                   <>
//                     {transactions.map((tx) => {
//                       const isCredit = tx.type === 'TOPUP' || tx.type === 'credit'; 
//                       return (
//                         <div key={tx._id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
//                           <div className="flex items-center gap-3">
//                              <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
//                                 isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
//                              }`}>
//                                 {isCredit ? <Plus size={14} /> : <ArrowRight size={14} className="-rotate-45" />}
//                              </div>
//                              <div>
//                                 <p className="font-medium text-[#2D2A26] capitalize text-xs sm:text-sm">
//                                    {tx.type.toLowerCase()}
//                                 </p>
//                                 <p className="text-[10px] sm:text-xs text-[#8C877D]">
//                                    {new Date(tx.createdAt).toLocaleDateString()}
//                                 </p>
//                              </div>
//                           </div>
//                           <span className={`font-medium text-xs sm:text-sm ${isCredit ? 'text-green-600' : 'text-[#2D2A26]'}`}>
//                             {isCredit ? '+' : '-'} ₹{tx.amount}
//                           </span>
//                         </div>
//                       );
//                     })}

//                     {loadingMore && (
//                       <div className="flex justify-center py-4">
//                         <Loader2 size={20} className="animate-spin text-[#173F3A]" />
//                       </div>
//                     )}

//                     {/* HYBRID BUTTON: Shows when list is short but there is more data */}
//                     {hasMore && !loadingMore && transactions.length < 5 && (
//                       <button 
//                         onClick={loadMoreTransactions}
//                         className="w-full py-2 mt-2 text-xs text-[#173F3A] bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
//                       >
//                          Load more <ChevronDown size={12}/>
//                       </button>
//                     )}
                    
//                     {!hasMore && transactions.length > 3 && (
//                        <p className="text-center text-[10px] text-[#8C877D] py-4">
//                          - End of history -
//                        </p>
//                     )}
//                   </>
//                 ) : (
//                   <p className="text-xs text-[#8C877D] italic text-center py-8">No transactions yet.</p>
//                 )}
//               </div>
//             </div>
            
//             <div className="relative overflow-hidden bg-[#173F3A] rounded-2xl p-6 text-white shadow-lg">
//                <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#E8F4F1] rounded-full opacity-10 blur-2xl" />
//                <h3 className="relative z-10 font-serif text-xl mb-2">Need to talk?</h3>
//                <p className="relative z-10 text-[#BCCECE] text-sm mb-6 leading-relaxed">
//                   Our listeners are available 24/7. Find someone who resonates with you.
//                </p>
//                <button onClick={() => navigate(API_PATHS.SESSION.BOOK)} className="relative z-10 w-full py-3 bg-[#E8F4F1] text-[#173F3A] font-medium rounded-xl hover:bg-white transition-colors">
//                   Book a Session
//                </button>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ... Subcomponents (Keep as is) ...
// function StatCard({ icon: Icon, label, value, color }) {
//   return (
//     <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8E6E1] flex flex-col justify-between h-32 transition-transform hover:-translate-y-1">
//       <div className="flex items-start justify-between">
//         <p className="text-[#5C5954] text-sm font-medium">{label}</p>
//         <div className={`p-2 rounded-lg ${color}`}>
//           <Icon size={18} />
//         </div>
//       </div>
//       <p className="font-serif text-3xl text-[#2D2A26]">{value}</p>
//     </div>
//   );
// }

// function SectionContainer({ title, icon: Icon, children }) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1]">
//       <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
//         <Icon size={20} className="text-[#173F3A]" />
//         <h2 className="font-serif text-xl text-[#2D2A26]">{title}</h2>
//       </div>
//       {children}
//     </div>
//   );
// }

// function EmptyState({ message, actionLabel, onAction }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
//        <div className="h-16 w-16 bg-[#FDFCF8] rounded-full flex items-center justify-center border border-dashed border-[#8C877D]">
//           <Calendar size={24} className="text-[#8C877D] opacity-50" />
//        </div>
//        <p className="text-[#5C5954]">{message}</p>
//        {actionLabel && (
//           <button onClick={onAction} className="text-[#173F3A] font-medium text-sm hover:underline">
//              {actionLabel}
//           </button>
//        )}
//     </div>
//   );
// }

// export default DashboardPage;


'use client';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, Clock, Calendar, Star, Plus, 
  ArrowRight, History, Video, Loader2, AlertCircle, User, Search, ChevronDown 
} from 'lucide-react';
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination State
  const [transactions, setTransactions] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.USER.DASHBOARD);
        setData(res.data);
        
        // Initial Load (Page 1)
        const initialTx = res.data.walletHistory;
        setTransactions(initialTx);
        
        if (initialTx.length < 3) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // --- INFINITE SCROLL LOGIC ---
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
      console.error("Failed to load history", err);
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

  const { user, overview, upcomingSessions, pastSessions } = data;

  return (
    <div className="min-h-screen w-full bg-[#FDFCF8] p-6 md:p-12">
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
          <StatCard icon={Star} label="Avg Rating" value={overview.avgRatingGiven > 0 ? overview.avgRatingGiven : "-"} color="bg-[#F8F4E3] text-[#975A16]" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* UPCOMING SESSIONS */}
            <SectionContainer title="Upcoming Sessions" icon={Calendar}>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <SessionCard key={session._id} session={session} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No upcoming sessions scheduled." actionLabel="Book a Session" onAction={() => navigate(API_PATHS.SESSION.BOOK)} />
              )}
            </SectionContainer>
            
            {/* Session History */}
            <SectionContainer title="Session History" icon={History}>
              {pastSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-sm text-[#8C877D] border-b border-gray-100">
                        <th className="py-3 font-medium">Listener</th>
                        <th className="py-3 font-medium">Date</th>
                        <th className="py-3 font-medium">Status</th>
                        <th className="py-3 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-[#5C5954]">
                      {pastSessions.map((session) => (
                        <tr key={session._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-3 font-medium text-[#2D2A26]">{session.listenerId?.username || "Unassigned"}</td>
                          <td className="py-3">{new Date(session.scheduledDate).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>{session.status}</span>
                          </td>
                          <td className="py-3 text-right">₹{session.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-[#8C877D] text-sm italic">
                  No session history yet.
                </div>
              )}
            </SectionContainer>
          </div>

          <div className="space-y-8">
            {/* Wallet */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E6E1] flex flex-col h-auto max-h-[380px]"> 
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="font-serif text-lg text-[#2D2A26] flex items-center gap-2">
                  <Wallet size={20} className="text-[#173F3A]" /> Wallet
                </h3>
                <button onClick={() => navigate(API_PATHS.WALLET.ADD_MONEY)} className="text-xs font-medium bg-[#173F3A] text-white px-3 py-1.5 rounded-lg hover:bg-[#0F2926] transition-colors flex items-center gap-1">
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
               <button onClick={() => navigate(API_PATHS.SESSION.BOOK)} className="relative z-10 w-full py-3 bg-[#E8F4F1] text-[#173F3A] font-medium rounded-xl hover:bg-white transition-colors">Book a Session</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- THE SMART SESSION CARD ---
function SessionCard({ session }) {
  const [canJoin, setCanJoin] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [checking, setChecking] = useState(false);
  
  const status = session.status;
  const isPending = status === 'pending';
  const isAssigned = status === 'assigned' || status === 'ongoing';
  
  // Pick the correct time
  const targetTime = isAssigned ? session.scheduledStartAt : (session.preferredTimeStart || session.scheduledDate);
  const dateObj = new Date(targetTime);
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  useEffect(() => {
    if (!isAssigned) return;

    // Local Timer
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

    // Server Validation Poll
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
    //   console.log(session);
      if (res.data.allowed) {
        window.open(res.data.session.meetLink, "_blank");
      }
    } catch (err) {
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

// --- SUBCOMPONENTS (UNABBREVIATED) ---

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