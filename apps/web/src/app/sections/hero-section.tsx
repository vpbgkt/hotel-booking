"use client";

import { motion } from "framer-motion";
import { HeroSearch } from "@/components/booking/hero-search";

/**
 * Hero Section
 * 
 * Full-width hero with:
 * - Gradient background with subtle pattern
 * - Animated headline
 * - Search widget
 * - Trust badges
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative container-app py-16 lg:py-24">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="block text-accent-400">Stay in India</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Book directly with hotels for the best prices. Compare rooms, read
            genuine reviews, and get instant confirmation.
          </p>
        </motion.div>

        {/* Search Widget */}
        <HeroSearch />

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-10"
        >
          <TrustBadge number="50,000+" label="Happy Guests" />
          <TrustBadge number="500+" label="Partner Hotels" />
          <TrustBadge number="4.8" label="Average Rating" />
          <TrustBadge number="24/7" label="Support" />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Trust Badge Component
 */
function TrustBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-white">{number}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
}
