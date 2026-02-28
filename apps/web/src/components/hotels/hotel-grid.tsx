'use client';

/**
 * Hotel Grid Component
 * Displays hotel cards in a responsive grid layout
 */

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Hotel {
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
  amenities?: string[];
  isFeatured?: boolean;
}

interface HotelGridProps {
  hotels: Hotel[];
  loading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function HotelGrid({ hotels, loading }: HotelGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </motion.div>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const topAmenities = (hotel.amenities || []).slice(0, 3);
  
  return (
    <motion.div variants={item}>
      <Link 
        href={`/hotels/${hotel.slug}`}
        className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {hotel.heroImageUrl ? (
            <Image
              src={hotel.heroImageUrl}
              alt={hotel.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200" />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {hotel.isFeatured && (
              <Badge variant="success" className="text-xs">
                Featured
              </Badge>
            )}
            {hotel.bookingModel === 'HOURLY' && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Hourly
              </Badge>
            )}
            {hotel.bookingModel === 'BOTH' && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Hourly Available
              </Badge>
            )}
          </div>
          
          {/* Star Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            {[...Array(hotel.starRating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                {hotel.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {hotel.city}, {hotel.state}
              </p>
            </div>
            
            {hotel.averageRating && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                {hotel.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          
          {hotel.description && (
            <p className="text-sm text-gray-600 line-clamp-1 mb-3">
              {hotel.description}
            </p>
          )}
          
          {/* Amenities */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topAmenities.map((amenity) => (
                <span 
                  key={amenity}
                  className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {(hotel.amenities || []).length > 3 && (
                <span className="text-xs text-gray-500">
                  +{(hotel.amenities || []).length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Pricing */}
          <div className="flex items-end justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-xl font-bold text-gray-900">
                ₹{(hotel.startingPrice || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">per night</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export { HotelCard, HotelCardSkeleton };
