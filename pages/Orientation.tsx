
import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { ShieldCheck, Download } from 'lucide-react';
import { APP_POLICIES } from '../types';

const Orientation: React.FC = () => {
  const { auth } = useStore();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">My Signed Policies</h1>
            <p className="text-slate-500 mt-2">Reference copy of the agreement you signed.</p>
        </div>
        
        {auth.user?.orientationSigned && (
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-3 text-green-700">
                <ShieldCheck size={20} />
                <div className="text-sm">
                    <p className="font-bold">Status: Signed & Active</p>
                    <p className="text-xs opacity-80">{new Date(auth.user.orientationDate!).toLocaleDateString()}</p>
                </div>
            </div>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <div className="h-[60vh] overflow-y-auto p-8 space-y-8 text-slate-700 leading-relaxed scrollbar-hide">
            {APP_POLICIES.map((policy) => (
                <div key={policy.id} className="relative pl-6 border-l-4 border-slate-200 hover:border-gps-blue transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{policy.title}</h3>
                    <p className="text-slate-600 mb-4">{policy.content}</p>
                    {policy.items && (
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            {policy.items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
            
            <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                 <p className="italic text-slate-500 mb-4">Digitally signed by</p>
                 <div className="font-handwriting text-3xl text-gps-blue font-bold opacity-80 rotate-[-2deg]">
                    {auth.user?.name}
                 </div>
                 <p className="text-xs text-slate-400 mt-2">ID: {auth.user?.id} • {new Date(auth.user?.orientationDate || '').toLocaleString()}</p>
            </div>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-center">
             <button className="flex items-center gap-2 text-slate-600 hover:text-gps-blue font-medium transition-colors text-sm">
                <Download size={16} /> Download Copy as PDF
             </button>
        </div>
      </div>
    </div>
  );
};

export default Orientation;
