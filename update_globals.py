import os

files = {
  "apps/web/src/components/tenant/templates/modern-minimal/hero-section.tsx": """'use client';

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
""",
  "apps/web/src/components/tenant/templates/modern-minimal/rooms-section.tsx": """'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Clock, ChevronRight } from 'lucide-react';
import { sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityLabel } from '../shared/amenities';
import type { RoomsSectionProps } from '../types';

export function ModernMinimalRooms({ hotel, theme }: RoomsSectionProps) {
  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  if (activeRooms.length === 0) return null;

  return (
    <section className="w-full bg-white text-black py-32 px-8 md:px-16 lg:px-32">
      <div className="mb-24 border-b-8 border-black pb-8">
        <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none rounded-none">
          Rooms
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 md:gap-32">
        {activeRooms.map((room) => {
          const roomImg = sanitizeImageUrl(room.images?.[0]);
          return (
            <Link
              key={room.id}
              href={`/hotel/rooms/${room.id}`}
              className="group block border-8 border-black p-8 hover:bg-black hover:text-white transition-colors duration-0 rounded-none"
            >
              <div className="relative aspect-video w-full overflow-hidden border-4 border-black mb-8 group-hover:border-white rounded-none">
                {roomImg ? (
                  <Image
                    src={roomImg}
                    alt={sanitizeText(room.name)}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 rounded-none"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex items-center justify-center font-bold tracking-tighter text-2xl uppercase rounded-none">No Image</div>
                )}
                {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                  <div className="absolute top-4 left-4 bg-black text-white border-2 border-white px-4 py-2 text-xl font-bold tracking-tighter uppercase rounded-none">
                    Hourly Set
                  </div>
                )}
              </div>

              <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 leading-none break-words rounded-none">
                {sanitizeText(room.name)}
              </h3>
              
              <p className="text-xl md:text-2xl font-bold tracking-tighter mb-8 text-zinc-500 group-hover:text-zinc-300 uppercase rounded-none">
                {sanitizeText(room.description) || `CAPACITY: ${room.maxGuests}`}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <span className="border-2 border-black group-hover:border-white px-4 py-2 font-bold tracking-tighter uppercase flex items-center gap-2 rounded-none">
                  <Users className="w-6 h-6" /> {room.maxGuests} PAX
                </span>
                {room.amenities.slice(0, 3).map((a) => (
                  <span key={a} className="border-2 border-black group-hover:border-white px-4 py-2 font-bold tracking-tighter uppercase flex items-center gap-2 rounded-none">
                    {getAmenityLabel(a)}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-t-8 border-black group-hover:border-white pt-8 rounded-none">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-7xl font-black tracking-tighter rounded-none">
                    ₹{room.basePriceDaily.toLocaleString('en-IN')}
                  </span>
                  <span className="text-2xl font-bold tracking-tighter uppercase text-zinc-500 group-hover:text-zinc-300 rounded-none">
                    / night
                  </span>
                </div>
                <div className="bg-black text-white group-hover:bg-white group-hover:text-black px-8 py-4 text-2xl font-black tracking-tighter uppercase flex items-center gap-4 rounded-none">
                  VIEW <ChevronRight className="w-8 h-8" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
""",
  "apps/web/src/components/tenant/templates/luxury-resort/hero-section.tsx": """'use client';

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
""",
  "apps/web/src/components/tenant/templates/luxury-resort/rooms-section.tsx": """'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityLabel } from '../shared/amenities';
import type { RoomsSectionProps } from '../types';

export function LuxuryResortRooms({ hotel, theme }: RoomsSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#d4af37');
  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  if (activeRooms.length === 0) return null;

  return (
    <section className="py-32 bg-zinc-950 font-serif text-amber-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-32">
          <span className="text-xs tracking-[0.4em] uppercase text-amber-200/60 mb-6 font-sans">Discover</span>
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-8" style={{ color: accent }}>
            Exquisite Accommodations
          </h2>
          <div className="w-24 h-px bg-white/20"></div>
        </div>

        <div className="space-y-40">
          {activeRooms.map((room, idx) => {
            const roomImg = sanitizeImageUrl(room.images?.[0]);
            const isReversed = idx % 2 !== 0;
            return (
              <div key={room.id} className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 lg:gap-24 items-center group`}>
                <div className="w-full lg:w-1/2 relative bg-zinc-950">
                  <div className="aspect-[4/5] relative overflow-hidden border border-white/10 shadow-2xl">
                    {roomImg ? (
                      <Image
                        src={roomImg}
                        alt={sanitizeText(room.name)}
                        fill
                        className="object-cover scale-100 group-hover:scale-110 transition-transform duration-[15s] ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  </div>
                  {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                    <div className="absolute top-8 left-8 backdrop-blur-xl bg-white/10 border border-white/20 text-xs tracking-widest px-6 py-3 flex items-center gap-3 font-sans">
                      <Clock className="w-4 h-4" /> Hourly Available
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center bg-zinc-950">
                  <span className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-6 font-sans">Suite {idx + 1}</span>
                  <h3 className="text-4xl lg:text-5xl font-light tracking-wide mb-8" style={{ color: accent }}>
                    {sanitizeText(room.name)}
                  </h3>
                  <p className="text-lg lg:text-xl text-zinc-400 font-light leading-relaxed mb-12 italic tracking-wide">
                    {sanitizeText(room.description) || `Elegance and comfort uniquely tailored for up to ${room.maxGuests} distinguished guests.`}
                  </p>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-16 text-sm tracking-widest uppercase text-zinc-300 font-sans">
                    <span className="flex items-center gap-4 border-b border-white/10 pb-4">
                      <Users className="w-5 h-5 text-amber-200/60" /> Up to {room.maxGuests}
                    </span>
                    {room.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="flex items-center gap-4 border-b border-white/10 pb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-200/60" /> {getAmenityLabel(a)}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-12 mt-4 font-sans">
                    <div className="flex flex-col">
                      <span className="text-xs tracking-[0.2em] text-zinc-500 uppercase mb-2">Per Night</span>
                      <span className="text-4xl tracking-wider font-serif">₹{room.basePriceDaily.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <Link href={`/hotel/rooms/${room.id}`} className="inline-flex items-center gap-6 px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 text-sm tracking-[0.2em] uppercase origin-left hover:scale-105">
                      Reserve <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
""",
  "apps/web/src/components/tenant/templates/heritage-boutique/hero-section.tsx": """'use client';

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
              <span className="absolute -top-8 -left-4 text-6xl text-stone-300">{"\""}</span>
              <p className="text-2xl md:text-4xl text-stone-600 italic tracking-wide leading-relaxed max-w-3xl mx-auto break-words">
                {sanitizeText(hotel.tagline)}
              </p>
              <span className="absolute -bottom-16 -right-4 text-6xl text-stone-300">{"\""}</span>
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
""",
  "apps/web/src/components/tenant/templates/heritage-boutique/rooms-section.tsx": """'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityLabel } from '../shared/amenities';
import type { RoomsSectionProps } from '../types';

export function HeritageBoutiqueRooms({ hotel, theme }: RoomsSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#8B4513');
  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  if (activeRooms.length === 0) return null;

  return (
    <section className="py-32 bg-stone-50 font-serif border-[16px] md:border-[32px] border-double border-stone-300 border-t-0 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col items-center text-center mb-24 w-full">
          <div className="flex items-center gap-6 mb-8 text-stone-400 justify-center">
            <div className="w-24 h-px bg-stone-300"></div>
            <span className="text-2xl">♦</span>
            <div className="w-24 h-px bg-stone-300"></div>
          </div>
          <h2 className="text-5xl md:text-7xl font-normal text-stone-800 mb-8 break-words" style={{ color: accent }}>
            Chambers & Suites
          </h2>
          <p className="text-xl md:text-2xl text-stone-500 italic max-w-2xl mx-auto leading-relaxed break-words">
            Every room narrates a tale of a bygone era, preserving classic charm meticulously interlaced with modern comforts.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 md:gap-24 bg-stone-50">
          {activeRooms.map((room) => {
            const roomImg = sanitizeImageUrl(room.images?.[0]);
            return (
              <div key={room.id} className="group flex flex-col bg-stone-100 border-x border-b border-stone-300 relative pt-12 min-h-[600px]">
                <div className="absolute top-0 left-0 right-0 h-3 bg-stone-300 stripe-pattern"></div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-50 border border-stone-300 px-8 py-3 text-sm tracking-[0.3em] uppercase text-stone-600 shadow-sm whitespace-nowrap">
                  {room.maxGuests} Guests
                </div>

                <div className="px-8 md:px-12 pt-8 pb-12 flex-grow flex flex-col items-center text-center bg-stone-100">
                  <h3 className="text-4xl text-stone-800 mb-6 border-b border-stone-300 pb-6 w-full break-words" style={{ color: accent }}>
                    {sanitizeText(room.name)}
                  </h3>
                  
                  <p className="text-lg text-stone-600 italic mb-10 flex-grow break-words w-full">
                    {sanitizeText(room.description) || `Experience timeless elegance crafted for your utmost comfort.`}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm tracking-widest uppercase text-stone-500 w-full">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="border border-stone-300 px-4 py-2 bg-stone-50 whitespace-nowrap">
                        {getAmenityLabel(a)}
                      </span>
                    ))}
                  </div>

                  <div className="w-full relative aspect-square md:aspect-[4/3] mb-12 border-8 border-stone-200 shadow-inner overflow-hidden p-2 bg-stone-50 rounded-full">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-200">
                      {roomImg ? (
                        <Image
                          src={roomImg}
                          alt={sanitizeText(room.name)}
                          fill
                          className="object-cover sepia-[0.2] group-hover:sepia-0 group-hover:scale-110 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200" />
                      )}
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center gap-8 pt-8 border-t border-dashed border-stone-400">
                    <div className="flex flex-col items-center w-full">
                      <span className="text-sm tracking-[0.2em] text-stone-500 uppercase mb-2 break-words">Nightly Rate</span>
                      <span className="text-5xl text-stone-800 break-words">₹{room.basePriceDaily.toLocaleString('en-IN')}</span>
                    </div>

                    <Link href={`/hotel/rooms/${room.id}`} className="inline-flex items-center justify-center w-full py-6 bg-stone-800 text-stone-50 hover:bg-stone-900 border border-stone-900 transition-colors text-sm tracking-[0.3em] uppercase whitespace-nowrap">
                      Inspect Details <ArrowRight className="w-5 h-5 ml-4" />
                    </Link>
                  </div>
                </div>

                {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                  <div className="absolute top-16 left-8 bg-stone-50 border border-stone-300 px-4 py-2 text-xs tracking-widest uppercase flex items-center gap-2 text-stone-600 shadow-md transform -rotate-2 whitespace-nowrap">
                    <Clock className="w-4 h-4" /> Hourly
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)
print("done")
