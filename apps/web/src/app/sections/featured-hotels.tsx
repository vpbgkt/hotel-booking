"use client";

/**
 * Featured Hotels Section
 * Fetches and displays featured hotels from the API
 */

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { HotelCard } from "@/components/hotel/hotel-card";
import { GET_FEATURED_HOTELS } from "@/lib/graphql/queries/hotels";

/**
 * Featured Hotels Section
 * 
 * Displays a grid of featured/promoted hotels
 * with animated entrance and responsive layout.
 * Data fetched from the API via GET_FEATURED_HOTELS query.
 */
export function FeaturedHotels() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading } = useQuery<any>(GET_FEATURED_HOTELS, {
    variables: { limit: 6 },
  });

  const hotels = data?.featuredHotels || [];

  return (
    <section className="section bg-gray-50">
      <div className="container-app">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-600 font-medium text-sm uppercase tracking-wider">
              Hand-Picked
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Featured Hotels
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Discover our carefully selected properties offering exceptional
              experiences and unbeatable value.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" asChild>
              <Link href="/hotels" className="gap-2">
                View All Hotels
                <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Hotels Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel: {
              id: string;
              slug: string;
              name: string;
              city: string;
              state: string;
              heroImageUrl?: string;
              starRating: number;
              averageRating?: number;
              reviewCount?: number;
              startingPrice: number;
              bookingModel: string;
              isFeatured?: boolean;
            }, index: number) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <HotelCard
                  id={hotel.id}
                  slug={hotel.slug}
                  name={hotel.name}
                  location={`${hotel.city}, ${hotel.state}`}
                  image={hotel.heroImageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                  rating={hotel.averageRating || hotel.starRating}
                  reviewCount={hotel.reviewCount || 0}
                  price={hotel.startingPrice || 0}
                  hasHourlyBooking={hotel.bookingModel === 'HOURLY' || hotel.bookingModel === 'BOTH'}
                  isFeatured={hotel.isFeatured}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No featured hotels available right now.</p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/hotels">Browse All Hotels</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
