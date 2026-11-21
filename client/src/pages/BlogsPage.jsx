import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Search,
  PenTool,
  Clock,
  Heart,
  Eye,
  MapPin,
  Calendar,
  X,
  Compass,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const POPULAR_TAGS = [
  'All',
  'NorthernPakistan',
  'Hunza',
  'Skardu',
  'Trekking',
  'RoadTrip',
  'Culture',
  'Heritage',
  'Food',
  'Camping',
  'BudgetTravel',
];

export default function BlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const currentSearch = searchParams.get('search') || '';
  const currentTag = searchParams.get('tag') || 'All';
  const currentDestination = searchParams.get('destination') || 'All';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch published blogs
  const {
    data: blogs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['blogs', currentSearch, currentTag, currentDestination],
    queryFn: async () => {
      const params = {};
      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentTag && currentTag !== 'All') params.tag = currentTag.trim();
      if (currentDestination && currentDestination !== 'All') {
        params.destination = currentDestination.trim();
      }

      const response = await api.get('/blogs', { params });
      return response.data?.data || [];
    },
  });

  // Fetch destinations for filter dropdown
  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations-filter-list'],
    queryFn: async () => {
      const response = await api.get('/destinations');
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      nextParams.set('search', searchInput.trim());
    } else {
      nextParams.delete('search');
    }
    setSearchParams(nextParams);
  };

  const handleTagClick = (tag) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tag === 'All') {
      nextParams.delete('tag');
    } else {
      nextParams.set('tag', tag);
    }
    setSearchParams(nextParams);
  };

  const handleDestinationChange = (e) => {
    const nextParams = new URLSearchParams(searchParams);
    const val = e.target.value;
    if (val === 'All') {
      nextParams.delete('destination');
    } else {
      nextParams.set('destination', val);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const canWrite = user?.role === 'creator' || user?.role === 'admin';
  const hasActiveFilters = Boolean(currentSearch || (currentTag && currentTag !== 'All') || (currentDestination && currentDestination !== 'All'));

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brand-emerald/10 via-brand-sand/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wide uppercase mb-3">
                <BookOpen className="w-3.5 h-3.5 text-brand-mint" />
                <span>Traveler Chronicles & Stories</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal tracking-tight">
                Community <span className="text-brand-emerald">Travelogues</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                Discover genuine narratives, off-the-beaten-path expeditions, and practical survival tips
                penned by passionate travelers across the valleys and cities of Pakistan.
              </p>
            </div>

            {/* Call to action for creators/admins */}
            {canWrite && (
              <div className="shrink-0">
                <Link
                  to="/blogs/create"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-emerald/20 transition-all hover:scale-102 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald min-h-[44px]"
                >
                  <PenTool className="w-4 h-4 text-brand-mint" />
                  <span>Write a Travelogue</span>
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar & Destination Filter */}
          <div className="mt-8 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs max-w-4xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search stories by title, keyword, or terrain..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal placeholder:text-slate-400 bg-slate-50/50"
                  aria-label="Search travel stories"
                />
              </div>

              {/* Destination Filter Dropdown */}
              <div className="relative sm:w-64">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={currentDestination}
                  onChange={handleDestinationChange}
                  aria-label="Filter by destination"
                  className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm text-brand-charcoal bg-slate-50/50 appearance-none cursor-pointer"
                >
                  <option value="All">All Destinations</option>
                  {destinations.map((dest) => (
                    <option key={dest._id || dest.slug} value={dest.slug || dest._id}>
                      {dest.name} ({dest.province})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-brand-emerald hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald min-h-[44px]"
              >
                Search
              </button>
            </form>

            {/* Popular Topic Tags Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
                Topics:
              </span>
              {POPULAR_TAGS.map((tag) => {
                const isActive = (tag === 'All' && currentTag === 'All') || currentTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all shrink-0 min-h-[36px] flex items-center ${
                      isActive
                        ? 'bg-brand-emerald text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-brand-charcoal'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Results Counter & Active Filters Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-brand-charcoal flex items-center gap-2">
              <span>Published Stories</span>
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-brand-sand text-brand-emerald">
                {blogs.length}
              </span>
            </h2>
            {hasActiveFilters && (
              <p className="text-xs text-slate-500 mt-1">
                Showing filtered travelogues.
              </p>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition min-h-[36px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-live="polite">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
              >
                <div className="h-52 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-md w-full" />
                  <div className="h-4 bg-slate-200 rounded-md w-2/3" />
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="h-4 bg-slate-200 rounded-md w-24" />
                  </div>
                </div>
              </div>
            ))}
            <span className="sr-only">Loading travelogues...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800">Failed to load travelogues</h3>
            <p className="text-sm text-red-600 mt-1 mb-6">
              {error?.response?.data?.message || error?.message || 'A network error occurred while fetching blogs.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && blogs.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-brand-emerald" />
            </div>
            <h3 className="text-xl font-bold text-brand-charcoal">No Travel Stories Found</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              We couldn't find any travelogues matching your current search criteria. Try removing filters or
              searching for a different term.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition min-h-[44px]"
                >
                  Clear Filters
                </button>
              )}
              {canWrite && (
                <Link
                  to="/blogs/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-emerald text-white hover:bg-emerald-800 text-sm font-semibold transition min-h-[44px]"
                >
                  <PenTool className="w-4 h-4 text-brand-mint" />
                  <span>Be the First to Post</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Blogs Grid */}
        {!isLoading && !isError && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              const authorName = blog.author?.name || 'Explorer';
              const authorInitial = authorName.charAt(0).toUpperCase();
              const likesCount = Array.isArray(blog.likes) ? blog.likes.length : 0;
              const viewsCount = blog.views || 0;
              const readTimeMins = blog.readTime || 3;

              return (
                <article
                  key={blog._id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col group"
                >
                  {/* Cover Image Container */}
                  <Link
                    to={`/blogs/${blog.slug || blog._id}`}
                    className="relative block h-52 overflow-hidden bg-slate-100"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Destination Pill if available */}
                    {blog.destination?.name && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-emerald/90 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
                        <MapPin className="w-3 h-3 text-brand-mint" />
                        <span>{blog.destination.name}</span>
                      </span>
                    )}

                    {/* Read Time badge */}
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium">
                      <Clock className="w-3 h-3 text-brand-mint" />
                      <span>{readTimeMins} min read</span>
                    </span>
                  </Link>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Tags */}
                      {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {blog.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold text-brand-emerald bg-brand-sand/70 px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold text-brand-charcoal leading-snug group-hover:text-brand-emerald transition-colors line-clamp-2">
                        <Link to={`/blogs/${blog.slug || blog._id}`} className="focus:outline-none focus:underline">
                          {blog.title}
                        </Link>
                      </h3>

                      {/* Safe Excerpt Text Rendering */}
                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {/* Author Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {blog.author?.avatar ? (
                          <img
                            src={blog.author.avatar}
                            alt={authorName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {authorInitial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-brand-charcoal truncate">{authorName}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats: Views & Likes */}
                      <div className="flex items-center gap-3 text-slate-400 text-xs shrink-0 pl-2">
                        <span className="flex items-center gap-1" title={`${viewsCount} views`}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>{viewsCount}</span>
                        </span>
                        <span className="flex items-center gap-1 text-rose-500" title={`${likesCount} likes`}>
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          <span className="font-semibold text-slate-600">{likesCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Creator Banner invitation */}
        {!canWrite && (
          <section className="mt-16 bg-gradient-to-r from-brand-emerald to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-mint text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Our Travel Storytellers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Have an epic trek or untold journey to share?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed">
                Registered creators on myjourney.pk share their high-altitude journals, cultural deep-dives,
                and road-trip logistics with thousands of travelers across Pakistan.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-brand-mint text-brand-charcoal font-bold text-sm rounded-xl hover:bg-emerald-400 transition shadow-sm min-h-[44px] flex items-center"
                >
                  Create Creator Account
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition min-h-[44px] flex items-center"
                >
                  Contact Editorial Team
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
