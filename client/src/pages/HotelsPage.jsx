/**
 * @fileoverview Accommodations and Hotels Directory Page for myjourney.pk.
 * Integrates faceted multi-select dropdown filters, budget filtering, dual
 * responsive pagination (top and bottom), and performant lazy image rendering.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Multi-Dimensional Filter Composition:
 *    - Combines text search keyword, max nightly rate, and multi-province faceted
 *      selections into a coherent URL query state and client-side filter pipeline.
 *    - Uses `MultiSelectDropdown` for provinces, replacing bulky pill lists with
 *      an accessible WAI-ARIA listbox and dynamic "Reset" button.
 * 
 * 2. Dual Responsive Pagination Strategy:
 *    - Renders `Pagination` both above the hotel cards and at the bottom of the grid,
 *      allowing travelers to jump between pages without repeated vertical scrolling.
 *    - Visibility criteria: Suppressed whenever filtered hotels fit within a single
 *      page (`totalItems <= PAGE_SIZE`).
 * 
 * 3. Browser Resource & Memory Conservation:
 *    - Implements `loading="lazy"` and `decoding="async"` across hotel thumbnails,
 *      lowering network contention and boosting Core Web Vitals (Largest Contentful Paint).
 * 
 * @module pages/HotelsPage
 */

import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Hotel,
  Search,
  MapPin,
  Star,
  ArrowRight,
  X,
  Coins,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../api/axios';
import MultiSelectDropdown from '../components/common/MultiSelectDropdown';
import Pagination from '../components/common/Pagination';

const PROVINCES = [
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

const PAGE_SIZE = 6;

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search, provinces, and maxPrice from URL
  const currentSearch = searchParams.get('search') || '';
  const provinceParam = searchParams.get('provinces') || searchParams.get('province') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Parse multi-select provinces (empty array represents "All Selected")
  const selectedProvinces = useMemo(() => {
    if (!provinceParam || provinceParam === 'All') return [];
    return provinceParam.split(',').filter(Boolean);
  }, [provinceParam]);

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);

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

  // Client-side multi-province filtering based on populated destination relation
  const filteredHotels = useMemo(() => {
    return rawHotels.filter((hotel) => {
      if (selectedProvinces.length > 0) {
        const prov = hotel.destination?.province || '';
        const matches = selectedProvinces.some(
          (p) => p.toLowerCase() === prov.toLowerCase()
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [rawHotels, selectedProvinces]);

  // Slice paginated items
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHotels.slice(start, start + PAGE_SIZE);
  }, [filteredHotels, currentPage]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleProvincesChange = (newSelected) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('province');
    if (newSelected.length === 0 || newSelected.length === PROVINCES.length) {
      newParams.delete('provinces');
    } else {
      newParams.set('provinces', newSelected.join(','));
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleMaxPriceSelect = (priceVal) => {
    const newParams = new URLSearchParams(searchParams);
    if (priceVal) {
      newParams.set('maxPrice', priceVal);
    } else {
      newParams.delete('maxPrice');
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    currentSearch || selectedProvinces.length > 0 || currentMaxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Hotel className="w-4 h-4 text-emerald-500" />
          <span>Accommodations &amp; Resorts Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hotels &amp; Stays in Pakistan
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
          Discover vetted mountain lodges, boutique heritage stays, and city luxury hotels.
          Reserve with transparent rates, verified amenities, and local host hospitality.
        </p>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={currentSearch}
              onChange={handleSearchChange}
              placeholder="Search by hotel name, address, or amenities (e.g. Serena, Wi-Fi, Pool)..."
              className="w-full pl-10 pr-10 min-h-[44px] rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              aria-label="Filter hotels by keyword"
            />
            {currentSearch && (
              <button
                type="button"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] p-1 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center cursor-pointer"
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
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Faceted Filter Row: MultiSelect Province + Price Tiers */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Multi-Select Province Dropdown */}
          <MultiSelectDropdown
            label="Province / Territory"
            placeholder="Provinces"
            options={PROVINCES}
            selectedValues={selectedProvinces}
            onChange={handleProvincesChange}
            onReset={() => handleProvincesChange([])}
            className="w-full sm:w-72"
          />

          {/* Max Price Nightly Filter */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
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
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs font-bold'
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
        </div>
      </div>

      {/* Results Count & Top Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 px-1">
        <div>
          {isLoading ? (
            'Searching hotels...'
          ) : (
            <>
              Found <strong className="text-slate-900">{filteredHotels.length}</strong>{' '}
              hotel{filteredHotels.length === 1 ? '' : 's'}
              {selectedProvinces.length > 0 && (
                <span> in <strong className="text-emerald-700">{selectedProvinces.join(', ')}</strong></span>
              )}
              {currentMaxPrice && (
                <span> up to <strong className="text-slate-900">PKR {Number(currentMaxPrice).toLocaleString()}</strong>/night</span>
              )}
              {currentSearch && (
                <span> matching &ldquo;<strong className="text-slate-900">{currentSearch}</strong>&rdquo;</span>
              )}
            </>
          )}
        </div>

        {/* Top Dual Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredHotels.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setCurrentPage(p)}
          className="py-0"
        />
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-live="polite">
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
          <span className="sr-only">Loading hotels catalog...</span>
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
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto">
            <Hotel className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Stays Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No hotel properties matched your active search and budget filters. Try expanding your price
            threshold or resetting the province filter to &ldquo;All Selected&rdquo;.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      {!isLoading && !isError && paginatedHotels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedHotels.map((hotel) => (
            <article
              key={hotel._id || hotel.slug}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/50 transition flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    hotel.coverImage ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={hotel.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-xs text-white">
                    {hotel.destination?.province || 'Pakistan'}
                  </span>
                  {hotel.isFeatured && (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-900">
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
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {hotel.name}
                  </h2>

                  {/* Amenity Pills */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {hotel.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
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
                    <span className="text-base font-extrabold text-emerald-700">
                      PKR {Number(hotel.pricePerNightMin || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400"> / night</span>
                  </div>

                  <Link
                    to={`/hotels/${hotel.slug}`}
                    className="min-h-[44px] inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white transition shadow-2xs"
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

      {/* Bottom Dual Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredHotels.length}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }}
        className="mt-6 border-t border-slate-200 pt-6"
      />

      {/* Safety & Booking Guarantee Note */}
      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <span>
          All hotels listed on <strong>myjourney.pk</strong> are subject to verified regional tourism
          safety guidelines and guest review authentication.
        </span>
      </div>
    </div>
  );
}
