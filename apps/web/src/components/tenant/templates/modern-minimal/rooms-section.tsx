'use client';

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
