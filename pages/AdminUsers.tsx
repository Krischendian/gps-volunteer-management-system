
import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Search, CheckCircle, XCircle, ShieldCheck, Mail, Clock, Calendar, Eye, User, Briefcase, FileText, Phone, MapPin, X } from 'lucide-react';
import { UserRole, User as UserType } from '../types';

const AdminUsers: React.FC = () => {
  const { allUsers, sessions } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

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

  // Filter sessions for the selected user in modal
  const selectedUserSessions = useMemo(() => {
      if (!selectedUser) return [];
      return sessions.filter(s => s.userId === selectedUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedUser, sessions]);

  return (
    <div className="animate-fade-in pb-20 relative">
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
            <table className="w-full text-left min-w-[900px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Contribution</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Last Active</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
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
                                    {user.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone size={14} className="text-slate-400" />
                                            {user.phone}
                                        </div>
                                    )}
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
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => { setSelectedUser(user); setActiveTab('profile'); }}
                                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-gps-blue hover:border-gps-blue/30 hover:bg-gps-blue/5 transition-all shadow-sm"
                                    title="View Details"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-400">
                                No users found matching "{searchTerm}"
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl animate-scale-up border-4 border-white flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gps-blue to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{selectedUser.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                    <Mail size={14} /> {selectedUser.email}
                                </span>
                                {selectedUser.role === UserRole.ADMIN && (
                                    <span className="bg-gps-blue/10 text-gps-blue text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border border-gps-blue/20 font-bold">
                                        ADMIN
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedUser(null)} 
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-gps-blue text-gps-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Profile Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`py-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-gps-blue text-gps-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Activity History ({selectedUserSessions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {activeTab === 'profile' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <User size={14} /> Basic Info
                                    </h4>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Phone:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.phone || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Age:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.age || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Gender:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.gender || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Address:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.address || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Status:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.statusInCanada || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Briefcase size={14} /> Background
                                    </h4>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Occupation:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.occupation || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">School/Org:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.schoolOrg || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Identity:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.identity || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Languages:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.languages || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={14} /> Skills & Experience
                                    </h4>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
                                        <div>
                                            <span className="text-xs text-slate-500 block mb-1">Skills:</span>
                                            <p className="text-sm text-slate-800 font-medium">{selectedUser.skills || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 block mb-1">Experience:</span>
                                            <p className="text-sm text-slate-800 font-medium whitespace-pre-line">{selectedUser.experience || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ShieldCheck size={14} /> Safety & Admin
                                    </h4>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Medical:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.medicalConditions || 'None'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Referral:</span>
                                            <span className="col-span-2 text-slate-800 font-medium">{selectedUser.referralSource || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <span className="text-slate-500">Orientation:</span>
                                            <span className="col-span-2">
                                                {selectedUser.orientationSigned ? (
                                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle size={14} /> Signed ({new Date(selectedUser.orientationDate!).toLocaleDateString()})
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 font-bold flex items-center gap-1">
                                                        <Clock size={14} /> Pending
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedUserSessions.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Activity</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Supervisor</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Hours</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedUserSessions.map(session => (
                                            <tr key={session.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm text-slate-600 font-medium">{session.date}</td>
                                                <td className="px-4 py-3 text-sm text-slate-800 font-bold">{session.eventName}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{session.supervisorName}</td>
                                                <td className="px-4 py-3 text-sm text-gps-blue font-bold text-right">{session.hours}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500 italic max-w-xs truncate" title={session.description}>
                                                    {session.description}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>No activity logs found for this volunteer.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
