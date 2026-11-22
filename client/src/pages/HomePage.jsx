import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  Hotel,
  Utensils,
  Compass,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/axios';

const POPULAR_SEARCH_CHIPS = ['Hunza', 'Skardu', 'Lahore', 'Swat', 'Gwadar', 'Deosai'];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch featured destinations sorted by highest ratings
  const {
    data: featuredData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['destinations', 'featured'],
    queryFn: async () => {
      const response = await api.get('/destinations', {
        params: { limit: 6, sort: '-averageRating' },
      });
      return response.data?.data || [];
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/destinations?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/destinations');
    }
  };

  const handleChipClick = (term) => {
    navigate(`/destinations?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Quick Search & Northern Landscape Background */}
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-28 md:py-32 border-b border-slate-200/40">
        {/* Northern Pakistan Landscape Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2070&q=85"
            alt="Majestic Passu Cones and Karakoram Mountain Range, Northern Pakistan"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.onerror = null;
              // Fallback to iconic Hunza Valley vista
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=2070&q=85';
            }}
          />
          {/* Multi-layered gradient overlay to ensure contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/60 to-slate-950/85" />
          <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-mint" />
            <span>Discover Pakistan&apos;s Rich Heritage &amp; Landscapes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight drop-shadow-md">
            Explore the Soul &amp; Splendor of{' '}
            <span className="text-brand-mint underline decoration-brand-mint/60 decoration-4 underline-offset-6">
              Pakistan
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-xs">
            From the sky-touching peaks of the Karakoram to the historic alleys of Lahore and the
            pristine shores of Makran, plan authentic journeys with verified guides and AI assistance.
          </p>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/30 flex flex-col sm:flex-row items-stretch gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations (e.g., Hunza, Lahore, Skardu)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-brand-charcoal placeholder-slate-400 focus:outline-none bg-transparent"
                  aria-label="Search destinations"
                />
              </div>

              <button
                type="submit"
                className="min-h-[44px] min-w-[44px] px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Find Places</span>
                <ArrowRight className="w-4 h-4 text-brand-mint" />
              </button>
            </form>

            {/* Popular Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-200">
              <span className="font-semibold text-white/90">Popular:</span>
              {POPULAR_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 hover:border-brand-mint hover:bg-white/25 text-white transition cursor-pointer shadow-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md text-slate-300 text-xs border border-white/10 shadow-lg pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-brand-mint shrink-0" />
          <span>Passu Cones, Karakoram Range • Gilgit-Baltistan</span>
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-brand-mint" />
              <span>Handpicked Destinations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              Top Rated Places in Pakistan
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Verified spots, notable local attractions, and celebrated culinary staples.
            </p>
          </div>

          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:text-emerald-800 transition"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
              >
                <div className="h-52 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
                  <div className="h-6 bg-slate-200 rounded-sm w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-sm w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 text-sm">
            Unable to load featured destinations. Please refresh or try again later.
          </div>
        )}

        {/* Destinations Grid */}
        {!isLoading && !isError && featuredData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.map((dest) => (
              <article
                key={dest._id || dest.slug}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-brand-mint/50 transition flex flex-col group"
              >
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={dest.bannerImage || 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80'}
                    alt={dest.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-charcoal/80 backdrop-blur-xs text-white">
                      {dest.province}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{Number(dest.averageRating || 0).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({dest.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-charcoal group-hover:text-brand-emerald transition">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-brand-mint" />
                      <span>{dest.sitesToVisit?.length || 0} Key Attractions</span>
                    </div>

                    <Link
                      to={`/destinations/${dest.slug}`}
                      className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-emerald hover:text-emerald-800 transition px-2"
                      aria-label={`Explore details for ${dest.name}`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-sand/50 rounded-3xl border border-brand-sand p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              Why Plan Your Journey With Us?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              A comprehensive platform celebrating Pakistan&apos;s tourism with verified community insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-4">
                <Hotel className="w-6 h-6 text-brand-mint" />
              </div>
              <h3 className="text-base font-bold text-brand-charcoal mb-2">Verified Stays &amp; Lodging</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Browse mountain resorts, heritage guest houses, and boutique hotels verified for safety and quality across all regions.
              </p>
              <Link
                to="/hotels"
                className="min-h-[44px] inline-flex items-center text-xs font-bold text-brand-emerald hover:text-brand-mint transition"
              >
                <span>Find Stays &rarr;</span>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-4">
                <Utensils className="w-6 h-6 text-brand-mint" />
              </div>
              <h3 className="text-base font-bold text-brand-charcoal mb-2">Regional Food Guides</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Discover indigenous culinary specialties with must-try food spots co-located alongside notable tourist sites.
              </p>
              <Link
                to="/destinations"
                className="min-h-[44px] inline-flex items-center text-xs font-bold text-brand-emerald hover:text-brand-mint transition"
              >
                <span>Explore Culinary Trails &rarr;</span>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-4">
                <Sparkles className="w-6 h-6 text-brand-mint" />
              </div>
              <h3 className="text-base font-bold text-brand-charcoal mb-2">AI Travel Planner</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Generate tailored multi-day itineraries considering road conditions, altitude, and budget in seconds.
              </p>
              <Link
                to="/planner"
                className="min-h-[44px] inline-flex items-center text-xs font-bold text-brand-emerald hover:text-brand-mint transition"
              >
                <span>Launch Planner &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              <span>Authentic Community Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-emerald" />
              <span>Traveler-Submitted Narratives</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-emerald" />
              <span>All 7 Provinces &amp; Territories</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
