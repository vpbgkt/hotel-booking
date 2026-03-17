'use client';

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
