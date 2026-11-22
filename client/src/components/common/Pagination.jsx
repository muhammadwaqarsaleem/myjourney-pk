/**
 * @fileoverview Dual Responsive Pagination Component with HCI progressive disclosure.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Dual Placement & Scroll Fatigue Reduction:
 *    - In large resource grids (destinations, hotels, blogs), users exploring content
 *      experience scroll fatigue if pagination exists solely at the bottom.
 *    - Rendering dual pagination (both above and below item grids) allows users to
 *      orient and navigate immediately without scrolling back and forth.
 * 
 * 2. HCI "Show, Don't Tell" & Micro-Popover Progressive Disclosure:
 *    - Desktop Viewports: Displays full context with "Showing X–Y of Z results",
 *      previous/next arrows, and direct page jump buttons.
 *    - Mobile Viewports (Sub-640px): Screen real estate is conserved by rendering
 *      ultra-compact navigation (`< Page X of Y >`). An interactive Lucide `Info` (`i`)
 *      micro-popover reveals the full cardinality metric ("Showing X–Y of Z total filtered results")
 *      on demand, adhering to progressive disclosure guidelines.
 * 
 * 3. Conditional DOM Emission:
 *    - If `totalItems <= pageSize`, the component returns `null`, preventing visual
 *      noise and redundant layout calculations when content fits on a single viewport page.
 * 
 * @module components/common/Pagination
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react';

/**
 * @param {Object} props
 * @param {number} props.currentPage - Active 1-indexed page number
 * @param {number} props.totalItems - Total count of matching items in the filtered dataset
 * @param {number} [props.pageSize=9] - Number of items displayed per page
 * @param {(page: number) => void} props.onPageChange - Callback invoked on page change
 * @param {string} [props.className] - Additional wrapper styling classes
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 9,
  onPageChange,
  className = '',
}) {
  const [mobilePopoverOpen, setMobilePopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  // Calculate pagination boundaries
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Close mobile popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setMobilePopoverOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobilePopoverOpen) {
        setMobilePopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobilePopoverOpen]);

  // Mandatory Visibility Condition: Only render when total items exceed page size
  if (totalItems <= pageSize || totalPages <= 1) {
    return null;
  }

  /**
   * Generates a truncated list of page numbers with ellipsis gaps (e.g., [1, 2, '...', 7, 8]).
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push('ellipsis-start');

      for (let i = start; i <= end; i += 1) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push('ellipsis-end');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-between py-3 px-2 ${className}`}
    >
      {/* ============================================================== */}
      {/* DESKTOP VIEWPORT LAYOUT (sm:flex hidden) */}
      {/* ============================================================== */}
      <div className="hidden sm:flex items-center justify-between w-full">
        {/* Results Counter String */}
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{startIndex}</span>–
          <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
          <span className="font-bold text-slate-900">{totalItems}</span> results
        </div>

        {/* Page Control Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Navigate to previous page"
            className="min-h-[40px] min-w-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Prev</span>
          </button>

          {/* Page Number Sequence */}
          {getPageNumbers().map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs text-slate-400 select-none"
                  aria-hidden="true"
                >
                  •••
                </span>
              );
            }

            const isCurrent = item === currentPage;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Go to page ${item}`}
                className={`min-h-[40px] min-w-[40px] rounded-xl text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                } focus:outline-none focus:ring-2 focus:ring-emerald-600`}
              >
                {item}
              </button>
            );
          })}

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Navigate to next page"
            className="min-h-[40px] min-w-[40px] px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE VIEWPORT LAYOUT (sm:hidden flex) */}
      {/* ============================================================== */}
      <div className="flex sm:hidden items-center justify-between w-full relative" ref={popoverRef}>
        {/* Compact Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Compact Center State with Micro-Popover Trigger */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>

          {/* HCI Progressive Disclosure Info Icon Trigger */}
          <button
            type="button"
            onClick={() => setMobilePopoverOpen((prev) => !prev)}
            aria-label="Toggle filtered results breakdown info"
            aria-expanded={mobilePopoverOpen}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 focus:outline-none transition"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Micro-Popover adhering to "Show, don't tell" */}
          {mobilePopoverOpen && (
            <div
              role="dialog"
              aria-label="Page metrics summary"
              className="absolute left-1/2 -translate-x-1/2 -top-14 z-50 bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
            >
              <span>
                Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{totalItems}</strong> total results
              </span>
              <button
                type="button"
                onClick={() => setMobilePopoverOpen(false)}
                aria-label="Close metric popup"
                className="text-slate-400 hover:text-white ml-1 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Compact Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
