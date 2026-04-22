import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, ShieldAlert, LogOut, Headphones, Activity, CreditCard , AlertCircle,Users
} from "lucide-react";
import { useAuth } from "../../context/useAuth"; 

const ManagerSidebar = ({ isSidebarOpen }) => {
  const location = useLocation(); // 🟢 Automatically gets the current URL path
  const currentPath = location.pathname;
  const { logout } = useAuth(); 

  return (
    <aside className={`bg-[#173F3A] text-white transition-all duration-300 flex flex-col z-20 shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-24 flex items-center px-6 border-b border-white/10 shrink-0">
        <Activity size={24} className="text-[#E8F4F1] mr-3 shrink-0" />
        {isSidebarOpen && <span className="font-serif font-bold text-xl tracking-widest">Vozranow</span>}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          <Link to="/manager/dashboard" className="block">
            <SidebarItem 
              icon={<LayoutDashboard size={20}/>} 
              label="Overview" 
              active={currentPath === '/manager/dashboard'} 
              isOpen={isSidebarOpen} 
            />
          </Link>
          
          <Link to="/manager/financials" className="block">
            <SidebarItem 
              icon={<CreditCard size={20}/>} 
              label="Financials" 
              active={currentPath === '/manager/financials'} 
              isOpen={isSidebarOpen} 
            />
          </Link>
          
          <div className="my-6 border-t border-white/10"></div>
          
          <Link to="/manager/listeners" className="block">
            <SidebarItem 
              icon={<Headphones size={20}/>} 
              label="Listeners" 
              active={currentPath === '/manager/listeners'} 
              isOpen={isSidebarOpen} 
            />
          </Link>
          
          {/* Future Routes */}
          <Link to="/manager/sessions" className="block">
            <SidebarItem 
              icon={<Activity size={20}/>} // Or use Video/Clock icon
              label="Session Logs" 
              active={currentPath === '/manager/sessions'} 
              isOpen={isSidebarOpen} 
            />
          </Link>
          
          <Link to="/manager/assign" className="block">
            <SidebarItem 
              icon={<ShieldAlert size={20}/>} 
              label="Assign Session" 
              active={currentPath === '/manager/logs'} 
              isOpen={isSidebarOpen} 
            />
          </Link>
        <Link to="/manager/disputes" className="block">
          <SidebarItem
            icon={<AlertCircle size={20} />}
            label="Active Disputes"
            active={currentPath === '/manager/disputes'}
            isOpen={isSidebarOpen}
          />
        </Link>
        <Link to="/manager/directory" className="block">
          <SidebarItem
            icon={<Users size={20} />}
            label="Staff Directory"
            active={currentPath === '/manager/directory'}
            isOpen={isSidebarOpen}
          />
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white"
        >
          <LogOut size={18} className="shrink-0" />
          {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

// Internal reusable item
const SidebarItem = ({ icon, label, active, isOpen }) => (
  <div className={`flex items-center w-full p-3.5 rounded-xl transition-all overflow-hidden group cursor-pointer
    ${active ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}
  `}>
    <div className={`shrink-0 transition-transform ${!active && 'group-hover:scale-110'}`}>{icon}</div>
    {isOpen && <span className="ml-4 text-sm font-medium tracking-wide">{label}</span>}
  </div>
);

export default ManagerSidebar;