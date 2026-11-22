import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Filter,
  X,
  Utensils,
} from 'lucide-react';
import { api } from '../api/axios';

const PROVINCES = [
  'All',
  'Gilgit-Baltistan',
  'Khyber Pakhtunkhwa',
  'Punjab',
  'Sindh',
  'Balochistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
];

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Synchronize state with URL parameters
  const currentSearch = searchParams.get('search') || '';
  const currentProvince = searchParams.get('province') || 'All';

  // Fetch destinations matching filters
  const {
    data: destinationsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['destinations', currentProvince, currentSearch],
    queryFn: async () => {
      const params = {};
      if (currentProvince && currentProvince !== 'All') {
        params.province = currentProvince;
      }
      if (currentSearch.trim()) {
        params.search = currentSearch.trim();
      }
      const response = await api.get('/destinations', { params });
      return response.data?.data || [];
    },
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleProvinceSelect = (province) => {
    const newParams = new URLSearchParams(searchParams);
    if (province === 'All') {
      newParams.delete('province');
    } else {
      newParams.set('province', province);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(currentSearch || (currentProvince && currentProvince !== 'All'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4 text-brand-mint" />
          <span>Regional Guide &amp; Tourism Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal">
          Destinations in Pakistan
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl">
          Browse verified tourism hubs across Pakistan. Explore mountain valleys, ancient cities,
          heritage architecture, and indigenous cuisines.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={currentSearch}
              onChange={handleSearchChange}
              placeholder="Search by destination name, historical site, or region..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
              aria-label="Filter destinations by keyword"
            />
            {currentSearch && (
              <button
                type="button"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Province Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Filter by Territory / Province:</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {PROVINCES.map((prov) => {
              const isSelected =
                prov === 'All'
                  ? !currentProvince || currentProvince === 'All'
                  : currentProvince.toLowerCase() === prov.toLowerCase();

              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => handleProvinceSelect(prov)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-emerald text-white shadow-xs font-bold'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80'
                  }`}
                  aria-pressed={isSelected}
                >
                  {prov}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          {isLoading ? (
            'Searching destinations...'
          ) : (
            <>
              Found <strong className="text-brand-charcoal">{destinationsData?.length || 0}</strong>{' '}
              destination{destinationsData?.length === 1 ? '' : 's'}
              {currentProvince !== 'All' && (
                <span> in <strong className="text-brand-emerald">{currentProvince}</strong></span>
              )}
              {currentSearch && (
                <span> matching &ldquo;<strong className="text-brand-charcoal">{currentSearch}</strong>&rdquo;</span>
              )}
            </>
          )}
        </span>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
            >
              <div className="h-48 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded-sm w-1/4" />
                <div className="h-6 bg-slate-200 rounded-sm w-2/3" />
                <div className="h-3 bg-slate-200 rounded-sm w-full" />
                <div className="h-3 bg-slate-200 rounded-sm w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-700 text-sm">
          {error?.message || 'Failed to fetch destinations. Please try again.'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && destinationsData?.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-brand-sand rounded-2xl flex items-center justify-center text-brand-emerald mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-brand-charcoal">No Destinations Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No locations matched your current filter criteria. Try adjusting your search term or
            switching the province selector to &ldquo;All&rdquo;.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Destination Cards Grid */}
      {!isLoading && !isError && destinationsData && destinationsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinationsData.map((dest) => (
            <article
              key={dest._id || dest.slug}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-brand-mint/50 transition flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    dest.bannerImage ||
                    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-charcoal/80 backdrop-blur-xs text-white">
                    {dest.province}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{Number(dest.averageRating || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({dest.reviewCount || 0})
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-charcoal group-hover:text-brand-emerald transition">
                    {dest.name}
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-mint" />
                      <span>{dest.sitesToVisit?.length || 0} Attractions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-brand-mint" />
                      <span>{dest.famousFoods?.length || 0} Regional Dishes</span>
                    </div>
                  </div>

                  <Link
                    to={`/destinations/${dest.slug}`}
                    className="min-h-[44px] w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-sand text-brand-emerald hover:bg-brand-emerald hover:text-white transition shadow-2xs"
                    aria-label={`View full travel guide for ${dest.name}`}
                  >
                    <span>View Destination Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
