import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  MapPin,
  Calendar,
  Coins,
  Users,
  Compass,
  Bookmark,
  Check,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  Utensils,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const INTEREST_OPTIONS = [
  'Culture & Heritage',
  'Mountain Trekking',
  'Local Cuisine',
  'Photography',
  'Relaxation & Scenic Views',
  'Adventure & Camping',
  'Road Trips',
  'Bazaars & Crafts',
];

export default function PlannerPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Form states
  const [destinationId, setDestinationId] = useState('');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState('moderate');
  const [travelersCount, setTravelersCount] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState([
    'Mountain Trekking',
    'Local Cuisine',
  ]);

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [formError, setFormError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch destinations for selector
  const {
    data: destinations = [],
    isLoading: loadingDestinations,
  } = useQuery({
    queryKey: ['destinations-for-planner'],
    queryFn: async () => {
      const response = await api.get('/destinations');
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // AI Itinerary Generation Mutation
  const generateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/itinerary/generate', payload);
      return response.data?.data;
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      setFormError('');
      setSavedSuccess(false);
      // Smooth scroll to generated plan view
      setTimeout(() => {
        document.getElementById('generated-plan-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (err) => {
      setFormError(
        err.response?.data?.message || err.message || 'Failed to generate itinerary. Please try again.'
      );
    },
  });

  // Save Itinerary Mutation
  const saveMutation = useMutation({
    mutationFn: async (planPayload) => {
      const response = await api.post('/itinerary/save', planPayload);
      return response.data?.data;
    },
    onSuccess: () => {
      setSavedSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (err) => {
      setFormError(
        err.response?.data?.message || 'Failed to save itinerary to your account.'
      );
    },
  });

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!destinationId) {
      setFormError('Please select a target destination in Pakistan.');
      return;
    }

    const payload = {
      destinationId,
      days: Number(days),
      budget,
      travelersCount: Number(travelersCount),
      interests: selectedInterests,
    };

    generateMutation.mutate(payload);
  };

  const handleSavePlan = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!generatedPlan) return;

    const savePayload = {
      destinationId: generatedPlan.destinationId || destinationId,
      tripTitle: generatedPlan.tripTitle,
      days: generatedPlan.days || days,
      budget: generatedPlan.budget || budget,
      estimatedBudgetPKR: generatedPlan.estimatedBudgetPKR || 0,
      travelersCount: generatedPlan.travelersCount || travelersCount,
      interests: generatedPlan.interests || selectedInterests,
      dailyPlan: generatedPlan.dailyPlan,
      travelTips: generatedPlan.travelTips || [],
    };

    saveMutation.mutate(savePayload);
  };

  const selectedDestinationDoc = destinations.find((d) => d._id === destinationId);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brand-emerald/10 via-brand-sand/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
            <span>AI-Powered Itinerary Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal tracking-tight">
            Plan Your Custom Pakistan Journey
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Design multi-day expeditions with realistic mountain transit times, altitude acclimatization
            checkpoints, cultural encounters, and regional cuisine recommendations.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Planner Builder Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10">
          <form onSubmit={handleGenerateSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-brand-charcoal flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-emerald" />
                <span>Trip Preferences</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tell our AI concierge about your destination, dates, and travel style.
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div
                className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Destination Selection */}
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-emerald" />
                  <span>Target Destination or Region <span className="text-red-500">*</span></span>
                </span>
              </label>

              <select
                id="destination"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                disabled={loadingDestinations}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-brand-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px] cursor-pointer"
              >
                <option value="">
                  {loadingDestinations ? 'Loading destinations...' : 'Choose a destination...'}
                </option>
                {destinations.map((dest) => (
                  <option key={dest._id} value={dest._id}>
                    {dest.name} ({dest.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration & Budget & Travelers Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Duration in Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="days" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-emerald" />
                      <span>Duration</span>
                    </span>
                  </label>
                  <span className="text-xs font-bold text-brand-emerald">{days} Days</span>
                </div>
                <input
                  id="days"
                  type="range"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-brand-emerald cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 Day</span>
                  <span>7 Days</span>
                  <span>14 Days</span>
                </div>
              </div>

              {/* Budget Tier */}
              <div className="space-y-2">
                <label htmlFor="budget" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-brand-emerald" />
                    <span>Budget Tier</span>
                  </span>
                </label>
                <select
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-brand-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px] cursor-pointer"
                >
                  <option value="budget">Budget / Backpacker</option>
                  <option value="moderate">Moderate Comfort</option>
                  <option value="luxury">Luxury & Premium Resorts</option>
                </select>
              </div>

              {/* Party Size */}
              <div className="space-y-2">
                <label htmlFor="travelers" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-emerald" />
                    <span>Travelers</span>
                  </span>
                </label>
                <input
                  id="travelers"
                  type="number"
                  min="1"
                  max="30"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                />
              </div>
            </div>

            {/* Travel Interests Multi-Select Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Travel Styles & Focus Areas
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all min-h-[38px] flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-emerald text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-mint" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full py-4 px-6 rounded-2xl bg-brand-emerald hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm sm:text-base transition shadow-md shadow-brand-emerald/20 flex items-center justify-center gap-2.5 min-h-[48px]"
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Pakistan Itinerary with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-brand-mint" />
                    <span>Generate Tailored Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* AI Thinking Animation Card */}
        {generateMutation.isPending && (
          <div className="mt-8 bg-white rounded-3xl p-8 border border-brand-mint/40 shadow-sm text-center space-y-4 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-brand-emerald animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-brand-charcoal">
              Crafting Your Custom Expedition...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Evaluating local mountain road transits, acclimatization checkpoints, regional heritage sites,
              and authentic food stops.
            </p>
          </div>
        )}

        {/* Generated Itinerary Section */}
        {generatedPlan && !generateMutation.isPending && (
          <section id="generated-plan-section" className="mt-12 space-y-8 animate-in fade-in duration-300">
            {/* Success Saved Notification Banner */}
            {savedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">
                    Itinerary successfully saved to your personal travel workspace!
                  </span>
                </div>
                <Link
                  to="/my-plans"
                  className="px-3.5 py-1.5 rounded-xl bg-brand-emerald text-white text-xs font-bold hover:bg-emerald-800 transition shrink-0 min-h-[36px] flex items-center"
                >
                  View in My Plans
                </Link>
              </div>
            )}

            {/* Itinerary Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {selectedDestinationDoc?.name && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-emerald text-white text-xs font-bold">
                        <MapPin className="w-3.5 h-3.5 text-brand-mint" />
                        <span>{selectedDestinationDoc.name}</span>
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-brand-sand text-brand-emerald text-xs font-bold uppercase tracking-wider capitalize">
                      {generatedPlan.budget || budget} Budget
                    </span>
                    <span className="text-xs text-slate-400">
                      {generatedPlan.days || days} Days • {generatedPlan.travelersCount || travelersCount} Travelers
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    {generatedPlan.tripTitle}
                  </h2>
                </div>

                {/* Save Itinerary Action Button */}
                <div className="shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSavePlan}
                    disabled={saveMutation.isPending || savedSuccess}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-emerald hover:bg-emerald-800 disabled:bg-emerald-700 text-white font-bold text-sm transition shadow-sm min-h-[44px]"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-brand-mint" />
                        <span>Saving...</span>
                      </>
                    ) : savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-brand-mint" />
                        <span>Saved to Workspace</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-brand-mint" />
                        <span>{isAuthenticated ? 'Save to My Plans' : 'Sign In to Save'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Duration</p>
                  <p className="font-bold text-brand-charcoal text-sm mt-0.5">
                    {generatedPlan.days || days} Days
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Estimated Budget</p>
                  <p className="font-bold text-brand-charcoal text-sm mt-0.5">
                    {generatedPlan.estimatedBudgetPKR
                      ? `PKR ${generatedPlan.estimatedBudgetPKR.toLocaleString()}`
                      : 'Flexible'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Travelers</p>
                  <p className="font-bold text-brand-charcoal text-sm mt-0.5">
                    {generatedPlan.travelersCount || travelersCount} Adults
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Daily Plans</p>
                  <p className="font-bold text-brand-charcoal text-sm mt-0.5">
                    {generatedPlan.dailyPlan?.length || 0} Scheduled
                  </p>
                </div>
              </div>

              {/* Travel Tips Callout */}
              {Array.isArray(generatedPlan.travelTips) && generatedPlan.travelTips.length > 0 && (
                <div className="mt-6 p-4 rounded-2xl bg-brand-sand/50 border border-brand-mint/30 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <p className="font-bold text-brand-charcoal uppercase text-[10px] tracking-wider mb-1">
                      Local Expedition Guidance:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {generatedPlan.travelTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Day-by-Day Itinerary Schedule Cards */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-brand-charcoal flex items-center gap-2">
                <span>Day-by-Day Expedition Schedule</span>
              </h3>

              {generatedPlan.dailyPlan?.map((item, idx) => (
                <article
                  key={item._id || idx}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-8 h-8 rounded-xl bg-brand-emerald text-white font-bold text-xs flex items-center justify-center shrink-0">
                      Day {item.day}
                    </span>
                    <h4 className="text-lg font-bold text-brand-charcoal">{item.title}</h4>
                  </div>

                  {/* Morning, Afternoon, Evening Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                    {item.morning && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>Morning</span>
                        </p>
                        <p className="leading-relaxed text-slate-600">{item.morning}</p>
                      </div>
                    )}

                    {item.afternoon && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Sunset className="w-4 h-4 text-orange-500" />
                          <span>Afternoon</span>
                        </p>
                        <p className="leading-relaxed text-slate-600">{item.afternoon}</p>
                      </div>
                    )}

                    {item.evening && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          <span>Evening</span>
                        </p>
                        <p className="leading-relaxed text-slate-600">{item.evening}</p>
                      </div>
                    )}
                  </div>

                  {/* Recommended Local Dishes */}
                  {Array.isArray(item.recommendedFood) && item.recommendedFood.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-brand-emerald" />
                        <span>Recommended Cuisine:</span>
                      </span>
                      {item.recommendedFood.map((food, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] font-semibold text-brand-emerald bg-brand-sand px-2.5 py-1 rounded-lg"
                        >
                          {food}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Want to fine-tune your dates, hotel bookings, or local activities?
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={saveMutation.isPending || savedSuccess}
                  className="px-5 py-2.5 bg-brand-emerald hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs min-h-[44px] flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-brand-mint" />
                  <span>{savedSuccess ? 'Saved' : 'Save Itinerary'}</span>
                </button>
                <Link
                  to="/hotels"
                  className="px-5 py-2.5 bg-brand-sand text-brand-emerald hover:bg-brand-emerald hover:text-white rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2"
                >
                  <span>Book Accommodations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
