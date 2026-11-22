import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bookmark,
  MapPin,
  Hotel,
  Compass,
  Trash2,
  ArrowRight,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function BookmarksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'hotels'
  const [actionError, setActionError] = useState('');

  // Fetch all bookmarks
  const {
    data: bookmarksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await api.get('/bookmarks');
      return response.data?.data || { destinations: [], hotels: [] };
    },
  });

  // Remove bookmark mutation
  const removeMutation = useMutation({
    mutationFn: async ({ itemId, itemType }) => {
      const response = await api.post('/bookmarks/toggle', { itemId, itemType });
      return response.data;
    },
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to remove bookmark.');
    },
  });

  const destinations = bookmarksData?.destinations || [];
  const hotels = bookmarksData?.hotels || [];

  const handleRemove = (itemId, itemType) => {
    removeMutation.mutate({ itemId, itemType });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brand-emerald/10 via-brand-sand/30 to-transparent border-b border-slate-200/60 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wide uppercase mb-3">
                <Bookmark className="w-3.5 h-3.5 text-brand-mint" />
                <span>Personal Vault</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight">
                Saved Bookmarks
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Quick access to destinations and hotels curated for{' '}
                <span className="font-bold text-brand-emerald">{user?.name || 'Explorer'}</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs min-h-[44px]"
              >
                <Compass className="w-4 h-4 text-brand-emerald" />
                <span>Explore Destinations</span>
              </Link>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs min-h-[44px]"
              >
                <Hotel className="w-4 h-4 text-brand-emerald" />
                <span>Browse Hotels</span>
              </Link>
            </div>
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

          {/* Accessible Tab Navigation */}
          <div className="mt-8 flex border-b border-slate-200" role="tablist" aria-label="Bookmark Categories">
            <button
              type="button"
              role="tab"
              id="tab-destinations"
              aria-controls="panel-destinations"
              aria-selected={activeTab === 'destinations'}
              onClick={() => setActiveTab('destinations')}
              className={`min-h-[44px] px-6 py-3 text-sm font-bold flex items-center gap-2.5 border-b-2 transition -mb-px ${
                activeTab === 'destinations'
                  ? 'border-brand-emerald text-brand-emerald bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-brand-charcoal hover:border-slate-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Destinations</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'destinations'
                    ? 'bg-brand-emerald text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {destinations.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-hotels"
              aria-controls="panel-hotels"
              aria-selected={activeTab === 'hotels'}
              onClick={() => setActiveTab('hotels')}
              className={`min-h-[44px] px-6 py-3 text-sm font-bold flex items-center gap-2.5 border-b-2 transition -mb-px ${
                activeTab === 'hotels'
                  ? 'border-brand-emerald text-brand-emerald bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-brand-charcoal hover:border-slate-300'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Saved Hotels</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'hotels'
                    ? 'bg-brand-emerald text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {hotels.length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-live="polite">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                  <div className="pt-3 flex justify-between">
                    <div className="h-8 bg-slate-200 rounded-lg w-24" />
                    <div className="h-8 bg-slate-200 rounded-lg w-20" />
                  </div>
                </div>
              </div>
            ))}
            <span className="sr-only">Loading your bookmarks...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800">Unable to load bookmarks</h3>
            <p className="text-xs text-red-600 mt-1 mb-5">
              {error?.response?.data?.message || 'A network error occurred while retrieving your saved vault.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition min-h-[44px]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* DESTINATIONS TAB PANEL */}
        {!isLoading && !isError && activeTab === 'destinations' && (
          <section
            id="panel-destinations"
            role="tabpanel"
            aria-labelledby="tab-destinations"
            tabIndex={0}
            className="focus:outline-none"
          >
            {destinations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-bold text-brand-charcoal">No Saved Destinations</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You haven't bookmarked any scenic valleys, historical fortresses, or mountain passes yet.
                </p>
                <div className="mt-6">
                  <Link
                    to="/destinations"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs min-h-[44px]"
                  >
                    <Compass className="w-4 h-4 text-brand-mint" />
                    <span>Explore Destinations</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <article
                    key={dest._id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={dest.coverImage || dest.bannerImage}
                        alt={dest.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      {dest.province && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-emerald/90 backdrop-blur-xs text-white text-[10px] font-bold">
                          {dest.province}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-brand-charcoal group-hover:text-brand-emerald transition line-clamp-1">
                          {dest.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                          <span>{dest.province || 'Pakistan'}</span>
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/destinations/${dest.slug || dest._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald hover:text-emerald-800 transition min-h-[44px] py-2 px-1 focus:outline-none focus:underline"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemove(dest._id, 'destination')}
                          disabled={removeMutation.isPending}
                          aria-label={`Remove ${dest.name} from bookmarks`}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* HOTELS TAB PANEL */}
        {!isLoading && !isError && activeTab === 'hotels' && (
          <section
            id="panel-hotels"
            role="tabpanel"
            aria-labelledby="tab-hotels"
            tabIndex={0}
            className="focus:outline-none"
          >
            {hotels.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto mb-4">
                  <Hotel className="w-8 h-8 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-bold text-brand-charcoal">No Saved Hotels</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You haven't saved any resorts, boutique lodges, or northern stays yet.
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <article
                    key={hotel._id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={hotel.coverImage}
                        alt={hotel.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      {hotel.province && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-emerald/90 backdrop-blur-xs text-white text-[10px] font-bold">
                          {hotel.province}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-brand-charcoal group-hover:text-brand-emerald transition line-clamp-1">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                          <span>{hotel.province || 'Pakistan'}</span>
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-brand-emerald font-bold text-sm">
                          <Coins className="w-4 h-4 text-brand-mint" />
                          <span>
                            {hotel.pricePerNightMin ? `PKR ${hotel.pricePerNightMin.toLocaleString()}` : 'Contact for Rates'}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">/ night</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/hotels/${hotel.slug || hotel._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald hover:text-emerald-800 transition min-h-[44px] py-2 px-1 focus:outline-none focus:underline"
                        >
                          <span>Reserve / Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemove(hotel._id, 'hotel')}
                          disabled={removeMutation.isPending}
                          aria-label={`Remove ${hotel.name} from bookmarks`}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
