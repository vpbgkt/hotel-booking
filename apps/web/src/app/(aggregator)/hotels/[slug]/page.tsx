/**
 * Hotel Detail Page - BlueStay Aggregator
 * /hotels/[slug] - Shows hotel details with rooms and booking
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getClient } from '@/lib/graphql/client';
import { GET_HOTEL_BY_SLUG } from '@/lib/graphql/queries/hotels';
import { RoomCard } from '@/components/rooms/room-card';
import { ReviewSection } from '@/components/reviews/review-section';
import { BookingWidget } from '@/components/booking/booking-widget';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock
} from 'lucide-react';

interface HotelPageProps {
  params: Promise<{ slug: string }>;
}

interface HotelData {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  averageRating?: number;
  reviewCount?: number;
  heroImageUrl?: string;
  thumbnailUrl?: string;
  galleryImages?: string[];
  startingPrice?: number;
  startingHourlyPrice?: number;
  bookingModel: 'DAILY' | 'HOURLY' | 'BOTH';
  checkInTime?: string;
  checkOutTime?: string;
  minStayNights?: number;
  minStayHours?: number;
  amenities: string[];
  policies?: string[];
  isFeatured: boolean;
  isVerified: boolean;
  roomTypes?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    basePriceDaily: number;
    basePriceHourly?: number | null;
    maxGuests: number;
    maxExtraGuests: number;
    extraGuestCharge: number;
    totalRooms: number;
    amenities: string[];
    images: string[];
    isActive: boolean;
  }[];
  reviews?: {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    guest: {
      name: string;
      avatarUrl?: string;
    };
  }[];
}

interface QueryResult {
  hotelBySlug?: HotelData;
}

async function getHotelData(slug: string): Promise<HotelData | null> {
  const client = getClient();
  
  try {
    const { data } = await client.query<QueryResult>({
      query: GET_HOTEL_BY_SLUG,
      variables: { slug },
    });
    
    return data?.hotelBySlug || null;
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return null;
  }
}

export async function generateMetadata({ params }: HotelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelData(slug);
  
  if (!hotel) {
    return {
      title: 'Hotel Not Found',
    };
  }
  
  return {
    title: `${hotel.name} - Book Rooms from ₹${hotel.startingPrice?.toLocaleString('en-IN') || '--'}`,
    description: hotel.description?.slice(0, 160) || `Book your stay at ${hotel.name} in ${hotel.city}. Best prices guaranteed.`,
    openGraph: {
      title: hotel.name,
      description: hotel.description?.slice(0, 160),
      images: hotel.heroImageUrl ? [{ url: hotel.heroImageUrl }] : [],
    },
  };
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { slug } = await params;
  const hotel = await getHotelData(slug);
  
  if (!hotel) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[40vh] md:h-[50vh] lg:h-[60vh]">
          {hotel.heroImageUrl ? (
            <Image
              src={hotel.heroImageUrl}
              alt={hotel.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-600 to-brand-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Hotel Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  {hotel.isFeatured && (
                    <Badge variant="premium" className="mb-2">Featured</Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center gap-3 text-white/90">
                    <StarRating rating={hotel.starRating} size="lg" />
                    {hotel.averageRating && (
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">{hotel.averageRating}</span>
                        <span className="text-white/70">({hotel.reviewCount} reviews)</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-white/80">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.city}, {hotel.state}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-white/80 text-sm">Starting from</div>
                  <div className="text-3xl font-bold text-white">
                    ₹{hotel.startingPrice?.toLocaleString('en-IN') || '--'}
                    <span className="text-lg font-normal text-white/80">/night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {hotel.description || 'Welcome to our hotel. We provide excellent accommodations and service.'}
                  </p>
                </div>
                
                {/* Quick Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel Info</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-brand-600" />
                      <div>
                        <div className="text-xs text-gray-500">Check-in</div>
                        <div className="font-medium">{hotel.checkInTime || '2:00 PM'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-brand-600" />
                      <div>
                        <div className="text-xs text-gray-500">Check-out</div>
                        <div className="font-medium">{hotel.checkOutTime || '11:00 AM'}</div>
                      </div>
                    </div>
                    {hotel.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-brand-600" />
                        <div>
                          <div className="text-xs text-gray-500">Phone</div>
                          <div className="font-medium">{hotel.phone}</div>
                        </div>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-brand-600" />
                        <div>
                          <div className="text-xs text-gray-500">Email</div>
                          <div className="font-medium text-sm truncate">{hotel.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Rooms */}
                <div id="rooms">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Rooms</h2>
                  <div className="space-y-4">
                    {hotel.roomTypes?.map((room) => (
                      <RoomCard 
                        key={room.id} 
                        room={room}
                        hotelSlug={slug}
                        bookingModel={hotel.bookingModel}
                      />
                    ))}
                    {(!hotel.roomTypes || hotel.roomTypes.length === 0) && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No rooms available at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Reviews */}
                <div id="reviews">
                  <ReviewSection
                    hotelId={hotel.id}
                    averageRating={hotel.averageRating}
                    reviewCount={hotel.reviewCount}
                    reviews={hotel.reviews || []}
                  />
                </div>
              </div>
              
              {/* Sidebar - Booking Widget */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <BookingWidget 
                    hotelId={hotel.id}
                    hotelName={hotel.name}
                    hotelSlug={slug}
                    bookingModel={hotel.bookingModel}
                    minStayNights={hotel.minStayNights}
                    minStayHours={hotel.minStayHours}
                    checkInTime={hotel.checkInTime}
                    checkOutTime={hotel.checkOutTime}
                    selectedRoom={hotel.roomTypes?.[0] || null}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Location */}
        {hotel.latitude && hotel.longitude && (
          <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location</h2>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{hotel.address}</p>
                    <p className="text-gray-600">{hotel.city}, {hotel.state} - {hotel.pincode}</p>
                  </div>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map will be displayed here</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
