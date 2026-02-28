import type { NextConfig } from "next";

/**
 * Next.js configuration for BlueStay web application
 * Supports multi-tenant architecture with dynamic domain-based routing
 */
const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Standalone output for Docker deployment
  output: "standalone",

  // Transpile shared packages from monorepo
  transpilePackages: ["@bluestay/ui", "@bluestay/types", "@bluestay/utils"],

  // Image optimization configuration
  images: {
    // Allow images from CDN and hotel domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bluestay.in",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.bluestay.in",
      },
    ],
    // Modern image formats for better compression
    formats: ["image/avif", "image/webp"],
  },

  // Enable experimental features
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
