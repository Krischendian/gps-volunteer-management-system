
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, Calendar, FileText, LogOut } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const MobileNav: React.FC = () => {
  const { logout } = useStore();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-4 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-gps-blue' : 'text-slate-400'}`}>
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
      <NavLink to="/log-hours" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-gps-blue' : 'text-slate-400'}`}>
        <Clock size={20} />
        <span className="text-[10px] font-medium">Log</span>
      </NavLink>
      <NavLink to="/activities" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-gps-blue' : 'text-slate-400'}`}>
        <Calendar size={20} />
        <span className="text-[10px] font-medium">Events</span>
      </NavLink>
      <NavLink to="/orientation" className={({isActive}) => `relative flex flex-col items-center gap-1 ${isActive ? 'text-gps-blue' : 'text-slate-400'}`}>
        <FileText size={20} />
        <span className="text-[10px] font-medium">Policies</span>
      </NavLink>
      <button 
        onClick={logout} 
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">Sign Out</span>
      </button>
    </div>
  );
};

export default MobileNav;