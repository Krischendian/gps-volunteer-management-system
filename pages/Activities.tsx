
import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { MapPin, Calendar, Users, Check, X, Share2, AlertCircle, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { UserRole } from '../types';

const Activities: React.FC = () => {
  const { activities, registerForActivity, cancelRegistration, addActivity, updateActivity, deleteActivity, auth } = useStore();
  const isAdmin = auth.user?.role === UserRole.ADMIN;

  // Registration/Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [leaveReason, setLeaveReason] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Edit/Create Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image: '',
    capacity: 20
  });

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
    const link = `https://volunteer.gps.org/join?activity=${activityId}`;
    navigator.clipboard.writeText(`Join me at "${title}"! Sign up here: ${link}`);
    setCopiedId(activityId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Admin Functions ---

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      date: '',
      location: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1512474932049-78ea696f5c42?q=80&w=800&auto=format&fit=crop', // Default image
      capacity: 20
    });
    setShowAdminModal(true);
  };

  const openEditModal = (act: any) => {
    setEditingId(act.id);
    setFormData({
      title: act.title,
      date: act.date,
      location: act.location,
      description: act.description,
      image: act.image,
      capacity: act.capacity
    });
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateActivity(editingId, formData);
    } else {
      await addActivity(formData);
    }
    setShowAdminModal(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this activity? This cannot be undone.")) {
      await deleteActivity(id);
    }
  };

  return (
    <div className="animate-fade-in pb-20 relative">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Volunteer Opportunities</h1>
            <p className="text-slate-500 mt-2">Find and register for upcoming events.</p>
        </div>
        
        {isAdmin && (
            <button 
                onClick={openCreateModal}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
            >
                <Plus size={20} /> Create Activity
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col border border-white/50 relative">
            
            {/* Admin Controls Overlay */}
            {isAdmin && (
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <button 
                        onClick={() => openEditModal(activity)}
                        className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full shadow-md hover:text-blue-600 transition-colors"
                        title="Edit Activity"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => handleDelete(activity.id)}
                        className="bg-white/90 backdrop-blur text-slate-700 p-2 rounded-full shadow-md hover:text-red-600 transition-colors"
                        title="Delete Activity"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

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

              <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3 whitespace-pre-line">{activity.description}</p>
                
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

      {/* Admin Create/Edit Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-up border-4 border-white max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">
                        {editingId ? 'Edit Activity' : 'Create New Activity'}
                    </h3>
                    <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Christmas Party"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capacity</label>
                            <input 
                                type="number" 
                                required
                                min="1"
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none"
                                value={formData.capacity}
                                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g. 123 Main St"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Image URL</label>
                        <input 
                            type="url" 
                            required
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none"
                            value={formData.image}
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Paste a direct link to an image (e.g. from Unsplash)</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                        <textarea 
                            required
                            rows={4}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-gps-blue outline-none"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Details about the event..."
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full py-3 rounded-xl font-bold text-white bg-gps-blue hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {editingId ? 'Update Activity' : 'Create Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
