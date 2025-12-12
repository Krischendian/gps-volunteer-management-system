import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Clock, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LogHours: React.FC = () => {
  const { logSession } = useStore();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventName, setEventName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? Number(diff.toFixed(2)) : 0;
  };

  const hours = calculateHours();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours <= 0 || !description || !eventName || !supervisorName) return;

    logSession({
      date,
      eventName, // Program Name
      supervisorName,
      startTime,
      endTime,
      hours,
      description
    });
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Log Volunteer Hours</h1>
        <p className="text-slate-500 mt-2">Record your contribution to the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Program / Event Name</label>
            <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Food Drive"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
            />
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Supervisor's Name</label>
            <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Date</label>
                {/* Shortened width on mobile (w-[90%]) and reduced padding */}
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-[90%] md:w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm md:text-base"
                    required
                />
            </div>
            
            <div className="bg-brand-50 rounded-xl p-4 flex flex-col justify-center items-center text-center border border-brand-100">
                <span className="text-xs md:text-sm font-medium text-brand-600 uppercase tracking-wide">Total Duration</span>
                <span className="text-3xl md:text-4xl font-bold text-brand-700 mt-1">{hours} <span className="text-base md:text-lg font-medium text-brand-500">hrs</span></span>
            </div>
        </div>

        {/* Increased gap to gap-8 to separate Start and End time more */}
        <div className="grid grid-cols-2 gap-8 md:gap-6">
             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                    Start Time
                </label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm md:text-base"
                    required
                />
            </div>
             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                    End Time
                </label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm md:text-base"
                    required
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Description of Work</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What did you help with today?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                required
            />
        </div>

        <div className="pt-4">
            <button
                type="submit"
                disabled={hours <= 0 || !eventName || !supervisorName}
                className="w-full bg-brand-600 disabled:bg-slate-300 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
                <Save size={20} />
                Submit Session
            </button>
        </div>
      </form>
    </div>
  );
};

export default LogHours;
