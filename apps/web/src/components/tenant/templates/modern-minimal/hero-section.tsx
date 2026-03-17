'use client';

import Image from 'next/image';
import { Star, MapPin, Shield, Award } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import type { HeroSectionProps } from '../types';
import { SearchWidget } from '../shared/search-widget';

export function ModernMinimalHero({
  hotel, theme,
  checkIn, checkOut, guests,
  onCheckInChange, onCheckOutChange, onGuestsChange,
}: HeroSectionProps) {
  const heroImg = sanitizeImageUrl(hotel.heroImageUrl);

  return (
    <>
      <section className="relative w-full min-h-screen bg-black text-white flex flex-col justify-end pt-32 pb-24 px-8 md:px-16 lg:px-32">
        <div className="absolute inset-x-0 top-0 h-[60vh] md:h-[70vh] bg-zinc-900 border-b-8 border-white">
          {heroImg && (
            <Image
              src={heroImg}
              alt={sanitizeText(hotel.name)}
              fill
              className="object-cover grayscale contrast-125 rounded-none"
              priority
            />
          )}
        </div>
        
        <div className="relative z-10 w-full mt-[50vh] md:mt-[60vh] bg-black p-8 md:p-16 border-l-8 border-white">
          {hotel.isVerified && (
            <div className="mb-8 inline-block bg-white text-black px-4 py-2 text-2xl font-bold tracking-tighter uppercase rounded-none">
              <Shield className="inline w-6 h-6 mr-2" /> Verified
            </div>
          )}

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-none mb-8 break-words rounded-none">
            {sanitizeText(hotel.name)}
          </h1>

          {hotel.tagline && (
            <p className="text-2xl md:text-4xl font-bold tracking-tighter text-zinc-400 mb-12 uppercase max-w-4xl rounded-none">
              {sanitizeText(hotel.tagline)}
            </p>
          )}

          <div className="flex flex-col md:flex-row md:items-center gap-8 text-xl font-bold tracking-tighter uppercase rounded-none">
            <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-none">
              <Star className="w-6 h-6 fill-black" /> {hotel.starRating} STARS
            </div>
            {hotel.averageRating && (
              <span className="flex items-center gap-2 border-2 border-white px-4 py-2 rounded-none">
                <Award className="w-6 h-6" />
                {hotel.averageRating.toFixed(1)} / {hotel.reviewCount} REVS
              </span>
            )}
            <span className="flex items-center gap-2 border-2 border-white px-4 py-2 rounded-none">
              <MapPin className="w-6 h-6" />
              {sanitizeText(hotel.city)}
            </span>
          </div>

          {hotel.startingPrice && (
            <div className="mt-16 text-5xl md:text-7xl font-black tracking-tighter rounded-none">
              ₹{hotel.startingPrice.toLocaleString('en-IN')} <span className="text-2xl text-zinc-500 uppercase">/ night</span>
            </div>
          )}
        </div>
      </section>

      <section className="w-full bg-white text-black border-t-8 border-black p-8 md:p-16 relative z-20 rounded-none">
        <div className="max-w-7xl mx-auto rounded-none">
          <SearchWidget
            theme={theme}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsChange={onGuestsChange}
            variant="minimal"
          />
        </div>
      </section>
    </>
  );
}
