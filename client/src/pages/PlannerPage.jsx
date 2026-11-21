import { useState } from 'react';
import { Sparkles, Calendar, MapPin, DollarSign, Send } from 'lucide-react';

export default function PlannerPage() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState('moderate');
  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand text-brand-emerald text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
          AI-Powered Itinerary Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal">
          Plan Your Custom Pakistan Itinerary
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Tailored daily schedules, estimated transport times, altitude acclimatization checkpoints, and regional highlights.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-emerald" />
              Target Destination or Region
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Hunza & Skardu, Swat Valley, or Lahore Culture Walk"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-emerald" />
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand-emerald" />
                Budget Tier
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald bg-white"
              >
                <option value="budget">Backpacker / Budget-Friendly</option>
                <option value="moderate">Moderate Comfort</option>
                <option value="luxury">Luxury & Premium Resorts</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-brand-mint" />
            <span>{submitting ? 'Synthesizing Itinerary...' : 'Generate Itinerary with AI'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
