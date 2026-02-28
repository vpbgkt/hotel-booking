'use client';

/**
 * Hotel Filters Component
 * Sidebar filters for hotel search
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Star, 
  Clock, 
  Calendar,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Sparkles,
  X
} from 'lucide-react';

interface FilterValues {
  priceRange: [number, number];
  starRatings: number[];
  bookingModel: 'ALL' | 'DAILY' | 'HOURLY';
  amenities: string[];
  verified: boolean;
}

interface HotelFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const amenityOptions = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Free Parking', icon: Car },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'spa', label: 'Spa', icon: Sparkles },
];

const priceRanges = [
  { min: 0, max: 2000, label: 'Under ₹2,000' },
  { min: 2000, max: 5000, label: '₹2,000 - ₹5,000' },
  { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
  { min: 10000, max: 50000, label: '₹10,000+' },
];

export function HotelFilters({ 
  filters, 
  onChange, 
  onReset, 
  activeFiltersCount 
}: HotelFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'price',
    'rating',
    'booking',
    'amenities'
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleStarRating = (rating: number) => {
    const newRatings = filters.starRatings.includes(rating)
      ? filters.starRatings.filter((r) => r !== rating)
      : [...filters.starRatings, rating];
    onChange({ ...filters, starRatings: newRatings });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: newAmenities });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.includes('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={`${range.min}-${range.max}`}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.priceRange[0] === range.min &&
                  filters.priceRange[1] === range.max
                }
                onChange={() =>
                  onChange({ ...filters, priceRange: [range.min, range.max] })
                }
                className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Star Rating */}
      <FilterSection
        title="Star Rating"
        isExpanded={expandedSections.includes('rating')}
        onToggle={() => toggleSection('rating')}
      >
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => toggleStarRating(rating)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                filters.starRatings.includes(rating)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {rating}
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Booking Type */}
      <FilterSection
        title="Booking Type"
        isExpanded={expandedSections.includes('booking')}
        onToggle={() => toggleSection('booking')}
      >
        <div className="space-y-2">
          {[
            { value: 'ALL', label: 'All Types', icon: null },
            { value: 'DAILY', label: 'Daily Only', icon: Calendar },
            { value: 'HOURLY', label: 'Hourly Available', icon: Clock },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="bookingModel"
                checked={filters.bookingModel === option.value}
                onChange={() =>
                  onChange({
                    ...filters,
                    bookingModel: option.value as FilterValues['bookingModel'],
                  })
                }
                className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-gray-900">
                {option.icon && <option.icon className="w-4 h-4" />}
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection
        title="Amenities"
        isExpanded={expandedSections.includes('amenities')}
        onToggle={() => toggleSection('amenities')}
      >
        <div className="space-y-2">
          {amenityOptions.map((amenity) => (
            <label
              key={amenity.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              />
              <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-gray-900">
                <amenity.icon className="w-4 h-4 text-gray-400" />
                {amenity.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Verified Only */}
      <div className="p-4 border-t border-gray-100">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) =>
              onChange({ ...filters, verified: e.target.checked })
            }
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <span className="flex items-center gap-2 text-sm text-gray-700">
            <Sparkles className="w-4 h-4 text-green-500" />
            Verified Properties Only
          </span>
        </label>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
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
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile Filter Sheet
interface MobileFiltersProps extends HotelFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilters({
  isOpen,
  onClose,
  ...props
}: MobileFiltersProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <HotelFilters {...props} />

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <Button variant="outline" onClick={props.onReset} className="flex-1">
                Clear All
              </Button>
              <Button onClick={onClose} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
