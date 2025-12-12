import React, { useEffect, useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Clock, Star, Sparkles, Search, Award, Crown, Zap, Calendar, MapPin, ArrowRight, Share2, X, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { generateImpactMessage } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LEVELS = [
    { name: 'Bronze Volunteer', min: 0, color: 'text-amber-700', bg: 'bg-amber-700', border: 'border-amber-200', icon: Star },
    { name: 'Cobalt', min: 500, color: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-200', icon: Zap },
    { name: 'Silver', min: 1000, color: 'text-slate-600', bg: 'bg-slate-400', border: 'border-slate-300', icon: Award },
    { name: 'Gold', min: 2000, color: 'text-yellow-600', bg: 'bg-yellow-500', border: 'border-yellow-400', icon: Crown },
    { name: 'Platinum', min: 3500, color: 'text-cyan-600', bg: 'bg-cyan-400', border: 'border-cyan-300', icon: Sparkles },
];

const Dashboard: React.FC = () => {
  const { auth, sessions, totalHours, activities, cancelRegistration } = useStore();
  const [aiMessage, setAiMessage] = useState<string>('Generating your impact report...');
  const [loadingAi, setLoadingAi] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Leave Request Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [leaveReason, setLeaveReason] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAdmin = auth.user?.role === 'ADMIN';

  // --- DATA PREPARATION ---
  
  // Admin sees ALL sessions; Volunteer sees only their OWN.
  const mySessions = isAdmin 
    ? sessions 
    : sessions.filter(s => s.userId === auth.user?.id);

  // Admin sees TOTAL hours of organization; Volunteer sees their own.
  const displayHours = isAdmin 
    ? sessions.reduce((acc, s) => acc + s.hours, 0)
    : totalHours;

  const currentPoints = Math.floor(displayHours * 10);
  
  // Determine Level
  const currentLevelIndex = LEVELS.slice().reverse().findIndex(l => currentPoints >= l.min);
  const currentLevel = LEVELS[LEVELS.length - 1 - (currentLevelIndex === -1 ? LEVELS.length - 1 : currentLevelIndex)];
  const nextLevel = LEVELS[LEVELS.length - 1 - currentLevelIndex + 1];
  
  // Progress Logic (Segmented)
  const calculateProgress = (points: number) => {
    if (points >= 3500) return 100;
    
    let basePercent = 0;
    let segmentStart = 0;
    let segmentEnd = 0;

    if (points < 500) {
      basePercent = 0;
      segmentStart = 0;
      segmentEnd = 500;
    } else if (points < 1000) {
      basePercent = 25;
      segmentStart = 500;
      segmentEnd = 1000;
    } else if (points < 2000) {
      basePercent = 50;
      segmentStart = 1000;
      segmentEnd = 2000;
    } else {
      basePercent = 75;
      segmentStart = 2000;
      segmentEnd = 3500;
    }

    const segmentProgress = (points - segmentStart) / (segmentEnd - segmentStart);
    return basePercent + (segmentProgress * 25);
  };

  const progressPercent = calculateProgress(currentPoints);
  const nextLevelPoints = nextLevel ? nextLevel.min : 3500;

  useEffect(() => {
    const fetchAiMessage = async () => {
      if (auth.user && displayHours > 0) {
        setLoadingAi(true);
        // Custom message for Admin
        if (isAdmin) {
             setAiMessage(`Your team has contributed ${displayHours} hours in total! Great leadership.`);
             setLoadingAi(false);
        } else {
            const msg = await generateImpactMessage(auth.user.name, displayHours);
            setAiMessage(msg);
            setLoadingAi(false);
        }
      } else {
        setAiMessage(isAdmin ? "No data collected yet." : "Start logging hours to collect points!");
      }
    };
    fetchAiMessage();
  }, [auth.user, displayHours, isAdmin]);

  // Filter Sessions for Display
  const filteredSessions = mySessions.filter(s => 
    s.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.date.includes(searchTerm)
  );

  // Filter Upcoming Registered Events
  const upcomingEvents = activities.filter(a => a.isRegistered);

  // Chart Data Preparation (Last 6 Months)
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentMonth - i);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        data.push({
            name: months[monthIndex],
            rawMonth: monthIndex,
            rawYear: year,
            hours: 0
        });
    }

    // Populate with session data (All sessions for Admin, My sessions for Volunteer)
    mySessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const sMonth = sessionDate.getMonth();
        const sYear = sessionDate.getFullYear();

        const dataPoint = data.find(d => d.rawMonth === sMonth && d.rawYear === sYear);
        if (dataPoint) {
            dataPoint.hours += session.hours;
        }
    });

    return data;
  };

  const chartData = getChartData();

  const handleInvite = (activityId: string, title: string) => {
    const link = `https://volunteer.gps.org/join?activity=${activityId}`;
    navigator.clipboard.writeText(`Join me at "${title}"! Sign up here: ${link}`);
    setCopiedId(activityId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const initiateLeave = (id: string) => {
    setSelectedActivityId(id);
    setLeaveReason('');
    setShowLeaveModal(true);
  };

  const confirmLeave = () => {
    if (selectedActivityId && leaveReason) {
        cancelRegistration(selectedActivityId, leaveReason);
        setShowLeaveModal(false);
        setSelectedActivityId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {isAdmin ? 'Manager Dashboard' : 'My Profile'}
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            {isAdmin ? 'Overview of all volunteer activities.' : 'Track your journey and rewards.'}
          </p>
        </div>
        {!isAdmin && (
            <Link to="/log-hours" className="w-full md:w-auto bg-gps-blue hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                <Clock size={18} />
                Log Hours
            </Link>
        )}
        {isAdmin && (
            <div className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2">
                <Users size={18} />
                Admin View
            </div>
        )}
      </header>

      {/* TOP ROW: REWARDS & CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        
        {/* REWARDS CARD */}
        {/* Adjusted padding: p-5 md:p-8 */}
        <div className="xl:col-span-2 glass-card rounded-3xl p-5 md:p-8 border border-white/50 shadow-xl relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                
                {/* Points Circle / Badge - Scaled down on mobile */}
                <div className="relative shrink-0">
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 ${currentLevel.border} flex items-center justify-center bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]`}>
                        <div className="text-center">
                            {/* Smaller font on mobile */}
                            <span className={`block text-2xl md:text-3xl font-extrabold ${currentLevel.color}`}>{currentPoints}</span>
                            <span className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-bold">Points</span>
                        </div>
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-800 text-white shadow-lg whitespace-nowrap flex items-center gap-1`}>
                        <currentLevel.icon size={12} className="text-yellow-400 fill-yellow-400" />
                        {isAdmin ? 'Organization' : currentLevel.name}
                    </div>
                </div>

                {/* Progress Bar Area */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-3 gap-1">
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1">
                                {isAdmin ? 'Total Organization Impact' : `Current Status: ${currentLevel.name}`}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500">
                                {isAdmin 
                                    ? "Aggregated data from all volunteers" 
                                    : (nextLevel 
                                        ? `${nextLevelPoints - currentPoints} points to ${nextLevel.name}` 
                                        : "You have reached the highest tier!")}
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Impact</span>
                            <p className="text-lg font-bold text-slate-800">{displayHours} Hours</p>
                        </div>
                    </div>

                    {/* The Bar - Gold Themed */}
                    <div className="h-4 md:h-5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner border border-slate-200 w-full">
                        <div 
                            className="h-full transition-all duration-1000 ease-out relative bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[spin_3s_linear_infinite] opacity-50"></div>
                            
                            {/* Leading Sparkle */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-1 filter drop-shadow-md">
                                <Sparkles size={20} className="text-yellow-100 animate-spin-slow fill-white" />
                            </div>
                        </div>
                    </div>

                    {/* Tiers Legend - Mobile safe */}
                    {!isAdmin && (
                        <div className="flex justify-between mt-3 md:mt-4 text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider relative px-1">
                            <span className="text-left">0</span>
                            <span className="text-center">500</span>
                            <span className="text-center">1000</span>
                            <span className="text-center">2000</span>
                            <span className="text-right">3500+</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* AI Insight Footer */}
            <div className="mt-6 md:mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-center text-center md:text-left">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-2.5 rounded-lg text-amber-600 shrink-0 shadow-sm border border-amber-200">
                    <Sparkles size={18} className="animate-pulse" />
                </div>
                <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{aiMessage}"</p>
            </div>
        </div>

        {/* ACTIVITY CHART */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-white/50 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-gps-green"/>
                {isAdmin ? 'Total Activity' : 'Monthly Activity'}
            </h3>
            {/* Adjusted height for mobile: h-[250px] */}
            <div className="w-full h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#94a3b8'}}
                            dy={10}
                            interval={0}
                        />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#005eb8' : '#e2e8f0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">Volunteer Hours (Last 6 Months)</p>
        </div>
      </div>

      {/* SEARCH & HISTORY SECTION */}
      <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="text-gps-blue" size={24} />
                  {isAdmin ? 'All Volunteer Logs' : 'Past Activities'}
              </h2>
              <div className="relative w-full md:w-auto md:min-w-[320px]">
                  <input 
                    type="text" 
                    placeholder={isAdmin ? "Search logs (e.g. Event Name, 2025-12-01)..." : "Search (e.g. Annual Food Drive, 2025-12-01)..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue focus:border-gps-blue outline-none transition-all text-sm bg-white/80"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-100 mt-2 w-full">
             {filteredSessions.length > 0 ? (
                 <div className="overflow-x-auto w-full">
                     {/* min-w set to ensure table doesn't cramp up on small screens, allowing scroll */}
                     <table className="w-full text-left min-w-[600px]">
                         <thead className="bg-slate-50/80 border-b border-slate-100">
                             <tr>
                                 {/* Adjusted padding for mobile: px-4 */}
                                 <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                 <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Program Name</th>
                                 <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisor</th>
                                 <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hours</th>
                                 <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Points</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {filteredSessions.map((s) => (
                                 <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                                     <td className="px-4 md:px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{s.date}</td>
                                     <td className="px-4 md:px-6 py-4 text-sm text-slate-800 font-semibold">{s.eventName}</td>
                                     <td className="px-4 md:px-6 py-4 text-sm text-slate-600">{s.supervisorName}</td>
                                     <td className="px-4 md:px-6 py-4 text-sm text-slate-600 text-right">{s.hours}</td>
                                     <td className="px-4 md:px-6 py-4 text-sm font-bold text-gps-blue text-right">+{Math.floor(s.hours * 10)} pts</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             ) : (
                 <div className="text-center py-12">
                     <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search size={24} className="text-slate-300" />
                     </div>
                     <p className="text-slate-500 font-medium">No records found.</p>
                     {searchTerm && <p className="text-xs text-slate-400 mt-1">Try searching for something else.</p>}
                 </div>
             )}
          </div>
      </div>

       {/* Leave Request Modal */}
       {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up border-4 border-white">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="bg-red-50 p-2 rounded-full"><AlertCircle size={24} /></div>
                    <h3 className="text-xl font-bold">Request Leave</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                    Please tell us why you need to cancel so we can update our schedule.
                </p>
                <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Reason for cancellation..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32 text-sm mb-6 bg-slate-50"
                />
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowLeaveModal(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Back
                    </button>
                    <button 
                        onClick={confirmLeave}
                        disabled={!leaveReason.trim()}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-red-100 transform active:scale-95 transition-transform"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
