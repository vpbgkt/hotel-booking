/**
 * Hotels Listing Page - BlueStay Aggregator
 * /hotels - Shows all hotels with search and filters
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { getClient } from '@/lib/graphql/client';
import { GET_HOTELS, GET_POPULAR_CITIES } from '@/lib/graphql/queries/hotels';
import { HotelGrid } from '@/components/hotels/hotel-grid';
import { HotelSearchBar, HotelSort, HotelFilterSidebar, HotelPagination } from '@/components/hotels/hotel-search-controls';

export const metadata: Metadata = {
  title: 'Hotels Across India - Find & Book Hotels',
  description: 'Browse our collection of hotels across India. Compare prices, amenities, and reviews. Book directly for the best rates.',
};

interface HotelsPageProps {
  searchParams: Promise<{
    city?: string;
    search?: string;
    minRating?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
  }>;
}

interface HotelData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  city: string;
  state: string;
  starRating: number;
  averageRating?: number | null;
  reviewCount?: number | null;
  startingPrice: number;
  heroImageUrl?: string | null;
  bookingModel: 'DAILY' | 'HOURLY' | 'BOTH';
  isFeatured?: boolean;
}

interface QueryResult {
  hotels?: {
    hotels: HotelData[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  popularCities?: { city: string; state: string; count: number }[];
}

async function getHotelsData(searchParams: Awaited<HotelsPageProps['searchParams']>) {
  const client = getClient();
  
  const filters = {
    city: searchParams.city,
    search: searchParams.search,
    minRating: searchParams.minRating ? parseInt(searchParams.minRating) : undefined,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
  };
  
  const pagination = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 12,
    sortBy: searchParams.sort || 'FEATURED',
    sortOrder: 'DESC',
  };
  
  const [hotelsResult, citiesResult] = await Promise.all([
    client.query<QueryResult>({
      query: GET_HOTELS,
      variables: { filters, pagination },
    }),
    client.query<QueryResult>({
      query: GET_POPULAR_CITIES,
      variables: { limit: 10 },
    }),
  ]);
  
  return {
    hotels: hotelsResult.data?.hotels,
    cities: citiesResult.data?.popularCities || [],
  };
}

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;
  const { hotels } = await getHotelsData(params);
  const currentPage = params.page ? parseInt(params.page) : 1;
  
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: params.city ? `Hotels in ${params.city}` : 'Find Hotels Across India',
            description: `Browse ${hotels?.total || 0} hotels${params.city ? ` in ${params.city}` : ' across India'}. Compare prices and book directly.`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bluestay.in'}/hotels`,
          }),
        }}
      />
      <main className="flex-1">
        {/* Search Header */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {params.city
                ? `Hotels in ${params.city}`
                : params.search
                  ? `Search results for "${params.search}"`
                  : 'Find Your Perfect Stay'}
            </h1>
            <div className="bg-white rounded-lg p-3 shadow-lg">
              <Suspense fallback={<div className="h-11 bg-gray-100 rounded-lg animate-pulse" />}>
                <HotelSearchBar />
              </Suspense>
            </div>
          </div>
        </section>
        
        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <Suspense fallback={
                <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                  <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-96" />
                </aside>
              }>
                <HotelFilterSidebar />
              </Suspense>
              
              {/* Hotel Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">{hotels?.total || 0}</span> hotels found
                      {params.city && <span> in <strong>{params.city}</strong></span>}
                      {params.search && <span> matching <strong>&quot;{params.search}&quot;</strong></span>}
                    </p>
                  </div>
                  <Suspense>
                    <HotelSort currentSort={params.sort || 'FEATURED'} />
                  </Suspense>
                </div>
                
                <Suspense fallback={<HotelGridSkeleton />}>
                  <HotelGrid hotels={hotels?.hotels || []} />
                </Suspense>

                {/* Pagination */}
                {hotels && (
                  <Suspense>
                    <HotelPagination
                      total={hotels.total}
                      page={currentPage}
                      limit={hotels.limit}
                      hasMore={hotels.hasMore}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function HotelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
