'use client';

import Image from 'next/image';
import { Star, MapPin, Shield, Award } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { SearchWidget } from '../shared/search-widget';
import type { HeroSectionProps } from '../types';

export function HeritageBoutiqueHero({
  hotel, theme,
  checkIn, checkOut, guests,
  onCheckInChange, onCheckOutChange, onGuestsChange,
}: HeroSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#8B4513');
  const heroImg = sanitizeImageUrl(hotel.heroImageUrl);

  return (
    <>
      <section className="relative w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center font-serif text-stone-900 border-[16px] md:border-[32px] border-double border-stone-300 p-8">
        <div className="absolute inset-0 z-0 m-4 md:m-8 border border-stone-300 opacity-50 bg-stone-50" />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center px-4 py-24">
          
          <div className="mb-12 flex flex-col items-center opacity-80 w-full">
            <div className="w-32 h-px bg-stone-400 mb-2 max-w-full"></div>
            <div className="w-16 h-px bg-stone-400"></div>
          </div>

          {hotel.isVerified && (
            <div className="flex items-center gap-3 mb-10 text-sm md:text-base tracking-[0.3em] uppercase text-stone-500 w-full justify-center">
              <Shield className="w-5 h-5" />
              <span>Timeless Heritage</span>
            </div>
          )}

          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-normal tracking-tight leading-[0.9] mb-12 text-stone-800 break-words" style={{ color: accent }}>
            {sanitizeText(hotel.name)}
          </h1>

          {hotel.tagline && (
            <div className="relative mb-20 px-8 w-full">
              <span className="absolute -top-8 -left-4 text-6xl text-stone-300">{"""}</span>
              <p className="text-2xl md:text-4xl text-stone-600 italic tracking-wide leading-relaxed max-w-3xl mx-auto break-words">
                {sanitizeText(hotel.tagline)}
              </p>
              <span className="absolute -bottom-16 -right-4 text-6xl text-stone-300">{"""}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-lg tracking-widest text-stone-500 uppercase py-6 border-y-2 border-double border-stone-300 w-full max-w-4xl mb-20">
            <span className="flex items-center gap-2">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-stone-400 text-stone-400" />
              ))}
            </span>
            {hotel.averageRating && (
              <span className="flex items-center gap-3">
                <Award className="w-5 h-5" />
                {hotel.averageRating.toFixed(1)} <span className="text-stone-400">({hotel.reviewCount})</span>
              </span>
            )}
            <span className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              {sanitizeText(hotel.city)}
            </span>
          </div>

          <div className="relative w-full max-w-4xl aspect-[21/9] rounded-t-full overflow-hidden border-8 border-stone-200 shadow-xl mb-20">
            {heroImg ? (
              <Image
                src={heroImg}
                alt={sanitizeText(hotel.name)}
                fill
                className="object-cover sepia-[0.3] hover:sepia-0 transition-all duration-1000"
                priority
              />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
          </div>

          {hotel.startingPrice && (
            <div className="flex flex-col items-center gap-6 bg-stone-100 px-16 py-10 border border-stone-300 w-full max-w-xl">
              <span className="text-sm tracking-[0.4em] uppercase text-stone-500 border-b border-stone-300 pb-2 break-words">Tariff Begins At</span>
              <div className="text-6xl md:text-7xl font-light text-stone-800 break-words">
                ₹{hotel.startingPrice.toLocaleString('en-IN')}
                <span className="block text-center text-lg text-stone-500 mt-4 italic">per evening</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative z-20 -mt-12 max-w-6xl mx-auto px-6 mb-32 bg-stone-50">
        <div className="bg-stone-50 p-6 border-4 border-double border-stone-300 shadow-2xl">
          <SearchWidget
            theme={theme}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsChange={onGuestsChange}
            variant="default"
          />
        </div>
      </section>
    </>
  );
}
