
import React, { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, Calendar, FileText, LogOut, Camera, Lock, Users } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import BrandLogo from './BrandLogo';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { logout, auth, setAppLogo } = useStore();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = auth.user?.role === UserRole.ADMIN;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'My Profile' },
    { to: '/log-hours', icon: Clock, label: 'Log Hours' },
    { to: '/activities', icon: Calendar, label: 'Activities' },
    { to: '/orientation', icon: FileText, label: 'Policies' },
  ];

  if (isAdmin) {
      // Insert Volunteers management before Policies or at the end
      navItems.splice(3, 0, { to: '/users', icon: Users, label: 'Volunteers' });
  }

  const handleLogoClick = () => {
    if (isAdmin) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-20 hidden md:flex flex-col shadow-xl">
      <div className="relative px-6 py-6 flex flex-col items-center justify-center border-b border-slate-50 min-h-[160px] hover:bg-slate-50 transition-colors">
        
        {/* Clickable Logo Area - Only for Admins */}
        <div 
            className={`relative w-full flex flex-col items-center justify-center ${isAdmin ? 'cursor-pointer group' : 'cursor-default'}`}
            onClick={handleLogoClick}
            title={isAdmin ? "Click to upload global organization logo" : "Gifted People Services"}
        >
            {/* Hover Overlay - Admin Only */}
            {isAdmin && (
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center z-10">
                     <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-500 bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        <Camera size={12} /> Change Global Logo
                     </span>
                 </div>
            )}

            {/* Adjusted max-width to make logo smaller */}
            <BrandLogo className="w-full h-auto max-w-[140px] pointer-events-none" />
        </div>
        
        {isAdmin && (
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-gps-blue/10 to-transparent text-gps-blue font-semibold border-l-4 border-gps-blue' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-gps-blue' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="flex-1 text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3 px-2 pt-2 border-t border-slate-50">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gps-blue to-gps-green flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
             {auth.user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-sm font-medium text-slate-900 truncate">{auth.user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{auth.user?.email}</p>
            {isAdmin && <p className="text-[10px] text-gps-blue font-bold uppercase mt-0.5">Administrator</p>}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
