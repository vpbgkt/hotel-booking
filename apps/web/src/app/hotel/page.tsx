'use client';

/**
 * Hotel Tenant Homepage
 * The main landing page for a hotel's own website.
 * e.g., radhikaresort.in/ or localhost:3000/hotel
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Wifi,
  Wind,
  Tv,
  Coffee,
  Car,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Shield,
  Award,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/lib/tenant/tenant-context';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-5 h-5" />,
  ac: <Wind className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  minibar: <Coffee className="w-5 h-5" />,
  parking: <Car className="w-5 h-5" />,
  restaurant: <UtensilsCrossed className="w-5 h-5" />,
  pool: <Waves className="w-5 h-5" />,
  gym: <Dumbbell className="w-5 h-5" />,
  'room-service': <Coffee className="w-5 h-5" />,
  spa: <Heart className="w-5 h-5" />,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  ac: 'Air Conditioning',
  tv: 'Smart TV',
  minibar: 'Mini Bar',
  parking: 'Free Parking',
  restaurant: 'Restaurant',
  pool: 'Swimming Pool',
  gym: 'Fitness Center',
  'room-service': 'Room Service',
  spa: 'Spa & Wellness',
  breakfast: 'Breakfast Included',
  balcony: 'Private Balcony',
  safe: 'In-room Safe',
  laundry: 'Laundry Service',
};

export default function TenantHomePage() {
  const { hotel, loading, theme } = useTenant();

  // Search widget state
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(2);

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero skeleton */}
        <div className="h-[70vh] bg-gray-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h1>
          <p className="text-gray-600 mb-6">The hotel you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Go to BlueStay</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  return (
    <div>
      {/* =================== HERO SECTION =================== */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end">
        {hotel.heroImageUrl ? (
          <Image
            src={hotel.heroImageUrl}
            alt={hotel.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor || '#2563eb'}, ${theme.secondaryColor || '#1e40af'})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <div className="max-w-2xl">
            {hotel.isVerified && (
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <Shield className="w-3.5 h-3.5" />
                Verified Property
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
              {hotel.name}
            </h1>
            {hotel.tagline && (
              <p className="text-xl text-white/90 mb-4">{hotel.tagline}</p>
            )}
            <div className="flex items-center gap-4 text-white/80 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              {hotel.averageRating && (
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {hotel.averageRating.toFixed(1)} ({hotel.reviewCount} reviews)
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {hotel.city}, {hotel.state}
              </span>
            </div>
            {hotel.startingPrice && (
              <div className="text-white">
                <span className="text-sm opacity-80">Starting from</span>
                <span className="text-3xl font-bold ml-2">₹{hotel.startingPrice.toLocaleString('en-IN')}</span>
                <span className="text-lg opacity-80">/night</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================== SEARCH BAR =================== */}
      <section className="relative z-20 -mt-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Link
                href={`/hotel/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
              >
                <Button className="w-full py-2.5" style={{ backgroundColor: theme.primaryColor || undefined }}>
                  Check Availability
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================== ROOMS PREVIEW =================== */}
      {activeRooms.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Rooms & Suites
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our carefully designed rooms, each offering comfort and elegance for your perfect stay.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRooms.slice(0, 3).map((room) => (
                <Link
                  key={room.id}
                  href={`/hotel/rooms/${room.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    {room.images?.[0] ? (
                      <Image
                        src={room.images[0]}
                        alt={room.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Hourly Available
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {room.description || `Comfortable room for up to ${room.maxGuests} guests`}
                    </p>
                    <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Up to {room.maxGuests}
                      </span>
                      {room.amenities.slice(0, 2).map((a) => (
                        <span key={a} className="flex items-center gap-1">
                          {AMENITY_ICONS[a] || null}
                          {AMENITY_LABELS[a] || a}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{room.basePriceDaily.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-gray-500">/night</span>
                      </div>
                      <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: theme.primaryColor || '#2563eb' }}>
                        View Details <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {activeRooms.length > 3 && (
              <div className="text-center mt-8">
                <Link href="/hotel/rooms">
                  <Button variant="outline" size="lg">
                    View All Rooms ({activeRooms.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================== AMENITIES =================== */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Hotel Amenities
              </h2>
              <p className="text-gray-600">Everything you need for a comfortable stay</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {hotel.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: `${theme.primaryColor || '#2563eb'}20` }}
                  >
                    <span style={{ color: theme.primaryColor || '#2563eb' }}>
                      {AMENITY_ICONS[amenity] || <Star className="w-5 h-5" />}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {AMENITY_LABELS[amenity] || amenity.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =================== WHY BOOK DIRECT =================== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Book Direct?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Best Price Guarantee',
                desc: 'Book directly with us and get the lowest rate available, guaranteed.',
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: 'No Hidden Charges',
                desc: 'What you see is what you pay. No booking fees, no middleman markup.',
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Personalized Service',
                desc: 'Direct communication with our team for special requests and preferences.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div
                  className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.primaryColor || '#2563eb' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== LOCATION =================== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor || '#2563eb' }} />
                <div>
                  <p className="font-medium text-gray-900">{hotel.address}</p>
                  <p className="text-gray-600">{hotel.city}, {hotel.state} — {hotel.pincode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                <Clock className="w-4 h-4" style={{ color: theme.primaryColor || '#2563eb' }} />
                Check-in: {hotel.checkInTime || '2:00 PM'} | Check-out: {hotel.checkOutTime || '11:00 AM'}
              </div>
              <Link href="/hotel/contact">
                <Button variant="outline">Get Directions</Button>
              </Link>
            </div>
            <div className="h-72 bg-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Map will be displayed here</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section
        className="py-16 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor || '#2563eb'}, ${theme.secondaryColor || '#1e40af'})`,
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience {hotel.name}?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Book your stay today and enjoy our best rates when you book directly.
          </p>
          <Link href="/hotel/rooms">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg">
              Browse Rooms & Book Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
