'use client';

/**
 * Platform Admin - Hotels Management
 * List, activate/deactivate, update commission rates for all hotels
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  PLATFORM_HOTELS,
  TOGGLE_HOTEL_ACTIVE,
  TOGGLE_HOTEL_FEATURED,
  UPDATE_HOTEL_COMMISSION,
} from '@/lib/graphql/queries/platform-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  AlertCircle,
  Star,
  ToggleLeft,
  ToggleRight,
  Award,
  Percent,
  BedDouble,
  CalendarCheck,
  MessageSquare,
  Globe,
  X,
  Building2,
} from 'lucide-react';

interface PlatformHotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  starRating: number;
  isActive: boolean;
  isFeatured: boolean;
  commissionRate: number;
  createdAt: string;
  heroImageUrl?: string;
  bookingsCount?: number;
  roomTypesCount?: number;
  reviewsCount?: number;
  adminsCount?: number;
  primaryDomain?: string;
}

export default function PlatformHotelsPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [commissionValue, setCommissionValue] = useState('');
  const limit = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error, refetch } = useQuery<any>(PLATFORM_HOTELS, {
    variables: {
      filters: {
        ...(search && { search }),
        ...(activeFilter !== undefined && { isActive: activeFilter }),
        page,
        limit,
      },
    },
  });

  const [toggleActive] = useMutation(TOGGLE_HOTEL_ACTIVE, {
    onCompleted: () => refetch(),
  });

  const [toggleFeatured] = useMutation(TOGGLE_HOTEL_FEATURED, {
    onCompleted: () => refetch(),
  });

  const [updateCommission] = useMutation(UPDATE_HOTEL_COMMISSION, {
    onCompleted: () => {
      setEditingCommission(null);
      refetch();
    },
  });

  const hotels: PlatformHotel[] = data?.platformHotels?.hotels || [];
  const total = data?.platformHotels?.total || 0;
  const hasMore = data?.platformHotels?.hasMore || false;

  const handleCommissionSave = (hotelId: string) => {
    const rate = parseFloat(commissionValue);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    updateCommission({
      variables: { hotelId, commissionRate: rate / 100 },
    });
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hotels</h2>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search hotels by name or city..."
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={activeFilter === undefined ? 'default' : 'outline'}
                onClick={() => {
                  setActiveFilter(undefined);
                  setPage(1);
                }}
              >
                All
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeFilter === true ? 'default' : 'outline'}
                onClick={() => {
                  setActiveFilter(true);
                  setPage(1);
                }}
              >
                Active
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeFilter === false ? 'default' : 'outline'}
                onClick={() => {
                  setActiveFilter(false);
                  setPage(1);
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats summary */}
      <div className="text-sm text-gray-500">
        Showing {hotels.length} of {total} hotels
      </div>

      {/* Hotel cards */}
      <div className="space-y-4">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-48 h-32 lg:h-auto bg-gray-200 flex-shrink-0">
                  {hotel.heroImageUrl ? (
                    <img
                      src={hotel.heroImageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BedDouble size={32} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                        {hotel.isFeatured && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            <Award size={10} className="mr-1" /> Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {hotel.city}, {hotel.state}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <Badge
                      className={
                        hotel.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BedDouble size={12} /> {hotel.roomTypesCount || 0} room types
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck size={12} /> {hotel.bookingsCount || 0} bookings
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} /> {hotel.reviewsCount || 0} reviews
                    </span>
                    {hotel.primaryDomain && (
                      <span className="flex items-center gap-1">
                        <Globe size={12} /> {hotel.primaryDomain}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Percent size={12} />{' '}
                      {editingCommission === hotel.id ? (
                        <span className="flex items-center gap-1">
                          <input
                            type="number"
                            value={commissionValue}
                            onChange={(e) => setCommissionValue(e.target.value)}
                            className="w-16 h-6 px-2 text-xs border rounded"
                            min={0}
                            max={100}
                            step={0.5}
                          />
                          %
                          <button
                            onClick={() => handleCommissionSave(hotel.id)}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommission(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCommission(hotel.id);
                            setCommissionValue(
                              String(Math.round(hotel.commissionRate * 100 * 10) / 10),
                            );
                          }}
                          className="text-indigo-600 hover:underline"
                        >
                          {Math.round(hotel.commissionRate * 100)}% commission
                        </button>
                      )}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleActive({
                          variables: { hotelId: hotel.id, isActive: !hotel.isActive },
                        })
                      }
                    >
                      {hotel.isActive ? (
                        <>
                          <ToggleRight size={14} className="mr-1" /> Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={14} className="mr-1" /> Activate
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleFeatured({
                          variables: { hotelId: hotel.id, isFeatured: !hotel.isFeatured },
                        })
                      }
                    >
                      <Award size={14} className="mr-1" />
                      {hotel.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Hotels Found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {search ? 'Try a different search term' : 'No hotels registered yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 flex items-center px-3">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
