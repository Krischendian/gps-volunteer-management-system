
import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Search, CheckCircle, XCircle, ShieldCheck, Mail, Clock, Calendar } from 'lucide-react';
import { UserRole } from '../types';

const AdminUsers: React.FC = () => {
  const { allUsers, sessions } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate stats for each user
  const usersWithStats = useMemo(() => {
    return allUsers.map(user => {
      const userSessions = sessions.filter(s => s.userId === user.id);
      const totalHours = userSessions.reduce((acc, curr) => acc + curr.hours, 0);
      const lastActive = userSessions.length > 0 
        ? userSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
        : 'Never';
      
      return {
        ...user,
        totalHours,
        lastActive,
        sessionsCount: userSessions.length
      };
    });
  }, [allUsers, sessions]);

  // Filter
  const filteredUsers = usersWithStats.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Volunteer Directory</h1>
            <p className="text-slate-500 mt-2">Manage registered users and view their contributions.</p>
        </div>
        
        <div className="relative w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all text-sm bg-white shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Contribution</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Last Active</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            {user.name}
                                            {user.role === UserRole.ADMIN && (
                                                <span className="bg-gps-blue/10 text-gps-blue text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border border-gps-blue/20 flex items-center gap-1">
                                                    <ShieldCheck size={10} /> Admin
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400">ID: {user.id.slice(0, 6)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail size={14} className="text-slate-400" />
                                        {user.email}
                                    </div>
                                    {/* Phone placeholder if implemented later */}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {user.orientationSigned ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
                                        <CheckCircle size={12} /> Orientation Signed
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                                        <Clock size={12} /> Pending Orientation
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="font-bold text-gps-blue text-lg">{user.totalHours} <span className="text-xs text-slate-400 font-normal">hrs</span></div>
                                <div className="text-xs text-slate-400">{user.sessionsCount} sessions</div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-slate-600">
                                {user.lastActive}
                            </td>
                        </tr>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-slate-400">
                                No users found matching "{searchTerm}"
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
