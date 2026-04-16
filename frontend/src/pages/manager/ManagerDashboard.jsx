'use client';
import { useState, useEffect } from "react";
import { 
   Users,  
   DollarSign, Headphones, Target, CheckCircle,
   Menu,  TrendingUp, TrendingDown
} from "lucide-react";

import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import ManagerSidebar from "../../components/layout/ManagerSidebar";
import SolanceLoader from "../../components/layout/SolanceLoader";
const ManagerDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.MANAGER.GET_METRICS);
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <SolanceLoader/>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] text-red-500 font-medium">
      {error}
    </div>
  );

  // --- DATA MAPPING ---
  const { executiveSummary, monthlyGoals, retention, historicalTrend } = metrics;


  //fake data 
  const demoHistoricalTrend = [
    { name: "Apr", revenue: 1200, payouts: 960 },
    { name: "May", revenue: 2100, payouts: 1680 },
    { name: "Jun", revenue: 1800, payouts: 1440 },
    { name: "Jul", revenue: 3400, payouts: 2720 },
    { name: "Aug", revenue: 2800, payouts: 2240 },
    { name: "Sep", revenue: 4900, payouts: 3920 },
    { name: "Oct", revenue: 4200, payouts: 3360 },
    { name: "Nov", revenue: 6100, payouts: 4880 },
    { name: "Dec", revenue: 5800, payouts: 4640 },
    { name: "Jan", revenue: 8400, payouts: 6720 },
    { name: "Feb", revenue: 7200, payouts: 5760 },
    { name: "Mar", revenue: 9800, payouts: 7840 }
  ];

  const demoPieData = [
    { name: 'Repeat Clients', value: 845, color: '#173F3A' }, 
    { name: 'First-Time', value: 312, color: '#3B82F6' }   
  ];

  const pieData = [
    { name: 'Repeat Clients', value: retention?.repeatSessions || 0, color: '#173F3A' }, // Solance Dark Green
    { name: 'First-Time', value: retention?.firstTimeSessions || 0, color: '#3B82F6' }   // Smooth Blue
  ];

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-[#2D2A26] overflow-hidden selection:bg-[#173F3A] selection:text-white">
      
      {/* 🟢 SIDEBAR */}  
      <ManagerSidebar isSidebarOpen={isSidebarOpen} />

      {/* 🟢 MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* ULTRA-CLEAN HEADER */}
        <header className="pt-12 pb-8 px-10 shrink-0 flex items-end justify-between border-b border-transparent">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#8C877D] hover:text-[#173F3A] transition-colors">
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#173F3A] tracking-tight">Welcome back, Manager.</h1>
              <p className="text-[#8C877D] font-medium mt-1.5 text-sm">Here is what is happening with Solance today.</p>
            </div>
          </div>
          <div className="text-xs font-bold bg-white border border-[#E8E6E1] px-4 py-2 rounded-lg text-[#2D2A26] shadow-sm uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Current Month
          </div>
        </header>

        {/* DASHBOARD SCROLL AREA */}
        <div className="flex-1 overflow-y-auto px-10 pb-12 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* 📊 ROW 1: EXECUTIVE CARDS (Hover to reveal growth) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Revenue" 
                value={`$${executiveSummary.totalRevenue.toLocaleString()}`} 
                growth={executiveSummary.revenueGrowth} 
                icon={<DollarSign size={22} className="text-[#173F3A]"/>} 
              />
              <StatCard 
                title="Active Users" 
                value={executiveSummary.activeUsers.toLocaleString()} 
                growth={executiveSummary.userGrowth} 
                icon={<Users size={22} className="text-[#3B82F6]"/>} 
              />
              <StatCard 
                title="Completed Sessions" 
                value={executiveSummary.totalSessions.toLocaleString()} 
                growth={executiveSummary.sessionGrowth} 
                icon={<CheckCircle size={22} className="text-[#D97757]"/>} 
              />
              <StatCard 
                title="Active Listeners" 
                value={executiveSummary.activeListeners.toLocaleString()} 
                growth={executiveSummary.listenerGrowth} 
                icon={<Headphones size={22} className="text-[#F59E0B]"/>} 
              />
            </div>

            {/* 📈 ROW 2: MAIN VISUALIZATIONS */}
            
            {/* 📈 ROW 2: MAIN VISUALIZATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Overlapping Area Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E6E1] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-[#2D2A26]">Financial Overview</h3>
                    <p className="text-xs text-[#8C877D] mt-1">Platform Revenue vs Listener Payouts</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#173F3A]"></div>
                      <span className="text-xs font-bold text-[#8C877D] uppercase tracking-wider">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                      <span className="text-xs font-bold text-[#8C877D] uppercase tracking-wider">Payouts</span>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {/* 🟢 FIX 1: Added bottom: 20 to the margin so the months don't get chopped off */}
                    <AreaChart data={demoHistoricalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#173F3A" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#173F3A" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0EC" />
                      {/* 🟢 FIX 2: Reduced dy to 10 for perfect spacing */}
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8C877D', fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#8C877D', fontWeight: 500}} tickFormatter={(v) => `$${v}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E8E6E1', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '12px' }}
                      />
                      {/* Payouts (Blue) */}
                      <Area type="monotone" dataKey="payouts" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorPayout)" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3B82F6' }} activeDot={{ r: 6 }} />
                      {/* Revenue (Green) */}
                      <Area type="monotone" dataKey="revenue" stroke="#173F3A" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#173F3A' }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Client Loyalty Donut */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E8E6E1] p-8 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-[#2D2A26] mb-1">Client Retention</h3>
                <p className="text-xs text-[#8C877D] mb-8">Session loyalty breakdown</p>
                
                <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demoPieData}
                        cx="50%" cy="50%"
                        innerRadius={80} outerRadius={100}
                        paddingAngle={5} dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {demoPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {/* 🟢 FIX 3: Pointed this to demoPieData[0].value instead of the real retention.repeatSessions */}
                    <span className="text-4xl font-bold text-[#173F3A]">{demoPieData[0].value}</span>
                    <span className="text-[10px] text-[#8C877D] font-bold uppercase tracking-widest mt-1">Repeat</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  {demoPieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-[#5C5954] font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-[#2D2A26]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 🎯 ROW 3: TARGETS & PROGRESS (Matching your 2nd image) */}
            <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-lg font-bold text-[#2D2A26]">Monthly Goals</h3>
                   <p className="text-xs text-[#8C877D] mt-1">Track progress toward auto-generated targets</p>
                 </div>
                 <div className="p-3 bg-[#F8FAFC] rounded-xl text-[#173F3A]">
                   <Target size={20} />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Revenue Target */}
                 <div className="group">
                   <div className="flex justify-between items-end mb-3">
                     <span className="text-sm font-bold text-[#5C5954]">Monthly Revenue</span>
                     <span className="text-sm font-bold text-[#2D2A26]">${monthlyGoals.revenue.current.toLocaleString()} <span className="text-[#8C877D] font-medium ml-1">/ ${monthlyGoals.revenue.target.toLocaleString()}</span></span>
                   </div>
                   <div className="w-full bg-[#F1F0EC] rounded-full h-3 overflow-hidden relative">
                     <div 
                       className="bg-[#173F3A] h-full rounded-full transition-all duration-1000 ease-out" 
                       style={{ width: `${monthlyGoals.revenue.progressPercent}%` }}
                     ></div>
                   </div>
                   <p className="text-right text-[10px] font-bold text-[#8C877D] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     {monthlyGoals.revenue.progressPercent}% Achieved
                   </p>
                 </div>

                 {/* Session Target */}
                 <div className="group">
                   <div className="flex justify-between items-end mb-3">
                     <span className="text-sm font-bold text-[#5C5954]">Session Volume</span>
                     <span className="text-sm font-bold text-[#2D2A26]">{monthlyGoals.sessions.current.toLocaleString()} <span className="text-[#8C877D] font-medium ml-1">/ {monthlyGoals.sessions.target.toLocaleString()}</span></span>
                   </div>
                   <div className="w-full bg-[#F1F0EC] rounded-full h-3 overflow-hidden relative">
                     <div 
                       className="bg-[#3B82F6] h-full rounded-full transition-all duration-1000 ease-out" 
                       style={{ width: `${monthlyGoals.sessions.progressPercent}%` }}
                     ></div>
                   </div>
                   <p className="text-right text-[10px] font-bold text-[#8C877D] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     {monthlyGoals.sessions.progressPercent}% Achieved
                   </p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- REUSABLE SUB-COMPONENTS ---

const SidebarItem = ({ icon, label, active, isOpen }) => (
  <button className={`flex items-center w-full p-3.5 rounded-xl transition-all overflow-hidden group
    ${active ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}
  `}>
    <div className={`shrink-0 transition-transform ${!active && 'group-hover:scale-110'}`}>{icon}</div>
    {isOpen && <span className="ml-4 text-sm font-medium tracking-wide">{label}</span>}
  </button>
);

const StatCard = ({ title, value, growth, icon }) => {
  const isPositive = growth >= 0;
  
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-sm relative overflow-hidden group hover:border-[#173F3A]/30 transition-all cursor-default flex flex-col justify-center min-h-[140px]">
      
      {/* Primary Content (Visible by default, slides up slightly on hover) */}
      <div className="flex justify-between items-start transform transition-transform duration-300 group-hover:-translate-y-2">
        <div>
          <h4 className="text-[#8C877D] text-xs font-bold uppercase tracking-wider mb-2">{title}</h4>
          <span className="text-4xl font-bold text-[#2D2A26] tracking-tight">{value}</span>
        </div>
        <div className="p-3 bg-[#F8FAFC] rounded-2xl text-gray-500 group-hover:scale-110 transition-transform duration-300 shadow-inner">
          {icon}
        </div>
      </div>
      
      {/* Hidden Hover Content (Fades in at the bottom) */}
      <div className="absolute bottom-4 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
        <div className={`flex items-center justify-center p-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isPositive ? <TrendingUp size={12} strokeWidth={3}/> : <TrendingDown size={12} strokeWidth={3}/>}
        </div>
        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {Math.abs(growth)}% {isPositive ? 'increase' : 'decrease'}
        </span>
        <span className="text-xs font-medium text-[#8C877D]">vs last month</span>
      </div>
    </div>
  );
};

export default ManagerDashboard;