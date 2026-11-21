import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Hotel,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Filter,
  X,
  Coins,
  ShieldCheck,
  Check,
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

const PRICE_TIERS = [
  { label: 'Any Price', value: '' },
  { label: 'Under PKR 15,000', value: '15000' },
  { label: 'Under PKR 30,000', value: '30000' },
  { label: 'Under PKR 50,000', value: '50000' },
  { label: 'Under PKR 80,000', value: '80000' },
];

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search, province, and maxPrice from URL
  const currentSearch = searchParams.get('search') || '';
  const currentProvince = searchParams.get('province') || 'All';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Query hotels from API
  const {
    data: rawHotels = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['hotels', currentSearch, currentMaxPrice],
    queryFn: async () => {
      const params = {};
      if (currentSearch.trim()) {
        params.search = currentSearch.trim();
      }
      if (currentMaxPrice && !isNaN(Number(currentMaxPrice))) {
        params.maxPrice = Number(currentMaxPrice);
      }
      const response = await api.get('/hotels', { params });
      return response.data?.data || [];
    },
  });

  // Client-side province filtering based on populated destination
  const filteredHotels = rawHotels.filter((hotel) => {
    if (currentProvince && currentProvince !== 'All') {
      const prov = hotel.destination?.province || '';
      if (prov.toLowerCase() !== currentProvince.toLowerCase()) {
        return false;
      }
    }
    return true;
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

  const handleMaxPriceSelect = (priceVal) => {
    const newParams = new URLSearchParams(searchParams);
    if (priceVal) {
      newParams.set('maxPrice', priceVal);
    } else {
      newParams.delete('maxPrice');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    currentSearch || (currentProvince && currentProvince !== 'All') || currentMaxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-brand-emerald text-xs font-bold uppercase tracking-wider mb-2">
          <Hotel className="w-4 h-4 text-brand-mint" />
          <span>Accommodations &amp; Resorts Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal">
          Hotels &amp; Stays in Pakistan
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl">
          Discover vetted mountain lodges, boutique heritage stays, and city luxury hotels.
          Reserve with transparent rates and verified amenities.
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
              placeholder="Search by hotel name, address, or amenities (e.g. Serena, Wi-Fi, Pool)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald transition"
              aria-label="Filter hotels by keyword"
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

        {/* Max Price Nightly Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Coins className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Nightly Rate (Max PKR):</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRICE_TIERS.map((tier) => {
              const isSelected = currentMaxPrice === tier.value;
              return (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => handleMaxPriceSelect(tier.value)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-emerald text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-pressed={isSelected}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Province Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Province / Territory:</span>
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
            'Searching hotels...'
          ) : (
            <>
              Found <strong className="text-brand-charcoal">{filteredHotels.length}</strong>{' '}
              hotel{filteredHotels.length === 1 ? '' : 's'}
              {currentProvince !== 'All' && (
                <span> in <strong className="text-brand-emerald">{currentProvince}</strong></span>
              )}
              {currentMaxPrice && (
                <span> up to <strong className="text-brand-charcoal">PKR {Number(currentMaxPrice).toLocaleString()}</strong>/night</span>
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
                <div className="h-4 bg-slate-200 rounded-sm w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-700 text-sm">
          {error?.message || 'Failed to fetch hotels directory. Please try again.'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredHotels.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-brand-sand rounded-2xl flex items-center justify-center text-brand-emerald mx-auto">
            <Hotel className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-brand-charcoal">No Stays Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No hotel properties matched your active search and budget filters. Try expanding your price
            threshold or switching the province filter to &ldquo;All&rdquo;.
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

      {/* Hotels Grid */}
      {!isLoading && !isError && filteredHotels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <article
              key={hotel._id || hotel.slug}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-brand-mint/50 transition flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    hotel.coverImage ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={hotel.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-charcoal/80 backdrop-blur-xs text-white">
                    {hotel.destination?.province || 'Pakistan'}
                  </span>
                  {hotel.isFeatured && (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-brand-mint text-brand-charcoal">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{Number(hotel.rating || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({hotel.reviewCount || 0})
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-mint shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </div>

                  <h2 className="text-xl font-bold text-brand-charcoal group-hover:text-brand-emerald transition">
                    {hotel.name}
                  </h2>

                  {/* Amenity Pills */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {hotel.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-sand/80 text-brand-charcoal flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5 text-brand-emerald" />
                          <span>{amenity}</span>
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-400">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Starting from
                    </span>
                    <span className="text-base font-extrabold text-brand-emerald">
                      PKR {Number(hotel.pricePerNightMin || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400"> / night</span>
                  </div>

                  <Link
                    to={`/hotels/${hotel.slug}`}
                    className="min-h-[44px] inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-sand text-brand-emerald hover:bg-brand-emerald hover:text-white transition shadow-2xs"
                    aria-label={`View rooms and book stay at ${hotel.name}`}
                  >
                    <span>View Rooms</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Safety & Booking Guarantee Note */}
      <div className="p-4 bg-brand-sand/50 rounded-2xl border border-brand-sand flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-brand-emerald shrink-0" />
        <span>
          All hotels listed on <strong>myjourney.pk</strong> are subject to verified regional tourism
          safety guidelines and guest review authentication.
        </span>
      </div>
    </div>
  );
}
