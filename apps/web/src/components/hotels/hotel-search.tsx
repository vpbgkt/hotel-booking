'use client';

/**
 * Hotel Search Component
 * Search bar with location autocomplete and date selection
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  X,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HotelSearchProps {
  popularCities?: { city: string; state: string; count: number }[];
  className?: string;
  variant?: 'hero' | 'compact';
}

export function HotelSearch({ 
  popularCities = [], 
  className = '',
  variant = 'hero' 
}: HotelSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [location, setLocation] = useState(searchParams.get('city') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '2'));
  const [bookingType, setBookingType] = useState<'daily' | 'hourly'>(
    searchParams.get('type') === 'hourly' ? 'hourly' : 'daily'
  );
  
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  
  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setShowGuestDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('city', location);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests.toString());
    params.set('type', bookingType);
    
    router.push(`/hotels?${params.toString()}`);
  };

  const filteredCities = popularCities.filter(
    (city) =>
      city.city.toLowerCase().includes(location.toLowerCase()) ||
      city.state.toLowerCase().includes(location.toLowerCase())
  );

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
        <div className="flex flex-col md:flex-row">
          {/* Location */}
          <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="relative" ref={locationRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  placeholder="Where are you going?"
                  className="w-full pl-6 pr-2 py-1 text-sm border-0 focus:ring-0 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
          
          {/* Dates */}
          <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm border-0 focus:ring-0 p-0"
            />
          </div>
          
          <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm border-0 focus:ring-0 p-0"
            />
          </div>
          
          {/* Guests */}
          <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Guests
            </label>
            <div className="relative" ref={guestRef}>
              <button
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                className="text-sm text-left"
              >
                {guests} guest{guests > 1 ? 's' : ''}
              </button>
            </div>
          </div>
          
          {/* Search Button */}
          <div className="p-3">
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Hero variant (default)
  return (
    <div className={`bg-white rounded-2xl shadow-2xl p-6 ${className}`}>
      {/* Booking Type Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-xs">
        <button
          onClick={() => setBookingType('daily')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            bookingType === 'daily'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Daily Stay
        </button>
        <button
          onClick={() => setBookingType('hourly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            bookingType === 'hourly'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Hourly
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="md:col-span-1" ref={locationRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              placeholder="City or hotel name"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {location && (
              <button
                onClick={() => setLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            
            {/* Location Dropdown */}
            <AnimatePresence>
              {showLocationDropdown && filteredCities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto"
                >
                  {filteredCities.map((city) => (
                    <button
                      key={`${city.city}-${city.state}`}
                      onClick={() => {
                        setLocation(city.city);
                        setShowLocationDropdown(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{city.city}</p>
                        <p className="text-xs text-gray-500">{city.state} • {city.count} properties</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {bookingType === 'daily' ? 'Check-in' : 'Date'}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (new Date(e.target.value) >= new Date(checkOut)) {
                  setCheckOut(format(addDays(new Date(e.target.value), 1), 'yyyy-MM-dd'));
                }
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Check-out (only for daily) */}
        {bookingType === 'daily' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd')}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
        
        {/* Guests */}
        <div ref={guestRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-left focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              {guests} guest{guests > 1 ? 's' : ''}
            </button>
            
            {/* Guest Dropdown */}
            <AnimatePresence>
              {showGuestDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Guests</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{guests}</span>
                      <button
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        disabled={guests >= 10}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Search Button */}
      <div className="mt-6 flex justify-center">
        <Button onClick={handleSearch} size="lg" className="px-8">
          <Search className="w-5 h-5 mr-2" />
          Search Hotels
        </Button>
      </div>
    </div>
  );
}
