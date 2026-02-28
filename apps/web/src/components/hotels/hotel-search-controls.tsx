'use client';

/**
 * URL-aware search, filter, and sort components for hotels listing.
 * Manages URL search parameters for server-side data fetching.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { HotelFilters, MobileFilters } from './hotel-filters';

type FilterValues = {
  priceRange: [number, number];
  starRatings: number[];
  bookingModel: 'ALL' | 'DAILY' | 'HOURLY';
  amenities: string[];
  verified: boolean;
};

// ============================================
// Search Bar
// ============================================

export function HotelSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/hotels?${params.toString()}`);
  }, [query, searchParams, router]);

  const handleClear = useCallback(() => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');
    router.push(`/hotels?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by hotel name, city, or state..."
          className="w-full h-11 pl-10 pr-10 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        className="h-11 px-6 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
      >
        Search
      </button>
    </div>
  );
}

// ============================================
// Sort Selector
// ============================================

export function HotelSort({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        router.push(`/hotels?${params.toString()}`);
      }}
      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      <option value="FEATURED">Featured</option>
      <option value="RATING">Highest Rated</option>
      <option value="PRICE">Lowest Price</option>
      <option value="NAME">Name A-Z</option>
    </select>
  );
}

// ============================================
// URL-aware Filter Sidebar Wrapper
// ============================================

export function HotelFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse URL params into filter values
  const parseFilters = useCallback(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');

    return {
      priceRange: [
        minPrice ? parseFloat(minPrice) : 0,
        maxPrice ? parseFloat(maxPrice) : 50000,
      ] as [number, number],
      starRatings: minRating ? [parseInt(minRating)] : [],
      bookingModel: 'ALL' as const,
      amenities: [] as string[],
      verified: false,
    };
  }, [searchParams]);

  const filters = parseFilters();

  // Count active filters
  const activeCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < 50000,
    filters.starRatings.length > 0,
    !!searchParams.get('city'),
  ].filter(Boolean).length;

  // Update URL when filters change
  const handleFilterChange = useCallback(
    (newFilters: FilterValues) => {
      const params = new URLSearchParams(searchParams.toString());

      // Price range
      if (newFilters.priceRange[0] > 0) {
        params.set('minPrice', String(newFilters.priceRange[0]));
      } else {
        params.delete('minPrice');
      }
      if (newFilters.priceRange[1] < 50000) {
        params.set('maxPrice', String(newFilters.priceRange[1]));
      } else {
        params.delete('maxPrice');
      }

      // Star rating
      if (newFilters.starRatings.length > 0) {
        params.set('minRating', String(Math.min(...newFilters.starRatings)));
      } else {
        params.delete('minRating');
      }

      params.delete('page');
      router.push(`/hotels?${params.toString()}`);
    },
    [searchParams, router],
  );

  // Reset filters 
  const handleReset = useCallback(() => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`/hotels?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-600 text-white text-xs">
            {activeCount}
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <HotelFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          activeFiltersCount={activeCount}
        />
      </aside>

      {/* Mobile overlay */}
      <MobileFilters
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        activeFiltersCount={activeCount}
      />
    </>
  );
}

// ============================================
// Pagination
// ============================================

export function HotelPagination({
  total,
  page,
  limit,
  hasMore,
}: {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/hotels?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageNum: number;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (page <= 3) {
          pageNum = i + 1;
        } else if (page >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = page - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              pageNum === page
                ? 'bg-brand-600 text-white'
                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={!hasMore}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}
