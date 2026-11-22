/**
 * @fileoverview Regional Destinations & Tourism Directory Page for myjourney.pk.
 * Incorporates accessible multi-select faceted dropdown filters, dual responsive
 * pagination (top & bottom), and lazy-loaded image resilience.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Faceted Multi-Select Architecture:
 *    - Replaces unwieldy pill buttons with `MultiSelectDropdown`, allowing travelers
 *      to cross-filter destinations across multiple provinces simultaneously.
 *    - State invariants: Defaults to "All Selected". Unchecking individual provinces
 *      narrows the collection while dynamically surfacing an external "Clear Filters"
 *      button adhering to Nielsen's Heuristic #3 (User Control & Freedom).
 * 
 * 2. Dual Responsive Pagination & HCI Progressive Disclosure:
 *    - Mounts `Pagination` BOTH above and below the destination grid to prevent
 *      scroll fatigue during exploratory browsing.
 *    - Visibility Rule: Suppresses pagination DOM nodes entirely when `totalFiltered <= pageSize`.
 *    - Desktop provides full range statistics ("Showing 1–6 of 12 results"), while
 *      mobile devices offer compact jump controls with an interactive micro-popover.
 * 
 * 3. Core Web Vitals & Image Optimization:
 *    - Destination cards enforce `loading="lazy"` and `decoding="async"`, deferring
 *      off-screen image rendering to prevent Cumulative Layout Shift (CLS) and save bandwidth.
 *    - Fallback placeholder onerror handlers prevent broken image UI glitches.
 * 
 * @module pages/DestinationsPage
 */

import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Search,
  MapPin,
  Star,
  ArrowRight,
  X,
  Utensils,
  Sparkles,
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

const PAGE_SIZE = 6;

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Synchronize state with URL parameters
  const currentSearch = searchParams.get('search') || '';
  const provinceParam = searchParams.get('provinces') || searchParams.get('province') || '';
  
  // Selected provinces: empty array represents default "All Selected"
  const selectedProvinces = useMemo(() => {
    if (!provinceParam || provinceParam === 'All') return [];
    return provinceParam.split(',').filter(Boolean);
  }, [provinceParam]);

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all destinations from API
  const {
    data: rawDestinations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['destinations', currentSearch],
    queryFn: async () => {
      const params = { limit: 50 };
      if (currentSearch.trim()) {
        params.search = currentSearch.trim();
      }
      const response = await api.get('/destinations', { params });
      return response.data?.data || [];
    },
  });

  // Client-side multi-province filtering
  const filteredDestinations = useMemo(() => {
    return rawDestinations.filter((dest) => {
      // 1. Province match: if none selected or all selected, match all
      if (selectedProvinces.length > 0) {
        const matchesProvince = selectedProvinces.some(
          (prov) => prov.toLowerCase() === (dest.province || '').toLowerCase()
        );
        if (!matchesProvince) return false;
      }
      return true;
    });
  }, [rawDestinations, selectedProvinces]);

  // Slice active page records
  const paginatedDestinations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDestinations.slice(start, start + PAGE_SIZE);
  }, [filteredDestinations, currentPage]);

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
    newParams.delete('province'); // Clean legacy singular param
    if (newSelected.length === 0 || newSelected.length === PROVINCES.length) {
      newParams.delete('provinces');
    } else {
      newParams.set('provinces', newSelected.join(','));
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(currentSearch || selectedProvinces.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4 text-emerald-500" />
          <span>Regional Guide &amp; Tourism Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Destinations in Pakistan
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
          Browse verified tourism hubs across Pakistan. Explore snow-capped mountain valleys, ancient
          civilization sites, Mughal architecture, and regional cuisines.
        </p>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={currentSearch}
              onChange={handleSearchChange}
              placeholder="Search by destination name, historical site, or region..."
              className="w-full pl-10 pr-10 min-h-[44px] rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              aria-label="Filter destinations by keyword"
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

          {/* Reset All Filters Button */}
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

        {/* Multi-Select Faceted Dropdown */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <MultiSelectDropdown
            label="Province / Territory"
            placeholder="Provinces"
            options={PROVINCES}
            selectedValues={selectedProvinces}
            onChange={handleProvincesChange}
            onReset={() => handleProvincesChange([])}
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* Results Count & Top Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 px-1">
        <div>
          {isLoading ? (
            'Searching destinations...'
          ) : (
            <>
              Found <strong className="text-slate-900">{filteredDestinations.length}</strong>{' '}
              destination{filteredDestinations.length === 1 ? '' : 's'}
              {selectedProvinces.length > 0 && (
                <span> in <strong className="text-emerald-700">{selectedProvinces.join(', ')}</strong></span>
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
          totalItems={filteredDestinations.length}
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
                <div className="h-3 bg-slate-200 rounded-sm w-full" />
                <div className="h-3 bg-slate-200 rounded-sm w-4/5" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading destinations directory...</span>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center text-red-700 text-sm">
          {error?.message || 'Failed to fetch destinations. Please try again.'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredDestinations.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Destinations Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No locations matched your current filter criteria. Try adjusting your keyword search or
            resetting the province filter to &ldquo;All Selected&rdquo;.
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

      {/* Destination Cards Grid */}
      {!isLoading && !isError && paginatedDestinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDestinations.map((dest) => (
            <article
              key={dest._id || dest.slug}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/50 transition flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    dest.bannerImage ||
                    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80'
                  }
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
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-xs text-white">
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
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {dest.name}
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{dest.sitesToVisit?.length || 0} Attractions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{dest.famousFoods?.length || 0} Dishes</span>
                    </div>
                  </div>

                  <Link
                    to={`/destinations/${dest.slug}`}
                    className="min-h-[44px] w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white transition shadow-2xs"
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

      {/* Bottom Dual Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredDestinations.length}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }}
        className="mt-6 border-t border-slate-200 pt-6"
      />
    </div>
  );
}
