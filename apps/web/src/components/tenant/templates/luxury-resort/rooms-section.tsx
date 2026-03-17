'use client';

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
