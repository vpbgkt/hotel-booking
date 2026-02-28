'use client';

/**
 * Hotel Info Component
 * Displays hotel details, amenities, and policies
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  CheckCircle,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Sparkles,
  Coffee,
  Wind,
  Tv,
  Shield,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HotelInfoProps {
  hotel: {
    name: string;
    tagline?: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    starRating: number;
    averageRating?: number;
    reviewCount?: number;
    bookingModel: 'DAILY' | 'HOURLY' | 'BOTH';
    checkInTime?: string;
    checkOutTime?: string;
    minStayNights?: number;
    minStayHours?: number;
    amenities: string[];
    policies?: string[];
    phone?: string;
    email?: string;
    website?: string;
    isVerified: boolean;
    cancellationPolicy?: string;
  };
}

const amenityDetails: Record<string, { icon: React.ElementType; label: string; description?: string }> = {
  wifi: { icon: Wifi, label: 'Free WiFi', description: 'High-speed internet throughout the property' },
  parking: { icon: Car, label: 'Free Parking', description: 'On-site parking available for guests' },
  restaurant: { icon: Utensils, label: 'Restaurant', description: 'In-house restaurant serving multiple cuisines' },
  gym: { icon: Dumbbell, label: 'Fitness Center', description: 'Well-equipped gym with modern equipment' },
  pool: { icon: Waves, label: 'Swimming Pool', description: 'Outdoor swimming pool' },
  spa: { icon: Sparkles, label: 'Spa & Wellness', description: 'Full-service spa treatments available' },
  'room-service': { icon: Coffee, label: '24/7 Room Service', description: 'Round-the-clock in-room dining' },
  ac: { icon: Wind, label: 'Air Conditioning', description: 'Climate-controlled rooms' },
  tv: { icon: Tv, label: 'Flat-screen TV', description: 'Cable/satellite channels available' },
  security: { icon: Shield, label: '24/7 Security', description: 'Round-the-clock security staff' },
};

export function HotelInfo({ hotel }: HotelInfoProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  const displayedAmenities = showAllAmenities 
    ? hotel.amenities 
    : hotel.amenities.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {hotel.name}
              </h1>
              {hotel.isVerified && (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {hotel.tagline && (
              <p className="text-lg text-gray-600 mb-3">{hotel.tagline}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[...Array(hotel.starRating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* User Rating */}
              {hotel.averageRating && (
                <div className="flex items-center gap-1.5">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                    {hotel.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({hotel.reviewCount} reviews)
                  </span>
                </div>
              )}
              
              {/* Location */}
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {hotel.city}, {hotel.state}
              </span>
              
              {/* Booking Type */}
              {hotel.bookingModel === 'BOTH' && (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Hourly Available
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard
          icon={Calendar}
          label="Check-in"
          value={hotel.checkInTime || '2:00 PM'}
        />
        <InfoCard
          icon={Calendar}
          label="Check-out"
          value={hotel.checkOutTime || '11:00 AM'}
        />
        {hotel.bookingModel !== 'HOURLY' && (
          <InfoCard
            icon={Clock}
            label="Min Stay"
            value={`${hotel.minStayNights || 1} night${(hotel.minStayNights || 1) > 1 ? 's' : ''}`}
          />
        )}
        {(hotel.bookingModel === 'HOURLY' || hotel.bookingModel === 'BOTH') && (
          <InfoCard
            icon={Clock}
            label="Min Hourly"
            value={`${hotel.minStayHours || 3} hours`}
          />
        )}
      </div>

      {/* Description */}
      <Section
        title="About this hotel"
        isExpanded={expandedSection === 'description'}
        onToggle={() => setExpandedSection(expandedSection === 'description' ? null : 'description')}
      >
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {hotel.description || 'Welcome to our hotel. We strive to provide the best hospitality experience for all our guests.'}
        </p>
      </Section>

      {/* Address */}
      <Section
        title="Location"
        isExpanded={expandedSection === 'location'}
        onToggle={() => setExpandedSection(expandedSection === 'location' ? null : 'location')}
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            {hotel.address}, {hotel.city}, {hotel.state} - {hotel.pincode}
          </p>
          
          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
            {hotel.phone && (
              <a 
                href={`tel:${hotel.phone}`}
                className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
              >
                <Phone className="w-4 h-4" />
                {hotel.phone}
              </a>
            )}
            {hotel.email && (
              <a 
                href={`mailto:${hotel.email}`}
                className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
              >
                <Mail className="w-4 h-4" />
                {hotel.email}
              </a>
            )}
            {hotel.website && (
              <a 
                href={hotel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </Section>

      {/* Amenities */}
      <Section
        title="Amenities"
        isExpanded={expandedSection === 'amenities'}
        onToggle={() => setExpandedSection(expandedSection === 'amenities' ? null : 'amenities')}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedAmenities.map((amenity) => {
            const details = amenityDetails[amenity];
            const Icon = details?.icon || CheckCircle;
            
            return (
              <div 
                key={amenity}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Icon className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {details?.label || amenity}
                  </p>
                  {details?.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {details.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {hotel.amenities.length > 8 && (
          <button
            onClick={() => setShowAllAmenities(!showAllAmenities)}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            {showAllAmenities ? 'Show less' : `Show all ${hotel.amenities.length} amenities`}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAllAmenities ? 'rotate-180' : ''}`} />
          </button>
        )}
      </Section>

      {/* Policies */}
      {hotel.policies && hotel.policies.length > 0 && (
        <Section
          title="House Rules & Policies"
          isExpanded={expandedSection === 'policies'}
          onToggle={() => setExpandedSection(expandedSection === 'policies' ? null : 'policies')}
        >
          <ul className="space-y-2">
            {hotel.policies.map((policy, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-600">
                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                {policy}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Cancellation Policy */}
      <Section
        title="Cancellation Policy"
        isExpanded={expandedSection === 'cancellation'}
        onToggle={() => setExpandedSection(expandedSection === 'cancellation' ? null : 'cancellation')}
      >
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {hotel.cancellationPolicy || 'Free cancellation up to 24 hours before check-in'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please review the cancellation policy before booking
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

interface SectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-gray-100 pb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
