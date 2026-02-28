"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CTA Section
 * 
 * Call-to-action for hotel partners
 * Highlights benefits of listing on BlueStay
 */
export function CTASection() {
  return (
    <section className="section bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-4">
              <Building2 size={14} />
              For Hotel Partners
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              List Your Property on BlueStay
            </h2>
            
            <p className="text-lg text-white/80 mb-8">
              Join hundreds of successful hotels and resorts. Reach thousands of
              travelers and grow your business with our powerful booking platform.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <Benefit
                icon={TrendingUp}
                title="Increase Bookings"
                description="Get visibility to thousands of travelers searching for hotels"
              />
              <Benefit
                icon={Users}
                title="Own Your Customers"
                description="Direct access to guest data and relationship"
              />
              <Benefit
                icon={Building2}
                title="Your Own Website"
                description="Get a professional booking website on your domain"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="xl"
                variant="accent"
                className="shadow-lg shadow-accent-500/25"
                asChild
              >
                <Link href="/for-hotels">
                  List Your Property
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">
                Why Hotels Choose BlueStay
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <StatCard number="8-15%" label="Commission Only" subtext="vs 25% on other platforms" />
                <StatCard number="500+" label="Partner Hotels" subtext="and growing" />
                <StatCard number="50K+" label="Monthly Bookings" subtext="across India" />
                <StatCard number="24/7" label="Partner Support" subtext="dedicated team" />
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/70 text-sm">
                  No upfront costs. No lock-in contracts. Start listing today.
                </p>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              className="absolute -top-4 -right-4 bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Join Free
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Benefit Item
 */
function Benefit({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-accent-400" />
      </div>
      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  );
}

/**
 * Stat Card
 */
function StatCard({
  number,
  label,
  subtext,
}: {
  number: string;
  label: string;
  subtext: string;
}) {
  return (
    <div>
      <div className="text-3xl font-bold text-white">{number}</div>
      <div className="text-white/90 font-medium">{label}</div>
      <div className="text-sm text-white/60">{subtext}</div>
    </div>
  );
}
