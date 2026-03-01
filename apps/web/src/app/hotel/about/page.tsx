'use client';

/**
 * Hotel Tenant — About Page
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Shield,
  Award,
  MapPin,
  Clock,
  Users,
  Wifi,
  Wind,
  Tv,
  Coffee,
  Car,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/lib/tenant/tenant-context';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-6 h-6" />,
  ac: <Wind className="w-6 h-6" />,
  tv: <Tv className="w-6 h-6" />,
  minibar: <Coffee className="w-6 h-6" />,
  parking: <Car className="w-6 h-6" />,
  restaurant: <UtensilsCrossed className="w-6 h-6" />,
  pool: <Waves className="w-6 h-6" />,
  gym: <Dumbbell className="w-6 h-6" />,
  'room-service': <Coffee className="w-6 h-6" />,
  spa: <Heart className="w-6 h-6" />,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  ac: 'Air Conditioning',
  tv: 'Smart TV',
  minibar: 'Mini Bar',
  parking: 'Free Parking',
  restaurant: 'On-site Restaurant',
  pool: 'Swimming Pool',
  gym: 'Fitness Center',
  'room-service': '24/7 Room Service',
  spa: 'Spa & Wellness',
  breakfast: 'Complimentary Breakfast',
  laundry: 'Laundry Service',
};

export default function TenantAboutPage() {
  const { hotel, loading, theme } = useTenant();

  if (loading || !hotel) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const roomCount = hotel.roomTypes?.reduce((sum, r) => sum + r.totalRooms, 0) || 0;
  const roomTypeCount = hotel.roomTypes?.filter((r) => r.isActive).length || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px]">
        {hotel.heroImageUrl ? (
          <Image src={hotel.heroImageUrl} alt={hotel.name} fill className="object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor || '#2563eb'}, ${theme.secondaryColor || '#1e40af'})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">About {hotel.name}</h1>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {hotel.description ||
              `Welcome to ${hotel.name}, a ${hotel.starRating}-star property located in the heart of ${hotel.city}, ${hotel.state}. We pride ourselves on offering exceptional hospitality, comfortable accommodations, and memorable experiences for all our guests.`}
          </p>
        </section>

        {/* Quick Facts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Star className="w-5 h-5" />, label: 'Star Rating', value: `${hotel.starRating} Stars` },
              { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: `${hotel.city}, ${hotel.state}` },
              { icon: <Users className="w-5 h-5" />, label: 'Rooms', value: `${roomCount} rooms, ${roomTypeCount} types` },
              { icon: <Clock className="w-5 h-5" />, label: 'Check-in', value: hotel.checkInTime || '2:00 PM' },
            ].map((fact, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <div className="mb-2" style={{ color: theme.primaryColor || '#2563eb' }}>{fact.icon}</div>
                <div className="text-xs text-gray-500 mb-1">{fact.label}</div>
                <div className="font-medium text-gray-900 text-sm">{fact.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Amenities & Facilities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hotel.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <span style={{ color: theme.primaryColor || '#2563eb' }}>
                    {AMENITY_ICONS[amenity] || <Star className="w-6 h-6" />}
                  </span>
                  <span className="font-medium text-gray-700">
                    {AMENITY_LABELS[amenity] || amenity.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Policies */}
        {hotel.policies && hotel.policies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hotel Policies</h2>
            <ul className="space-y-3">
              {hotel.policies.map((policy, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor || '#2563eb' }} />
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Book?</h2>
          <p className="text-gray-600 mb-6">Browse our rooms and find the perfect one for your stay.</p>
          <Link href="/hotel/rooms">
            <Button size="lg" style={{ backgroundColor: theme.primaryColor || undefined }}>
              View Rooms & Suites
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
