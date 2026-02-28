"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

/**
 * Popular destinations data
 */
const DESTINATIONS = [
  {
    name: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
    hotelCount: 120,
    slug: "goa",
  },
  {
    name: "Jaipur",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80",
    hotelCount: 85,
    slug: "jaipur",
  },
  {
    name: "Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
    hotelCount: 95,
    slug: "kerala",
  },
  {
    name: "Udaipur",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
    hotelCount: 60,
    slug: "udaipur",
  },
  {
    name: "Manali",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80",
    hotelCount: 70,
    slug: "manali",
  },
  {
    name: "Mumbai",
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&q=80",
    hotelCount: 150,
    slug: "mumbai",
  },
];

/**
 * Popular Destinations Section
 * 
 * Grid of popular travel destinations with
 * background images and hotel counts
 */
export function PopularDestinations() {
  return (
    <section className="section">
      <div className="container-app">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-brand-600 font-medium text-sm uppercase tracking-wider">
            Explore India
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Popular Destinations
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            Find the perfect getaway in India&apos;s most loved travel destinations
          </p>
        </motion.div>

        {/* Destinations Grid - Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {DESTINATIONS.map((destination, index) => (
            <motion.div
              key={destination.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${index === 0 || index === 3 ? "md:col-span-2 md:row-span-2" : ""}
              `}
            >
              <Link
                href={`/hotels/${destination.slug}`}
                className="group relative block overflow-hidden rounded-2xl aspect-[4/3] md:aspect-auto md:h-full min-h-[200px]"
              >
                {/* Background Image */}
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-1 text-white/80 text-sm mb-1">
                    <MapPin size={14} />
                    <span>{destination.hotelCount} Hotels</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">
                    {destination.name}
                  </h3>
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
