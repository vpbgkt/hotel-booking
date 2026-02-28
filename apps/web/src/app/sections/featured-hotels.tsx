"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HotelCard } from "@/components/hotel/hotel-card";

/**
 * Mock data for featured hotels
 * In production, this will come from the API
 */
const FEATURED_HOTELS = [
  {
    id: "1",
    slug: "radhika-resort-goa",
    name: "Radhika Resort & Spa",
    location: "Calangute, Goa",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    rating: 4.7,
    reviewCount: 243,
    price: 3500,
    originalPrice: 4500,
    hasHourlyBooking: true,
    hourlyPrice: 600,
    amenities: ["wifi", "parking", "breakfast"],
    isFeatured: true,
  },
  {
    id: "2",
    slug: "taj-lakefront-udaipur",
    name: "Lakefront Heritage Hotel",
    location: "Lake Pichola, Udaipur",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    rating: 4.9,
    reviewCount: 512,
    price: 8500,
    amenities: ["wifi", "parking", "breakfast"],
    isFeatured: true,
  },
  {
    id: "3",
    slug: "mountain-view-manali",
    name: "Mountain View Resort",
    location: "Old Manali, Himachal",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    rating: 4.5,
    reviewCount: 189,
    price: 2800,
    originalPrice: 3200,
    amenities: ["wifi", "breakfast"],
    isLimitedAvailability: true,
  },
  {
    id: "4",
    slug: "beachside-villa-kerala",
    name: "Beachside Villa & Ayurveda",
    location: "Kovalam, Kerala",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    rating: 4.6,
    reviewCount: 156,
    price: 4200,
    hasHourlyBooking: true,
    hourlyPrice: 700,
    amenities: ["wifi", "parking", "breakfast"],
  },
  {
    id: "5",
    slug: "royal-palace-jaipur",
    name: "Royal Palace Heritage",
    location: "Pink City, Jaipur",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    rating: 4.8,
    reviewCount: 324,
    price: 6500,
    originalPrice: 8000,
    amenities: ["wifi", "parking", "breakfast"],
    isFeatured: true,
  },
  {
    id: "6",
    slug: "urban-suites-mumbai",
    name: "Urban Suites Mumbai",
    location: "Bandra, Mumbai",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    rating: 4.4,
    reviewCount: 98,
    price: 5500,
    hasHourlyBooking: true,
    hourlyPrice: 900,
    amenities: ["wifi", "parking"],
  },
];

/**
 * Featured Hotels Section
 * 
 * Displays a grid of featured/promoted hotels
 * with animated entrance and responsive layout
 */
export function FeaturedHotels() {
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_HOTELS.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <HotelCard {...hotel} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
