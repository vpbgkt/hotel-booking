"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Testimonials data
 */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
    text: "Booked a last-minute getaway to Goa through BlueStay. The process was super smooth, and the hotel exceeded our expectations. Will definitely use again!",
    hotel: "Radhika Resort, Goa",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Delhi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    text: "The hourly booking feature is a game-changer for business travelers like me. Perfect for quick meetings or rest between flights.",
    hotel: "Urban Suites, Mumbai",
  },
  {
    id: 3,
    name: "Anita Desai",
    location: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 4,
    text: "Found amazing deals on heritage hotels in Rajasthan. The verified reviews helped us make the right choice. Great experience overall!",
    hotel: "Royal Palace, Jaipur",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Pune",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    rating: 5,
    text: "Best prices compared to other platforms. Saved about 30% on my Kerala trip. Customer support was very helpful when I needed to modify my booking.",
    hotel: "Beachside Villa, Kerala",
  },
];

/**
 * Testimonials Section
 * 
 * Carousel of guest reviews with
 * avatar, rating, and hotel info
 */
export function Testimonials() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  return (
    <section className="section overflow-hidden">
      <div className="container-app">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-brand-600 font-medium text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            What Our Guests Say
          </h2>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-200 transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-200 transition-colors z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {TESTIMONIALS.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100">
                    {/* Quote Icon */}
                    <Quote
                      size={40}
                      className="text-brand-100 mb-4"
                    />

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={cn(
                            i < testimonial.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.location} • {testimonial.hotel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "bg-brand-600 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
