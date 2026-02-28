import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * BlueStay Multi-Tenant Middleware
 * 
 * This middleware handles domain-based tenant resolution:
 * - bluestay.in → Aggregator view (all hotels)
 * - radhikaresort.in → Hotel tenant view (single hotel)
 * 
 * The middleware extracts the hotel ID from the domain and passes it
 * to the application via headers, allowing us to serve different content
 * from the same codebase.
 */

// Aggregator domains that show all hotels
const AGGREGATOR_DOMAINS = [
  "bluestay.in",
  "www.bluestay.in",
  "localhost",
  "127.0.0.1",
];

// Known hotel domains mapped to their hotel IDs
// In production, this will be fetched from Redis cache
const HOTEL_DOMAIN_MAP: Record<string, string> = {
  "radhikaresort.in": "radhika-resort",
  "www.radhikaresort.in": "radhika-resort",
  // Add more hotel domains here as they onboard
};

/**
 * Check if the hostname is an aggregator domain
 */
function isAggregatorDomain(hostname: string): boolean {
  // Remove port number if present
  const host = hostname.split(":")[0];
  return AGGREGATOR_DOMAINS.includes(host);
}

/**
 * Get hotel ID from domain
 * Returns null if it's an aggregator domain
 */
function getHotelIdFromDomain(hostname: string): string | null {
  const host = hostname.split(":")[0];
  
  // Check direct domain mapping
  if (HOTEL_DOMAIN_MAP[host]) {
    return HOTEL_DOMAIN_MAP[host];
  }
  
  // Check for subdomain pattern (e.g., radhika.bluestay.in)
  const parts = host.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const baseDomain = parts.slice(-2).join(".");
    if (baseDomain === "bluestay.in" && subdomain !== "www") {
      return subdomain;
    }
  }
  
  return null;
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "localhost:3000";
  const url = request.nextUrl.clone();
  
  // Skip middleware for static files and API routes
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".") // Static files have extensions
  ) {
    return NextResponse.next();
  }
  
  // Create response headers to pass tenant context
  const requestHeaders = new Headers(request.headers);
  
  // Determine if this is aggregator or hotel tenant
  if (isAggregatorDomain(hostname)) {
    // Aggregator mode - show all hotels
    requestHeaders.set("x-tenant-type", "aggregator");
    requestHeaders.set("x-tenant-id", "bluestay");
    
    // Rewrite to aggregator routes
    // Routes starting with (aggregator) are for the main BlueStay site
    if (!url.pathname.startsWith("/platform-admin")) {
      // Continue to aggregator pages
    }
  } else {
    // Hotel tenant mode - show single hotel
    const hotelId = getHotelIdFromDomain(hostname);
    
    if (hotelId) {
      requestHeaders.set("x-tenant-type", "hotel");
      requestHeaders.set("x-tenant-id", hotelId);
      requestHeaders.set("x-hotel-domain", hostname);
    } else {
      // Unknown domain - redirect to aggregator or show error
      // For now, treat as aggregator
      requestHeaders.set("x-tenant-type", "aggregator");
      requestHeaders.set("x-tenant-id", "bluestay");
    }
  }
  
  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure which paths the middleware runs on
 * We run on all paths except static files and API
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
