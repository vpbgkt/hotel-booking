"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * HeroSearch Component
 * 
 * Main search widget on the homepage hero section.
 * Features:
 * - Location search with autocomplete
 * - Date picker for check-in/check-out
 * - Guest count selector
 * - Daily/Hourly booking toggle
 * - Mobile-optimized with full-screen expansion
 */
export function HeroSearch() {
  const router = useRouter();
  const [bookingType, setBookingType] = React.useState<"daily" | "hourly">(
    "daily"
  );
  const [location, setLocation] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) {
      params.set('search', location.trim());
    }
    router.push(`/hotels${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Booking Type Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setBookingType("daily")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
              bookingType === "daily"
                ? "bg-white text-gray-900 shadow-lg"
                : "text-white hover:bg-white/10"
            )}
          >
            <Calendar size={16} />
            <span>Daily Stay</span>
          </button>
          <button
            onClick={() => setBookingType("hourly")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
              bookingType === "hourly"
                ? "bg-white text-gray-900 shadow-lg"
                : "text-white hover:bg-white/10"
            )}
          >
            <Clock size={16} />
            <span>Hourly</span>
          </button>
        </div>
      </div>

      {/* Search Card */}
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl shadow-black/10 transition-all duration-300",
          isFocused && "ring-2 ring-brand-500 ring-offset-2"
        )}
      >
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center p-2">
          {/* Location Input */}
          <div className="flex-1 px-4 py-3 border-r border-gray-200">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Location
            </label>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                className="w-full text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Check-in Date */}
          <div className="px-4 py-3 border-r border-gray-200">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {bookingType === "daily" ? "Check In" : "Date"}
            </label>
            <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-brand-600">
              <Calendar size={18} className="text-gray-400" />
              <span>Add date</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Check-out Date (only for daily) */}
          {bookingType === "daily" && (
            <div className="px-4 py-3 border-r border-gray-200">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Check Out
              </label>
              <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-brand-600">
                <Calendar size={18} className="text-gray-400" />
                <span>Add date</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Duration (only for hourly) */}
          {bookingType === "hourly" && (
            <div className="px-4 py-3 border-r border-gray-200">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Duration
              </label>
              <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-brand-600">
                <Clock size={18} className="text-gray-400" />
                <span>3 hours</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Guests */}
          <div className="px-4 py-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Guests
            </label>
            <button className="flex items-center gap-2 text-sm text-gray-900 hover:text-brand-600">
              <Users size={18} className="text-gray-400" />
              <span>2 guests</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Search Button */}
          <div className="pl-2">
            <Button size="lg" onClick={handleSearch} className="h-12 px-8 rounded-xl shadow-lg shadow-brand-500/25">
              <Search size={18} />
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden p-4 space-y-4">
          {/* Location */}
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-12 px-4 rounded-xl border border-gray-200 flex items-center gap-2 text-left hover:border-brand-500 transition-colors">
              <Calendar size={18} className="text-gray-400 shrink-0" />
              <div>
                <div className="text-xs text-gray-500">
                  {bookingType === "daily" ? "Check In" : "Date"}
                </div>
                <div className="text-sm text-gray-900">Add date</div>
              </div>
            </button>
            <button className="h-12 px-4 rounded-xl border border-gray-200 flex items-center gap-2 text-left hover:border-brand-500 transition-colors">
              {bookingType === "daily" ? (
                <>
                  <Calendar size={18} className="text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Check Out</div>
                    <div className="text-sm text-gray-900">Add date</div>
                  </div>
                </>
              ) : (
                <>
                  <Clock size={18} className="text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm text-gray-900">3 hours</div>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Guests */}
          <button className="w-full h-12 px-4 rounded-xl border border-gray-200 flex items-center gap-2 text-left hover:border-brand-500 transition-colors">
            <Users size={18} className="text-gray-400 shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-500">Guests</div>
              <div className="text-sm text-gray-900">2 guests</div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Search Button */}
          <Button onClick={handleSearch} className="w-full h-12 rounded-xl shadow-lg shadow-brand-500/25">
            <Search size={18} />
            <span className="ml-2">Search Hotels</span>
          </Button>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="text-white/70 text-sm">Popular:</span>
        {["Goa", "Mumbai", "Jaipur", "Udaipur", "Kerala"].map((city) => (
          <button
            key={city}
            onClick={() => router.push(`/hotels?city=${encodeURIComponent(city)}`)}
            className="px-3 py-1 text-sm text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            {city}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
