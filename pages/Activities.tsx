import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { MapPin, Calendar, Users, Check, X, Share2, AlertCircle } from 'lucide-react';

const Activities: React.FC = () => {
  const { activities, registerForActivity, cancelRegistration } = useStore();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [leaveReason, setLeaveReason] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRegister = (id: string) => {
    registerForActivity(id);
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

  const handleInvite = (activityId: string, title: string) => {
    // Simulate invite link
    const link = `https://volunteer.gps.org/join?activity=${activityId}`;
    navigator.clipboard.writeText(`Join me at "${title}"! Sign up here: ${link}`);
    setCopiedId(activityId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in pb-20 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Volunteer Opportunities</h1>
        <p className="text-slate-500 mt-2">Find and register for upcoming events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col border border-white/50">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={activity.image} 
                alt={activity.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-md">
                {activity.capacity - activity.registeredCount} spots left
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-gps-blue transition-colors">{activity.title}</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} className="text-brand-500" />
                    {new Date(activity.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={16} className="text-brand-500" />
                    {activity.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users size={16} className="text-brand-500" />
                    {activity.registeredCount} / {activity.capacity} Registered
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{activity.description}</p>
                
              <div className="flex gap-2">
                  <button 
                     onClick={() => handleInvite(activity.id, activity.title)}
                     className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-gps-blue transition-colors relative"
                     title="Invite a friend"
                  >
                      <Share2 size={20} />
                      {copiedId === activity.id && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            Link Copied!
                        </span>
                      )}
                  </button>

                  {activity.isRegistered ? (
                        <button
                            onClick={() => initiateLeave(activity.id)}
                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                             <X size={18} /> Cancel
                        </button>
                  ) : (
                      <button
                        onClick={() => handleRegister(activity.id)}
                        disabled={activity.registeredCount >= activity.capacity}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform group-hover:scale-[1.02] ${
                            activity.registeredCount >= activity.capacity
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-200'
                        }`}
                      >
                        {activity.registeredCount >= activity.capacity ? 'Full Capacity' : <><Check size={18} /> Sign Up</>}
                      </button>
                  )}
              </div>
            </div>
          </div>
        ))}
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
                    We are sorry to see you go! Please provide a reason for cancelling your registration so we can improve our planning.
                </p>
                <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Family emergency, scheduling conflict..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32 text-sm mb-6 bg-slate-50"
                />
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowLeaveModal(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Keep Spot
                    </button>
                    <button 
                        onClick={confirmLeave}
                        disabled={!leaveReason.trim()}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-red-100 transform active:scale-95 transition-transform"
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Activities;