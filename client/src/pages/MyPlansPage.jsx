import { Link } from 'react-router-dom';
import { Calendar, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function MyPlansPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Itinerary Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-charcoal">My Travel Itineraries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Trips organized for <span className="font-semibold text-brand-emerald">{user?.name}</span>
          </p>
        </div>

        <Link
          to="/planner"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold hover:bg-emerald-800 transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-brand-mint" />
          <span>New AI Plan</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-14 h-14 bg-brand-sand rounded-2xl flex items-center justify-center text-brand-emerald mx-auto">
          <Calendar className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-brand-charcoal">No Itineraries Recorded Yet</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Use our conversational tourism planner to generate customized multi-day expeditions with realistic travel durations and lodging recommendations.
        </p>
        <div className="pt-2">
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-brand-mint" />
            <span>Create Itinerary</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
