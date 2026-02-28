import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "./sections/hero-section";
import { FeaturedHotels } from "./sections/featured-hotels";
import { PopularDestinations } from "./sections/popular-destinations";
import { WhyChooseUs } from "./sections/why-choose-us";
import { Testimonials } from "./sections/testimonials";
import { CTASection } from "./sections/cta-section";

/**
 * Homepage Metadata for SEO
 */
export const metadata: Metadata = {
  title: "BlueStay - Book Hotels Across India | Best Prices Guaranteed",
  description:
    "Discover and book the best hotels across India at the lowest prices. Compare rooms, read reviews, and book directly with hotels. Free cancellation on most bookings.",
  keywords: [
    "hotels in india",
    "book hotels",
    "best hotel prices",
    "hotel booking",
    "resorts",
    "budget hotels",
    "luxury hotels",
  ],
  openGraph: {
    title: "BlueStay - Book Hotels Across India | Best Prices Guaranteed",
    description:
      "Discover and book the best hotels across India at the lowest prices. Compare rooms, read reviews, and book directly with hotels.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BlueStay - Book Hotels Across India",
      },
    ],
  },
};

/**
 * Homepage Component
 * 
 * BlueStay Aggregator main landing page featuring:
 * - Hero section with search widget
 * - Featured hotels carousel
 * - Popular destinations grid
 * - Why choose us section
 * - Testimonials
 * - CTA for hotel partners
 */
export default function HomePage() {
  return (
    <>
      <Header />
      
      <main>
        {/* Hero with search */}
        <HeroSection />
        
        {/* Featured Hotels */}
        <FeaturedHotels />
        
        {/* Popular Destinations */}
        <PopularDestinations />
        
        {/* Why Choose BlueStay */}
        <WhyChooseUs />
        
        {/* Guest Testimonials */}
        <Testimonials />
        
        {/* Partner CTA */}
        <CTASection />
      </main>
      
      <Footer />
    </>
  );
}
