'use client';

/**
 * Hotel Tenant — Rooms Listing Page
 * Shows all available rooms with filters and booking options
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { format, addDays, differenceInDays } from 'date-fns';
import {
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  SlidersHorizontal,
  Wifi,
  Wind,
  Tv,
  Coffee,
  Bath,
  Mountain,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/lib/tenant/tenant-context';
import { CHECK_DAILY_AVAILABILITY } from '@/lib/graphql/queries/rooms';
import { AvailabilityCalendar } from '@/components/booking/availability-calendar';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4" />,
  ac: <Wind className="w-4 h-4" />,
  tv: <Tv className="w-4 h-4" />,
  minibar: <Coffee className="w-4 h-4" />,
  'room-service': <Coffee className="w-4 h-4" />,
  'ocean-view': <Mountain className="w-4 h-4" />,
  balcony: <Mountain className="w-4 h-4" />,
  bathtub: <Bath className="w-4 h-4" />,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  ac: 'Air Conditioning',
  tv: 'Smart TV',
  minibar: 'Mini Bar',
  'room-service': 'Room Service',
  'ocean-view': 'Ocean View',
  balcony: 'Private Balcony',
  bathtub: 'Bathtub',
  safe: 'Safe',
  breakfast: 'Breakfast',
};

export default function TenantRoomsPage() {
  const { hotel, loading: hotelLoading, theme } = useTenant();
  const searchParams = useSearchParams();

  // Dates from search widget or defaults
  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd')
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') || format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );
  const [guestCount, setGuestCount] = useState(
    Number(searchParams.get('guests')) || 2
  );
  const [bookingMode, setBookingMode] = useState<'DAILY' | 'HOURLY'>('DAILY');
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'guests' | 'name'>('price');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarRoomId, setCalendarRoomId] = useState<string | null>(null);

  const nights = Math.max(1, differenceInDays(new Date(checkOut), new Date(checkIn)));

  // Check availability for the selected dates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: availData } = useQuery<any>(CHECK_DAILY_AVAILABILITY, {
    variables: {
      input: {
        hotelId: hotel?.id,
        checkIn,
        checkOut,
        numRooms: 1,
      },
    },
    skip: !hotel?.id,
    fetchPolicy: 'cache-and-network',
  });

  // Build availability map: roomTypeId → { isAvailable, totalPrice, pricePerNight }
  const availabilityMap = useMemo(() => {
    const map: Record<string, { isAvailable: boolean; totalPrice: number; pricePerNight: number }> = {};
    if (availData?.checkDailyAvailability) {
      const result = availData.checkDailyAvailability;
      [...(result.roomTypes || []), ...(result.unavailableRoomTypes || [])].forEach((rt: { roomType: { id: string }; isAvailable: boolean; totalPrice: number; pricePerNight: number }) => {
        map[rt.roomType.id] = {
          isAvailable: rt.isAvailable,
          totalPrice: rt.totalPrice || 0,
          pricePerNight: rt.pricePerNight || 0,
        };
      });
    }
    return map;
  }, [availData]);

  const activeRooms = useMemo(() => {
    const rooms = (hotel?.roomTypes || []).filter((r) => r.isActive);
    return rooms.sort((a, b) => {
      if (sortBy === 'price') return a.basePriceDaily - b.basePriceDaily;
      if (sortBy === 'guests') return b.maxGuests - a.maxGuests;
      return a.name.localeCompare(b.name);
    });
  }, [hotel?.roomTypes, sortBy]);

  if (hotelLoading || !hotel) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse mb-4" />
          ))}
        </div>
      </div>
    );
  }

  const showHourlyToggle = hotel.bookingModel === 'BOTH';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div
        className="py-12 text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor || '#2563eb'}, ${theme.secondaryColor || '#1e40af'})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Rooms & Suites</h1>
          <p className="text-white/80">at {hotel.name}</p>
        </div>
      </div>

      {/* Search / Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Booking mode toggle */}
            {showHourlyToggle && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBookingMode('DAILY')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    bookingMode === 'DAILY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Daily
                </button>
                <button
                  onClick={() => setBookingMode('HOURLY')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    bookingMode === 'HOURLY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hourly
                </button>
              </div>
            )}

            {/* Date pickers */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-500">{nights} night{nights > 1 ? 's' : ''}</span>
            </div>

            {/* Guests */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="text-sm bg-transparent focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm bg-transparent border-0 focus:outline-none text-gray-600"
              >
                <option value="price">Sort by Price</option>
                <option value="guests">Sort by Capacity</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Room Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Availability Calendar Toggle */}
        {activeRooms.length > 0 && bookingMode === 'DAILY' && (
          <div className="mb-6">
            <button
              onClick={() => {
                setShowCalendar(!showCalendar);
                if (!calendarRoomId && activeRooms[0]) {
                  setCalendarRoomId(activeRooms[0].id);
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {showCalendar ? 'Hide availability calendar' : 'View availability calendar'}
            </button>

            {showCalendar && calendarRoomId && (
              <div className="mt-4 max-w-md">
                {/* Room selector for calendar */}
                {activeRooms.length > 1 && (
                  <div className="mb-3">
                    <select
                      value={calendarRoomId}
                      onChange={(e) => setCalendarRoomId(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 w-full"
                    >
                      {activeRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} — ₹{room.basePriceDaily.toLocaleString('en-IN')}/night
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <AvailabilityCalendar
                  roomTypeId={calendarRoomId}
                  basePrice={activeRooms.find(r => r.id === calendarRoomId)?.basePriceDaily || 0}
                  totalRooms={activeRooms.find(r => r.id === calendarRoomId)?.totalRooms || 1}
                  selectedCheckIn={checkIn}
                  selectedCheckOut={checkOut}
                  onDateRangeSelect={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {activeRooms.map((room) => {
            const avail = availabilityMap[room.id];
            const isAvailable = avail?.isAvailable !== false;
            const isExpanded = expandedRoom === room.id;
            const images = room.images || [];

            return (
              <div
                key={room.id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-shadow hover:shadow-md ${
                  !isAvailable ? 'opacity-60' : ''
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Image */}
                  <div className="relative h-56 md:h-full min-h-[220px]">
                    {images[0] ? (
                      <Image
                        src={images[0]}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    {images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        +{images.length - 1} photos
                      </div>
                    )}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm">
                          Sold Out
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 p-5 md:p-6 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {room.maxGuests} guests
                            </span>
                            {room.maxExtraGuests > 0 && (
                              <span>(+{room.maxExtraGuests} extra at ₹{room.extraGuestCharge}/night)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{(avail?.pricePerNight || room.basePriceDaily).toLocaleString('en-IN')}
                          </div>
                          <div className="text-sm text-gray-500">/night</div>
                          {nights > 1 && avail?.totalPrice && (
                            <div className="text-sm text-gray-400">
                              ₹{avail.totalPrice.toLocaleString('en-IN')} total
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {room.description || 'A comfortable and well-appointed room for a relaxing stay.'}
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.slice(0, 6).map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-md"
                          >
                            {AMENITY_ICONS[a] || <Check className="w-3.5 h-3.5" />}
                            {AMENITY_LABELS[a] || a}
                          </span>
                        ))}
                        {room.amenities.length > 6 && (
                          <button
                            onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                            className="text-xs text-brand-600 hover:underline"
                          >
                            +{room.amenities.length - 6} more
                          </button>
                        )}
                      </div>

                      {/* Expanded amenities */}
                      {isExpanded && (
                        <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
                          {room.amenities.slice(6).map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-md"
                            >
                              {AMENITY_ICONS[a] || <Check className="w-3.5 h-3.5" />}
                              {AMENITY_LABELS[a] || a}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Hourly pricing line */}
                      {hotel.bookingModel !== 'DAILY' && room.basePriceHourly && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Clock className="w-4 h-4" />
                          Hourly: ₹{room.basePriceHourly.toLocaleString('en-IN')}/hr
                          (min {hotel.hourlyMinHours || 3} hrs)
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                      <Link href={`/hotel/rooms/${room.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {isAvailable ? (
                        <Link
                          href={`/hotel/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestCount}`}
                          className="flex-1"
                        >
                          <Button
                            className="w-full"
                            style={{ backgroundColor: theme.primaryColor || undefined }}
                          >
                            Book Now
                          </Button>
                        </Link>
                      ) : (
                        <Button className="flex-1" disabled>
                          Sold Out
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {activeRooms.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
              <p className="text-gray-400 mt-2">Please contact us for more information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
