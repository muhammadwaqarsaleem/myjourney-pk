import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Sparkles,
  Hotel,
  MapPin,
  Clock,
  Coins,
  Users,
  ChevronDown,
  ChevronUp,
  Trash2,
  Utensils,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function MyPlansPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('itineraries'); // 'itineraries' | 'bookings'
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  // Fetch user's saved itineraries
  const {
    data: itineraries = [],
    isLoading: loadingItineraries,
    isError: errorItineraries,
    refetch: refetchItineraries,
  } = useQuery({
    queryKey: ['my-itineraries'],
    queryFn: async () => {
      const response = await api.get('/itinerary/my-plans');
      return response.data?.data || [];
    },
  });

  // Fetch user's hotel bookings
  const {
    data: bookings = [],
    isLoading: loadingBookings,
    isError: errorBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my-bookings');
      return response.data?.data || [];
    },
  });

  // Delete Itinerary mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId) => {
      const response = await api.delete(`/itinerary/${planId}`);
      return response.data;
    },
    onSuccess: () => {
      setActionError('');
      setPlanToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['my-itineraries'] });
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete travel plan.');
      setPlanToDelete(null);
    },
  });

  const toggleExpandPlan = (planId) => {
    setExpandedPlanId((prev) => (prev === planId ? null : planId));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    } catch {
      return 1;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Completed</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brand-emerald/10 via-brand-sand/30 to-transparent border-b border-slate-200/60 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wide uppercase mb-3">
                <Calendar className="w-3.5 h-3.5 text-brand-mint" />
                <span>Travel Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight">
                My Travel Plans & Bookings
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Manage your personalized AI expeditions and hotel reservations for{' '}
                <span className="font-bold text-brand-emerald">{user?.name || 'Explorer'}</span>.
              </p>
            </div>

            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-emerald hover:bg-emerald-800 text-white text-sm font-bold transition shadow-sm min-h-[44px] shrink-0"
            >
              <Plus className="w-4 h-4 text-brand-mint" />
              <span>Generate AI Itinerary</span>
            </Link>
          </div>

          {/* Action Error Alert */}
          {actionError && (
            <div
              className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Accessible Tabs Bar */}
          <div className="mt-8 flex border-b border-slate-200" role="tablist" aria-label="Personal Travel Hub Tabs">
            <button
              type="button"
              role="tab"
              id="tab-itineraries"
              aria-controls="panel-itineraries"
              aria-selected={activeTab === 'itineraries'}
              onClick={() => setActiveTab('itineraries')}
              className={`min-h-[44px] px-6 py-3 text-sm font-bold flex items-center gap-2.5 border-b-2 transition -mb-px ${
                activeTab === 'itineraries'
                  ? 'border-brand-emerald text-brand-emerald bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-brand-charcoal hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-mint" />
              <span>Saved AI Itineraries</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'itineraries'
                    ? 'bg-brand-emerald text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {itineraries.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-bookings"
              aria-controls="panel-bookings"
              aria-selected={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              className={`min-h-[44px] px-6 py-3 text-sm font-bold flex items-center gap-2.5 border-b-2 transition -mb-px ${
                activeTab === 'bookings'
                  ? 'border-brand-emerald text-brand-emerald bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-brand-charcoal hover:border-slate-300'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Hotel Bookings</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'bookings'
                    ? 'bg-brand-emerald text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {bookings.length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-plan-title"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 id="delete-plan-title" className="text-xl font-bold text-brand-charcoal text-center mb-2">
              Remove Saved Itinerary?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-brand-charcoal">"{planToDelete.tripTitle}"</span>? This will permanently remove all day-by-day schedules.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                disabled={deletePlanMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deletePlanMutation.mutate(planToDelete._id)}
                disabled={deletePlanMutation.isPending}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition shadow-sm min-h-[44px]"
              >
                {deletePlanMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: AI ITINERARIES */}
        {activeTab === 'itineraries' && (
          <section
            id="panel-itineraries"
            role="tabpanel"
            aria-labelledby="tab-itineraries"
            tabIndex={0}
            className="focus:outline-none"
          >
            {/* Loading */}
            {loadingItineraries && (
              <div className="space-y-4" role="status" aria-live="polite">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded-md w-1/3" />
                    <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                    <div className="h-10 bg-slate-200 rounded-xl w-full" />
                  </div>
                ))}
                <span className="sr-only">Loading saved itineraries...</span>
              </div>
            )}

            {/* Error */}
            {errorItineraries && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-800">Failed to load itineraries</h3>
                <p className="text-xs text-red-600 mt-1 mb-5">
                  Could not retrieve your saved itineraries.
                </p>
                <button
                  type="button"
                  onClick={() => refetchItineraries()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition min-h-[44px]"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loadingItineraries && !errorItineraries && itineraries.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-bold text-brand-charcoal">No Saved Itineraries</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Design bespoke travel routes with realistic travel times, daily culinary stops, and lodging tiers.
                </p>
                <div className="mt-6">
                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-brand-mint" />
                    <span>Create Your First Itinerary</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Itineraries List */}
            {!loadingItineraries && !errorItineraries && itineraries.length > 0 && (
              <div className="space-y-6">
                {itineraries.map((plan) => {
                  const isExpanded = expandedPlanId === plan._id;
                  const destName = plan.destination?.name || 'Pakistan Expedition';
                  const destProvince = plan.destination?.province || '';

                  return (
                    <article
                      key={plan._id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition"
                    >
                      {/* Plan Summary Card Top */}
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{destName}</span>
                                {destProvince && <span>({destProvince})</span>}
                              </span>

                              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-sand text-brand-emerald capitalize">
                                {plan.budget} budget
                              </span>

                              <span className="text-xs text-slate-400">
                                Created {formatDate(plan.createdAt)}
                              </span>
                            </div>

                            <h2 className="text-2xl font-bold text-brand-charcoal tracking-tight">
                              {plan.tripTitle}
                            </h2>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Expand / Collapse Button */}
                            <button
                              type="button"
                              onClick={() => toggleExpandPlan(plan._id)}
                              aria-expanded={isExpanded}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition min-h-[44px]"
                            >
                              <span>{isExpanded ? 'Hide Schedule' : 'View Schedule'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete Plan Button */}
                            <button
                              type="button"
                              onClick={() => setPlanToDelete(plan)}
                              aria-label={`Delete itinerary ${plan.tripTitle}`}
                              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metrics Bar */}
                        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                              <Clock className="w-4 h-4 text-brand-emerald" />
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Duration</p>
                              <p className="text-sm font-bold text-brand-charcoal">{plan.days} Days</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                              <Coins className="w-4 h-4 text-brand-emerald" />
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Est. Budget</p>
                              <p className="text-sm font-bold text-brand-charcoal">
                                {plan.estimatedBudgetPKR ? `PKR ${plan.estimatedBudgetPKR.toLocaleString()}` : 'Flexible'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                              <Users className="w-4 h-4 text-brand-emerald" />
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Party Size</p>
                              <p className="text-sm font-bold text-brand-charcoal">
                                {plan.travelersCount || 1} Person{plan.travelersCount > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                              <Sparkles className="w-4 h-4 text-brand-emerald" />
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Activities</p>
                              <p className="text-sm font-bold text-brand-charcoal">
                                {plan.dailyPlan?.length || 0} Day Plans
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Day-by-Day Schedule */}
                      {isExpanded && (
                        <div className="bg-slate-50/70 p-6 sm:p-8 border-t border-slate-200 space-y-6 animate-in fade-in duration-200">
                          <h3 className="text-base font-bold text-brand-charcoal flex items-center gap-2">
                            <span>Detailed Day-by-Day Itinerary</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {plan.dailyPlan?.length} Days
                            </span>
                          </h3>

                          <div className="space-y-4">
                            {plan.dailyPlan?.map((item, idx) => (
                              <div
                                key={item._id || idx}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs"
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-brand-emerald text-white font-bold text-xs flex items-center justify-center">
                                      {item.day}
                                    </span>
                                    <h4 className="font-bold text-brand-charcoal text-sm sm:text-base">
                                      {item.title}
                                    </h4>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                                  {item.morning && (
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                      <p className="font-bold text-brand-charcoal flex items-center gap-1.5 mb-1 text-slate-700">
                                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Morning</span>
                                      </p>
                                      <p className="leading-relaxed">{item.morning}</p>
                                    </div>
                                  )}

                                  {item.afternoon && (
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                      <p className="font-bold text-brand-charcoal flex items-center gap-1.5 mb-1 text-slate-700">
                                        <Sunset className="w-3.5 h-3.5 text-orange-500" />
                                        <span>Afternoon</span>
                                      </p>
                                      <p className="leading-relaxed">{item.afternoon}</p>
                                    </div>
                                  )}

                                  {item.evening && (
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                      <p className="font-bold text-brand-charcoal flex items-center gap-1.5 mb-1 text-slate-700">
                                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Evening</span>
                                      </p>
                                      <p className="leading-relaxed">{item.evening}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Recommended Cuisine */}
                                {Array.isArray(item.recommendedFood) && item.recommendedFood.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                      <Utensils className="w-3 h-3 text-brand-emerald" />
                                      <span>Local Dishes:</span>
                                    </span>
                                    {item.recommendedFood.map((food, foodIdx) => (
                                      <span
                                        key={foodIdx}
                                        className="text-[11px] font-semibold text-brand-emerald bg-brand-sand px-2 py-0.5 rounded-md"
                                      >
                                        {food}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Travel Tips Pill List */}
                          {Array.isArray(plan.travelTips) && plan.travelTips.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Expedition Tips & Advice
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                                {plan.travelTips.map((tip, tipIdx) => (
                                  <li key={tipIdx} className="leading-relaxed">
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: HOTEL BOOKINGS */}
        {activeTab === 'bookings' && (
          <section
            id="panel-bookings"
            role="tabpanel"
            aria-labelledby="tab-bookings"
            tabIndex={0}
            className="focus:outline-none"
          >
            {/* Loading */}
            {loadingBookings && (
              <div className="space-y-4" role="status" aria-live="polite">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded-md w-1/3" />
                    <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                    <div className="h-10 bg-slate-200 rounded-xl w-full" />
                  </div>
                ))}
                <span className="sr-only">Loading your bookings...</span>
              </div>
            )}

            {/* Error */}
            {errorBookings && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-800">Failed to load reservations</h3>
                <p className="text-xs text-red-600 mt-1 mb-5">
                  Could not retrieve your lodging reservations.
                </p>
                <button
                  type="button"
                  onClick={() => refetchBookings()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition min-h-[44px]"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loadingBookings && !errorBookings && bookings.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto mb-4">
                  <Hotel className="w-8 h-8 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-bold text-brand-charcoal">No Lodging Reservations</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You haven't requested any hotel stays yet. Explore our verified hotels across Gilgit, Swat, Hunza, and Lahore.
                </p>
                <div className="mt-6">
                  <Link
                    to="/hotels"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs min-h-[44px]"
                  >
                    <Hotel className="w-4 h-4 text-brand-mint" />
                    <span>Browse Hotels</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Bookings List */}
            {!loadingBookings && !errorBookings && bookings.length > 0 && (
              <div className="space-y-6">
                {bookings.map((booking) => {
                  const hotelName = booking.hotel?.name || 'Hotel Stay';
                  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

                  return (
                    <article
                      key={booking._id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition p-6 sm:p-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* Hotel Cover & Meta */}
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                          <div className="w-full sm:w-36 h-28 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                            <img
                              src={booking.hotel?.coverImage}
                              alt={hotelName}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {getStatusBadge(booking.status)}
                              <span className="text-xs text-slate-400">
                                Booked on {formatDate(booking.createdAt)}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-brand-charcoal">{hotelName}</h3>

                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                              <span>{booking.hotel?.address || 'Pakistan'}</span>
                            </p>

                            <p className="text-xs font-semibold text-brand-emerald mt-2">
                              Room: <span className="text-slate-800">{booking.roomType}</span>
                            </p>
                          </div>
                        </div>

                        {/* Price & Link Action */}
                        <div className="text-left md:text-right shrink-0">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Estimated Total</p>
                          <p className="text-2xl font-black text-brand-charcoal mt-0.5">
                            PKR {booking.totalPrice?.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            for {nights} Night{nights > 1 ? 's' : ''}
                          </p>

                          <div className="mt-4">
                            <Link
                              to={`/hotels/${booking.hotel?.slug || booking.hotel?._id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-sand text-brand-emerald hover:bg-brand-emerald hover:text-white text-xs font-bold transition min-h-[44px]"
                            >
                              <span>View Hotel</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Booking Parameters Row */}
                      <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Check-in</p>
                          <p className="font-bold text-brand-charcoal mt-0.5">{formatDate(booking.checkInDate)}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Check-out</p>
                          <p className="font-bold text-brand-charcoal mt-0.5">{formatDate(booking.checkOutDate)}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                          <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Guests</p>
                          <p className="font-bold text-brand-charcoal mt-0.5">
                            {booking.guests?.adults || 1} Adult{booking.guests?.adults > 1 ? 's' : ''}
                            {booking.guests?.children ? `, ${booking.guests.children} Child` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Special Requests if provided */}
                      {booking.specialRequests && (
                        <div className="mt-4 p-3 rounded-xl bg-brand-sand/30 border border-brand-mint/30 text-xs text-slate-700">
                          <span className="font-bold text-brand-emerald">Special Requests: </span>
                          <span>{booking.specialRequests}</span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
