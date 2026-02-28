'use client';

/**
 * My Bookings Page - BlueStay
 * Lists all user bookings with filtering and management options
 */

import { useState } from 'react';
import Link from 'next/link';
// import { useQuery } from '@apollo/client/react';
// import { GET_USER_BOOKINGS } from '@/lib/graphql/queries/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Users,
  ChevronRight,
  Hotel,
  Loader2,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BookingStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';

// Mock bookings data - will be replaced with real API
const mockBookings = [
  {
    id: 'BK001',
    hotelName: 'Radhika Resort',
    hotelSlug: 'radhika-resort',
    location: 'Diu, Gujarat',
    roomType: 'Deluxe Sea View',
    checkIn: '2025-02-15',
    checkOut: '2025-02-18',
    guests: 2,
    totalAmount: 12500,
    status: 'upcoming' as const,
    bookingType: 'daily' as const,
  },
  {
    id: 'BK002',
    hotelName: 'Sunset Beach Resort',
    hotelSlug: 'sunset-beach-resort',
    location: 'Goa',
    roomType: 'Premium Suite',
    checkIn: '2025-01-20',
    checkOut: '2025-01-22',
    guests: 3,
    totalAmount: 18000,
    status: 'completed' as const,
    bookingType: 'daily' as const,
  },
  {
    id: 'BK003',
    hotelName: 'City Business Hotel',
    hotelSlug: 'city-business-hotel',
    location: 'Mumbai',
    roomType: 'Standard Room',
    checkIn: '2025-01-15',
    checkOut: '2025-01-15',
    guests: 1,
    totalAmount: 800,
    status: 'completed' as const,
    bookingType: 'hourly' as const,
    hours: 4,
  },
  {
    id: 'BK004',
    hotelName: 'Mountain View Lodge',
    hotelSlug: 'mountain-view-lodge',
    location: 'Shimla',
    roomType: 'Cottage',
    checkIn: '2024-12-24',
    checkOut: '2024-12-27',
    guests: 4,
    totalAmount: 22000,
    status: 'cancelled' as const,
    bookingType: 'daily' as const,
  },
];

const statusColors = {
  upcoming: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const statusLabels = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

export default function BookingsPage() {
  const [filter, setFilter] = useState<BookingStatus>('all');
  
  // TODO: Replace with actual GraphQL query
  // const { data, loading, error } = useQuery(GET_USER_BOOKINGS);
  const loading = false;
  const bookings = mockBookings;

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const filterTabs: { value: BookingStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: bookings.length },
    { value: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status === 'upcoming').length },
    { value: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and view your hotel reservations</p>
        </div>
        <Button asChild>
          <Link href="/hotels">
            <Hotel size={18} className="mr-2" />
            Book New Stay
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === tab.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 px-1.5 py-0.5 rounded-full text-xs',
              filter === tab.value
                ? 'bg-white/20'
                : 'bg-gray-100'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Hotel Image */}
                  <div className="md:w-48 h-40 md:h-auto bg-gray-100 flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center">
                      <Hotel size={32} className="text-brand-700" />
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                          {booking.bookingType === 'hourly' && (
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              <Clock size={12} className="mr-1" />
                              Hourly
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{booking.hotelName}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {booking.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Booking ID</p>
                        <p className="font-mono text-sm font-medium text-gray-900">{booking.id}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Check-in</p>
                          <p className="font-medium text-gray-900">
                            {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            {booking.bookingType === 'hourly' ? 'Duration' : 'Check-out'}
                          </p>
                          <p className="font-medium text-gray-900">
                            {booking.bookingType === 'hourly'
                              ? `${booking.hours} hours`
                              : new Date(booking.checkOut).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Room</p>
                          <p className="font-medium text-gray-900">{booking.roomType}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Guests</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <Users size={14} />
                            {booking.guests}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{booking.totalAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'upcoming' && (
                          <>
                            <Button variant="outline" size="sm">
                              Modify
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Download size={14} className="mr-1" />
                          Invoice
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/hotels/${booking.hotelSlug}`}>
                            View Hotel
                            <ChevronRight size={14} className="ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <CalendarDays size={48} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all' 
                ? "You haven't made any bookings yet." 
                : `You don't have any ${filter} bookings.`}
            </p>
            <Button asChild className="mt-6">
              <Link href="/hotels">Explore Hotels</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
