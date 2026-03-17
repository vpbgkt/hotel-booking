'use client';

import Image from 'next/image';
import { Star, MapPin, Shield, Award } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { SearchWidget } from '../shared/search-widget';
import type { HeroSectionProps } from '../types';

export function LuxuryResortHero({
  hotel, theme,
  checkIn, checkOut, guests,
  onCheckInChange, onCheckOutChange, onGuestsChange,
}: HeroSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#d4af37');
  const heroImg = sanitizeImageUrl(hotel.heroImageUrl);

  return (
    <>
      <section className="relative w-full min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-serif text-amber-50 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-zinc-950">
          {heroImg && (
            <Image
              src={heroImg}
              alt={sanitizeText(hotel.name)}
              fill
              className="object-cover opacity-40 scale-105 hover:scale-100 transition-transform duration-[20s] ease-out"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/20 to-zinc-950" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32 flex flex-col items-center text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl transition-all duration-1000">
          {hotel.isVerified && (
            <div className="flex items-center gap-3 mb-12 text-sm md:text-base tracking-[0.4em] uppercase text-amber-200/80 font-light">
              <Shield className="w-5 h-5" />
              <span>Verified Exclusive</span>
            </div>
          )}

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-wide leading-tight mb-8" style={{ color: accent, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            {sanitizeText(hotel.name)}
          </h1>

          {hotel.tagline && (
            <p className="text-xl md:text-3xl text-zinc-300 font-light max-w-3xl mb-16 italic tracking-wider leading-relaxed">
              {sanitizeText(hotel.tagline)}
            </p>
          )}

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 text-lg tracking-widest text-zinc-400 font-light uppercase border-y border-white/10 py-8 mb-16 w-full justify-center">
            <div className="flex items-center gap-3">
              <span className="flex">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </span>
            </div>
            {hotel.averageRating && (
              <span className="flex items-center gap-3 hover:text-amber-200 transition-colors">
                <Award className="w-5 h-5" />
                {hotel.averageRating.toFixed(1)} <span className="text-zinc-600">({hotel.reviewCount})</span>
              </span>
            )}
            <span className="flex items-center gap-3 hover:text-amber-200 transition-colors">
              <MapPin className="w-5 h-5" />
              {sanitizeText(hotel.city)}
            </span>
          </div>

          {hotel.startingPrice && (
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm tracking-[0.3em] uppercase text-zinc-500">Starting from</span>
              <div className="text-5xl md:text-6xl font-light tracking-wider" style={{ color: accent }}>
                ₹{hotel.startingPrice.toLocaleString('en-IN')}
                <span className="text-xl text-zinc-500 ml-4 font-sans tracking-normal">/ night</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative z-20 -mt-24 px-6 mb-32 bg-zinc-950/20">
        <div className="max-w-5xl mx-auto backdrop-blur-2xl bg-zinc-950/60 border border-white/10 p-2 shadow-2xl">
          <SearchWidget
            theme={theme}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsChange={onGuestsChange}
            variant="luxury"
          />
        </div>
      </section>
    </>
  );
}
