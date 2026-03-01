/**
 * City Hotels Page - BlueStay Aggregator
 * /hotels/city/[city] - SEO-friendly city-based hotel listing
 * e.g., /hotels/city/goa, /hotels/city/mumbai, /hotels/city/jaipur
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getClient } from '@/lib/graphql/client';
import { GET_HOTELS, GET_POPULAR_CITIES } from '@/lib/graphql/queries/hotels';
import { HotelGrid } from '@/components/hotels/hotel-grid';
import { HotelSearchBar, HotelSort, HotelFilterSidebar, HotelPagination } from '@/components/hotels/hotel-search-controls';
import { MapPin, ChevronRight, Building2 } from 'lucide-react';

interface CityPageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    minRating?: string;
    minPrice?: string;
    maxPrice?: string;
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

// Decode and format city name
function formatCityName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = formatCityName(city);

  return {
    title: `Hotels in ${cityName} - Book Best Hotels | BlueStay`,
    description: `Find and book the best hotels in ${cityName}. Compare prices, read reviews, and get the best deals. Direct booking for lowest rates.`,
    openGraph: {
      title: `Hotels in ${cityName} - BlueStay`,
      description: `Discover top-rated hotels in ${cityName}. Book directly for the best prices.`,
      type: 'website',
    },
    alternates: {
      canonical: `/hotels/city/${city.toLowerCase()}`,
    },
  };
}

async function getCityData(citySlug: string, searchParams: Record<string, string | undefined>) {
  const client = getClient();
  const cityName = formatCityName(citySlug);

  const filters = {
    city: cityName,
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
    cityName,
  };
}

export default async function CityHotelsPage({ params, searchParams }: CityPageProps) {
  const { city } = await params;
  const sp = await searchParams;
  const { hotels, cities, cityName } = await getCityData(city, sp);
  const currentPage = sp.page ? parseInt(sp.page) : 1;

  // Find the state for this city
  const cityInfo = cities.find(
    (c) => c.city.toLowerCase() === cityName.toLowerCase()
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Hotels in ${cityName}`,
            description: `Browse ${hotels?.total || 0} hotels in ${cityName}. Compare prices and book directly.`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bluestay.in'}/hotels/city/${city}`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_APP_URL || 'https://bluestay.in' },
                { '@type': 'ListItem', position: 2, name: 'Hotels', item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bluestay.in'}/hotels` },
                { '@type': 'ListItem', position: 3, name: `Hotels in ${cityName}` },
              ],
            },
          }),
        }}
      />

      <main className="flex-1">
        {/* City Hero Header */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-brand-200 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link href="/hotels" className="hover:text-white transition-colors">Hotels</Link>
              <ChevronRight size={14} />
              <span className="text-white font-medium">{cityName}</span>
            </nav>

            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-brand-200" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Hotels in {cityName}
              </h1>
            </div>
            <p className="text-brand-100 text-sm md:text-base mb-4">
              {hotels?.total || 0} hotels available
              {cityInfo?.state && ` in ${cityName}, ${cityInfo.state}`}
            </p>

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
              {/* Sidebar */}
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
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{hotels?.total || 0}</span>{' '}
                    hotels in <strong>{cityName}</strong>
                  </p>
                  <Suspense>
                    <HotelSort currentSort={sp.sort || 'FEATURED'} />
                  </Suspense>
                </div>

                {hotels && hotels.hotels.length > 0 ? (
                  <Suspense fallback={<HotelGridSkeleton />}>
                    <HotelGrid hotels={hotels.hotels} />
                  </Suspense>
                ) : (
                  <div className="text-center py-16">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found in {cityName}</h3>
                    <p className="text-gray-500 mb-6">Try searching in other cities</p>
                    <Link
                      href="/hotels"
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Browse all hotels →
                    </Link>
                  </div>
                )}

                {/* Pagination */}
                {hotels && hotels.total > 12 && (
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

        {/* Other Cities CTA */}
        {cities.length > 0 && (
          <section className="bg-gray-50 py-10">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Explore Other Cities</h2>
              <div className="flex flex-wrap gap-3">
                {cities
                  .filter((c) => c.city.toLowerCase() !== cityName.toLowerCase())
                  .slice(0, 8)
                  .map((c) => (
                    <Link
                      key={c.city}
                      href={`/hotels/city/${c.city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      <MapPin size={14} />
                      {c.city}
                      <span className="text-gray-400">({c.count})</span>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}
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
