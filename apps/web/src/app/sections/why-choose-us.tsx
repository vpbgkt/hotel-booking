"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Wallet,
  Clock,
  Headphones,
  BadgePercent,
  Smartphone,
} from "lucide-react";

/**
 * Features data
 */
const FEATURES = [
  {
    icon: Wallet,
    title: "Best Price Guaranteed",
    description:
      "Book directly with hotels and get the lowest prices. No hidden fees or commissions added.",
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    icon: ShieldCheck,
    title: "Verified Hotels",
    description:
      "All our partner hotels are personally verified for quality, cleanliness, and service standards.",
    color: "text-brand-500",
    bgColor: "bg-brand-100",
  },
  {
    icon: Clock,
    title: "Hourly Bookings",
    description:
      "Need a room for a few hours? Many of our hotels offer flexible hourly booking options.",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our customer support team is available round the clock to help with any booking issues.",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    icon: BadgePercent,
    title: "Exclusive Deals",
    description:
      "Get access to member-only discounts and special offers on hotels across India.",
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    icon: Smartphone,
    title: "Easy Mobile Booking",
    description:
      "Book on the go with our mobile-optimized website. Add to home screen for app-like experience.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100",
  },
];

/**
 * Why Choose Us Section
 * 
 * Feature highlights with icons and descriptions
 */
export function WhyChooseUs() {
  return (
    <section className="section bg-gray-50">
      <div className="container-app">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-brand-600 font-medium text-sm uppercase tracking-wider">
            Why BlueStay
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Why Guests Love Us
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            We&apos;re committed to making your travel experience seamless and
            memorable
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
