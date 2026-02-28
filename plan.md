

 I don't have file editing or terminal tools enabled in this session. I'll provide the complete `plan.md` content below — you can create the file by copying this, or enable editing tools and I'll write it directly.

Here's the full `plan.md`:

```markdown
# BlueStay — Multi-Tenant Hotel Booking Platform

## Complete Implementation Plan

> **Platform**: BlueStay (bluestay.in) — OYO-like hotel aggregator with white-label hotel websites
> **First Client**: Radhika Resort (radhikaresort.in)
> **Author**: [Your Name]
> **Created**: February 2026
> **Timeline**: ~36 weeks (9 months)

---

## Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [How It Works (Simple Terms)](#4-how-it-works-simple-terms)
5. [Database Schema](#5-database-schema)
6. [Booking Models (Hourly + Daily)](#6-booking-models-hourly--daily)
7. [Double-Booking Prevention](#7-double-booking-prevention)
8. [SEO Strategy](#8-seo-strategy)
9. [Mobile-First Design](#9-mobile-first-design)
10. [Payment & Commission Model](#10-payment--commission-model)
11. [Implementation Phases](#11-implementation-phases)
12. [Cost Estimates](#12-cost-estimates)
13. [Open-Source References](#13-open-source-references)
14. [Verification & Testing](#14-verification--testing)
15. [Key Decisions Log](#15-key-decisions-log)

---

## 1. Vision & Goals

### What We're Building

A centralized hotel booking platform with two faces:

1. **BlueStay Aggregator** (bluestay.in) — Lists all partner hotels. Customers search, compare, and book. BlueStay earns commission per booking.

2. **White-Label Hotel Websites** (e.g., radhikaresort.in) — Each hotel gets their own professional booking website on their own domain. They manage rooms, pricing, and bookings independently.

### Core Requirements

| # | Requirement | Solution |
|---|---|---|
| 1 | Each hotel gets own website on own domain | Multi-tenant Next.js app with domain-based tenant resolution |
| 2 | Hotels manage rooms, pricing, bookings | Admin panel at hotel-domain.com/admin |
| 3 | Room data syncs automatically with aggregator | Single database — no sync needed, both read same data |
| 4 | Central platform lists all hotels + takes commission | BlueStay aggregator + Razorpay Route / Stripe Connect |
| 5 | No double bookings | Redis locks + PostgreSQL transactions |
| 6 | Secure payments | Razorpay (India) + Stripe (Global), PCI-compliant |
| 7 | SEO friendly | Next.js SSR, JSON-LD, sitemaps, per-page meta |
| 8 | Scalable for many hotels | Multi-tenant architecture, single codebase |
| 9 | Hourly AND daily booking support | Configurable per hotel with slot-based inventory |
| 10 | Mobile-first, professional design | Tailwind CSS + shadcn/ui + PWA + Framer Motion |

### Why This Beats OYO

| Aspect | OYO | BlueStay |
|---|---|---|
| Commission | 18-25% | 8-15% (configurable) |
| Hotel owns domain | No (oyo.com/hotel-name) | Yes (radhikaresort.in) |
| Hotel owns data | No | Yes (export anytime) |
| Custom branding | Limited | Full (colors, logo, fonts, theme) |
| Direct bookings | OYO intercepts | Hotel keeps 100% on their domain |
| Pricing control | OYO decides | Hotel decides |
| Page speed | 3-5 seconds | <1 second |
| Hourly booking | Limited | Full support |
| SEO | Shared domain authority | Each hotel builds own authority |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                CENTRAL DATABASE (PostgreSQL)              │
│  hotels | rooms | room_inventory | bookings | payments   │
│  users | reviews | commissions | seo_meta | media        │
└──────────────────┬───────────────────────────────────────┘
                   │
          ┌────────▼─────────┐
          │   CENTRAL API    │
          │   (NestJS +      │
          │    GraphQL)      │
          │                  │
          │  api.bluestay.in │
          └──┬──────────┬────┘
             │          │
    ┌────────▼──┐  ┌────▼──────────────────┐
    │ Next.js   │  │ Next.js               │
    │ App       │  │ App                   │
    │           │  │                       │
    │ Resolved  │  │ Resolved as           │
    │ as        │  │ bluestay.in           │
    │ hotel     │  │ (Aggregator)          │
    │ tenant    │  │                       │
    │           │  │ Lists ALL hotels      │
    │ radhika   │  │ Search + Book + Pay   │
    │ resort.in │  │                       │
    └───────────┘  └───────────────────────┘

    Same Next.js codebase — middleware reads domain,
    decides whether to show hotel tenant view or aggregator view.
```

### Key Insight

**One database = zero sync issues.** The white-label hotel site and BlueStay aggregator are just two different "windows" into the same data. When a room is booked on radhikaresort.in, it's instantly unavailable on bluestay.in — because they read from the same `room_inventory` table.

### Domain Routing Flow

```
Customer visits radhikaresort.in
  → DNS points to VPS IP
  → Nginx receives request
  → Routes to Next.js app (port 3000)
  → Next.js middleware reads hostname: "radhikaresort.in"
  → Queries Redis cache: radhikaresort.in → hotelId: "radhika-resort"
  → Sets x-hotel-id header
  → Renders hotel tenant view (only Radhika Resort data)
  → Customer sees radhikaresort.in in browser (doesn't know it's multi-tenant)

Customer visits bluestay.in
  → Same flow, but middleware detects it's the aggregator domain
  → Renders aggregator view (all hotels)
```

### DNS & SEO Impact

**DNS pointing to your VPS has ZERO negative SEO impact.** Google does not care who owns the server. What matters:
- Page speed (Next.js SSR = fast)
- Mobile friendliness (Tailwind responsive)
- SSL certificate (Let's Encrypt free)
- Unique content (each hotel has unique data)
- Structured data (JSON-LD for Hotel schema)
- Domain authority (radhikaresort.in builds its own)

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | SSR, ISR, React Server Components, Metadata API |
| React | 19 | UI library with Server Components |
| TypeScript | 5.x | Type safety across entire codebase |
| Tailwind CSS | v4 | Utility-first styling, mobile-first responsive |
| shadcn/ui | Latest | Pre-built accessible components (dialogs, calendars, forms) |
| Framer Motion | Latest | Smooth animations, page transitions, gestures |
| React Hook Form | Latest | Performant forms with validation |
| Zod | Latest | Schema validation (shared between frontend + API) |
| Zustand | Latest | Lightweight state management |
| Mapbox GL JS | Latest | Interactive maps for hotel locations |
| next-pwa | Latest | Progressive Web App (installable, offline support) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| NestJS | 10 | Modular API framework with guards, interceptors, pipes |
| GraphQL (Apollo) | Latest | Efficient data fetching (clients request only what they need) |
| Prisma | 6 | Type-safe ORM, auto migrations, query builder |
| PostgreSQL | 16 | Primary database (relational integrity for bookings) |
| Redis | 7 | Cache, session store, inventory locks, rate limiting |
| BullMQ | Latest | Background job queue (emails, invoices, analytics) |
| Passport.js | Latest | Authentication (JWT + OAuth + OTP) |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerized deployment |
| Nginx (with HTTP/3) | Reverse proxy, SSL, domain routing |
| Let's Encrypt (Certbot) | Free auto-renewing SSL certificates |
| Cloudflare (free tier) | CDN, DDoS protection, DNS management |
| Cloudflare R2 | Object storage for images (free egress) |
| Typesense | Self-hosted search engine (hotel/room search) |
| Resend | Transactional emails (booking confirmations) |
| MSG91 / Twilio | WhatsApp + SMS notifications (India / Global) |
| Sentry | Error tracking |
| Axiom / Pino | Logging |
| BetterStack / Uptime Kuma | Uptime monitoring |
| GitHub Actions | CI/CD pipeline |

### Monorepo Structure (Turborepo)

```
hotel-booking/
├── apps/
│   ├── web/                    # Next.js 15 (hotel sites + aggregator)
│   │   ├── app/
│   │   │   ├── (aggregator)/   # bluestay.in routes
│   │   │   │   ├── page.tsx    # Aggregator homepage
│   │   │   │   ├── search/     # Hotel search
│   │   │   │   └── hotel/[slug]/ # Hotel detail on aggregator
│   │   │   ├── (hotel)/        # White-label hotel routes
│   │   │   │   ├── page.tsx    # Hotel homepage
│   │   │   │   ├── rooms/      # Room listing
│   │   │   │   ├── booking/    # Booking flow
│   │   │   │   └── admin/      # Hotel admin panel
│   │   │   └── layout.tsx
│   │   ├── middleware.ts       # Domain → tenant resolution
│   │   └── next.config.ts
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── hotel/      # Hotel CRUD, settings
│       │   │   ├── room/       # Room types, rooms, inventory
│       │   │   ├── booking/    # Booking engine (hourly + daily)
│       │   │   ├── payment/    # Razorpay + Stripe adapters
│       │   │   ├── auth/       # JWT, OTP, OAuth
│       │   │   ├── user/       # Guest + admin users
│       │   │   ├── review/     # Guest reviews
│       │   │   ├── search/     # Typesense integration
│       │   │   ├── media/      # Image upload + CDN
│       │   │   ├── commission/ # Platform commission engine
│       │   │   ├── analytics/  # Reporting + dashboards
│       │   │   ├── notification/ # Email, SMS, WhatsApp, push
│       │   │   └── seo/        # Meta tags, sitemaps, JSON-LD
│       │   ├── common/
│       │   │   ├── guards/     # Auth guard, tenant guard, role guard
│       │   │   ├── interceptors/ # Tenant context, logging
│       │   │   ├── decorators/ # @CurrentHotel(), @CurrentUser()
│       │   │   └── filters/    # Exception filters
│       │   └── main.ts
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
│
├── packages/
│   ├── ui/                     # Shared React components
│   ├── types/                  # Shared TypeScript types + Zod schemas
│   ├── utils/                  # Shared utilities
│   └── config/                 # Shared ESLint, Tailwind, TypeScript config
│
├── docker-compose.yml          # PostgreSQL + Redis + Typesense + API + Web
├── nginx/                      # Nginx config templates
├── turbo.json
├── package.json
└── plan.md                     # This file
```

---

## 4. How It Works (Simple Terms)

### For a Guest Booking on radhikaresort.in

1. Guest visits **radhikaresort.in** → sees Radhika Resort's website (their brand, their colors)
2. Searches available rooms → picks dates (or hours if hourly booking is enabled)
3. Selects a room → fills in guest details
4. Pays via Razorpay/Stripe → money goes to Radhika Resort's account (if booked on their domain, no commission)
5. Gets confirmation on email + WhatsApp
6. Can login at radhikaresort.in to view/modify/cancel booking

### For a Guest Booking on bluestay.in

1. Guest visits **bluestay.in** → sees ALL partner hotels
2. Searches "Hotels in Goa" → sees Radhika Resort + others
3. Clicks Radhika Resort → sees room details
4. Books a room → pays via Razorpay/Stripe
5. Payment is **split automatically**: 90% to Radhika Resort, 10% to BlueStay (commission)
6. Booking appears in Radhika Resort's admin panel with source marked as "BlueStay"
7. Room availability is updated instantly on both radhikaresort.in and bluestay.in

### For Radhika Resort (Admin)

1. Logs in at **radhikaresort.in/admin**
2. Sees dashboard: today's bookings, revenue, occupancy
3. Manages rooms: add/edit room types, set prices per date, upload photos
4. Chooses booking model: **hourly** or **daily (24-hour)** per room type
5. Views all bookings (from their site + from BlueStay)
6. Manages guest check-in/check-out
7. Views earnings and BlueStay commission deductions

### For You (BlueStay Platform Admin)

1. Logs in at **bluestay.in/platform-admin**
2. Onboards new hotels (creates tenant + generates API key)
3. Sets commission rates per hotel
4. Views platform-wide analytics (total bookings, revenue, commission)
5. Manages featured hotels on bluestay.in homepage
6. Moderates reviews

---

## 5. Database Schema

### Core Tables

```
Hotel
├── id (UUID, primary key)
├── name ("Radhika Resort")
├── slug ("radhika-resort")
├── description (rich text)
├── address, city, state, country, pincode
├── latitude, longitude
├── phone, email, whatsapp
├── logo_url, hero_image_url
├── star_rating (1-5)
├── booking_model (ENUM: 'DAILY' | 'HOURLY' | 'BOTH')
├── check_in_time (default: "14:00")
├── check_out_time (default: "12:00")
├── hourly_min_hours (default: 3, minimum hours for hourly booking)
├── hourly_max_hours (default: 12)
├── commission_rate (decimal, e.g., 0.10 for 10%)
├── commission_type (ENUM: 'PERCENTAGE' | 'FLAT')
├── razorpay_account_id (for split payments)
├── stripe_account_id (for Stripe Connect)
├── theme_config (JSON: { primaryColor, fontFamily, ... })
├── is_active (boolean)
├── created_at, updated_at

HotelDomain
├── id
├── hotel_id (FK → Hotel)
├── domain ("radhikaresort.in")
├── is_primary (boolean)
├── ssl_status (ENUM: 'PENDING' | 'ACTIVE' | 'FAILED')
├── created_at

RoomType
├── id
├── hotel_id (FK → Hotel)
├── name ("Deluxe Ocean View")
├── slug ("deluxe-ocean-view")
├── description
├── base_price_daily (decimal, INR per night)
├── base_price_hourly (decimal, INR per hour — NULL if daily only)
├── max_guests
├── max_extra_guests (additional guests with charge)
├── extra_guest_charge (per night/hour)
├── total_rooms (how many physical rooms of this type)
├── amenities (JSON array: ["wifi", "ac", "pool-access", ...])
├── images (JSON array of CDN URLs)
├── booking_model_override (ENUM: NULL | 'DAILY' | 'HOURLY' | 'BOTH')
│   // If NULL, inherits from Hotel. Allows per-room-type override.
├── min_hours (override hotel default for this room type)
├── max_hours (override hotel default for this room type)
├── is_active
├── sort_order
├── created_at, updated_at

Room (Physical rooms)
├── id
├── hotel_id (FK → Hotel)
├── room_type_id (FK → RoomType)
├── room_number ("101", "202A")
├── floor (integer)
├── status (ENUM: 'AVAILABLE' | 'MAINTENANCE' | 'BLOCKED')
├── notes ("AC needs repair", etc.)
├── created_at, updated_at
```

### Inventory & Booking Tables

```
RoomInventory (Daily availability — one row per room_type per date)
├── id
├── room_type_id (FK → RoomType)
├── date (DATE, e.g., "2026-03-15")
├── available_count (integer, decremented on booking)
├── price_override (decimal, NULL = use base_price_daily)
├── min_stay_nights (default: 1)
├── is_closed (boolean — manually block date)
├── created_at, updated_at
├── UNIQUE(room_type_id, date)

HourlySlot (Hourly availability — for hourly booking hotels)
├── id
├── room_type_id (FK → RoomType)
├── date (DATE)
├── slot_start (TIME, e.g., "08:00")
├── slot_end (TIME, e.g., "11:00")
├── available_count (integer)
├── price_override (decimal per hour, NULL = use base_price_hourly)
├── is_closed (boolean)
├── created_at, updated_at
├── UNIQUE(room_type_id, date, slot_start, slot_end)

Booking
├── id (UUID)
├── booking_number ("BK-20260315-XXXX", human-readable)
├── hotel_id (FK → Hotel)
├── guest_id (FK → User)
├── room_type_id (FK → RoomType)
├── assigned_room_id (FK → Room, NULL until check-in)
├── booking_type (ENUM: 'DAILY' | 'HOURLY')
├── check_in_date (DATE)
├── check_out_date (DATE, for daily bookings)
├── check_in_time (TIME, for hourly: "14:00")
├── check_out_time (TIME, for hourly: "17:00")
├── num_hours (integer, NULL for daily bookings)
├── num_rooms (integer, default: 1)
├── num_guests
├── num_extra_guests
├── room_total (decimal — base room cost)
├── extra_guest_total (decimal)
├── taxes (decimal)
├── discount_amount (decimal)
├── total_amount (decimal — final amount guest pays)
├── commission_amount (decimal — BlueStay's cut, 0 for direct bookings)
├── hotel_payout (decimal — total_amount - commission_amount)
├── source (ENUM: 'DIRECT' | 'BLUESTAY' | 'WALK_IN')
├── status (ENUM: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW')
├── payment_status (ENUM: 'PENDING' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'FAILED')
├── cancellation_reason (text, NULL)
├── cancelled_at (timestamp, NULL)
├── special_requests (text)
├── guest_name, guest_email, guest_phone (denormalized for quick access)
├── created_at, updated_at

Payment
├── id
├── booking_id (FK → Booking)
├── gateway (ENUM: 'RAZORPAY' | 'STRIPE' | 'CASH')
├── gateway_payment_id ("pay_xxxxx")
├── gateway_order_id ("order_xxxxx")
├── amount (decimal)
├── currency ("INR", "USD")
├── status (ENUM: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED')
├── refund_amount (decimal, default: 0)
├── refund_id (gateway refund reference)
├── metadata (JSON — full gateway response)
├── created_at, updated_at
```

### User & Platform Tables

```
User
├── id (UUID)
├── email (unique, nullable — some users use phone only)
├── phone (unique, nullable)
├── name
├── avatar_url
├── role (ENUM: 'GUEST' | 'HOTEL_ADMIN' | 'HOTEL_STAFF' | 'PLATFORM_ADMIN')
├── hotel_id (FK → Hotel, NULL for guests and platform admins)
├── is_active
├── email_verified, phone_verified
├── last_login_at
├── created_at, updated_at

Review
├── id
├── hotel_id (FK → Hotel)
├── booking_id (FK → Booking)
├── guest_id (FK → User)
├── rating (1-5)
├── title
├── comment (text)
├── photos (JSON array of URLs)
├── hotel_reply (text, NULL)
├── is_verified (boolean — stayed at hotel)
├── is_published (boolean — moderation)
├── created_at, updated_at

Commission
├── id
├── hotel_id (FK → Hotel)
├── booking_id (FK → Booking)
├── booking_amount (decimal)
├── commission_rate (decimal, snapshot at time of booking)
├── commission_amount (decimal)
├── status (ENUM: 'PENDING' | 'SETTLED' | 'DISPUTED')
├── settled_at (timestamp)
├── created_at

SEOMeta (Custom SEO per page per hotel)
├── id
├── hotel_id (FK → Hotel)
├── page_slug ("homepage", "rooms", "rooms/deluxe-ocean-view")
├── meta_title
├── meta_description
├── og_image_url
├── custom_json_ld (JSON)
├── canonical_url
├── created_at, updated_at

Media
├── id
├── hotel_id (FK → Hotel)
├── url (CDN URL)
├── thumbnail_url
├── type (ENUM: 'IMAGE' | 'VIDEO')
├── category (ENUM: 'ROOM' | 'HOTEL' | 'AMENITY' | 'GALLERY')
├── alt_text (for SEO)
├── sort_order
├── width, height (pixels)
├── size_bytes
├── created_at
```

---

## 6. Booking Models (Hourly + Daily)

### Configuration

Each hotel chooses their booking model at the hotel level:

| Setting | Options | Example |
|---|---|---|
| `hotel.booking_model` | `DAILY`, `HOURLY`, or `BOTH` | Radhika Resort = `BOTH` |
| `hotel.check_in_time` | Time string | `"14:00"` |
| `hotel.check_out_time` | Time string | `"12:00"` |
| `hotel.hourly_min_hours` | Integer | `3` (minimum 3-hour booking) |
| `hotel.hourly_max_hours` | Integer | `12` |

Each room type can **override** the hotel default:

| Setting | Options | Example |
|---|---|---|
| `roomType.booking_model_override` | NULL (inherit) or specific | Suite = `DAILY` only |
| `roomType.base_price_hourly` | Price per hour | ₹500/hour |
| `roomType.min_hours` | Override | `2` for this room type |

### Daily Booking Flow (24-Hour / Night-Based)

```
Guest selects:
  Check-in:  March 15, 2026
  Check-out: March 17, 2026
  = 2 nights

System checks:
  RoomInventory WHERE room_type_id = X
    AND date IN ('2026-03-15', '2026-03-16')
    AND available_count > 0
    AND is_closed = false

Price calculation:
  Night 1 (Mar 15): price_override OR base_price_daily = ₹3,500
  Night 2 (Mar 16): price_override OR base_price_daily = ₹4,000 (weekend)
  Subtotal: ₹7,500
  Taxes (18% GST): ₹1,350
  Total: ₹8,850

On booking confirmation:
  Decrement available_count for Mar 15 and Mar 16 by 1
```

### Hourly Booking Flow

```
Guest selects:
  Date:       March 15, 2026
  Check-in:   10:00 AM
  Duration:   4 hours
  Check-out:  02:00 PM (auto-calculated)

System checks:
  HourlySlot WHERE room_type_id = X
    AND date = '2026-03-15'
    AND slot_start <= '10:00'
    AND slot_end >= '14:00'
    AND available_count > 0

  OR (flexible approach):
  No hourly slots pre-created — system checks existing hourly bookings
  for that room type on that date and ensures no overlap.

Price calculation:
  4 hours × ₹500/hour = ₹2,000
  Taxes (18% GST): ₹360
  Total: ₹2,360

On booking confirmation:
  Create HourlySlot record marking 10:00-14:00 as occupied
  OR decrement available_count for overlapping slots
```

### Hourly Inventory Strategy

**Approach: Overlap-Check (Recommended)**

Instead of pre-creating fixed time slots, we dynamically check for conflicts:

```
When a guest wants to book Room Type X on March 15, 10:00 AM - 2:00 PM:

1. Count existing hourly bookings for that room_type + date
   that overlap with 10:00-14:00

   SELECT COUNT(*) FROM bookings
   WHERE room_type_id = X
     AND check_in_date = '2026-03-15'
     AND booking_type = 'HOURLY'
     AND status NOT IN ('CANCELLED')
     AND (
       (check_in_time < '14:00' AND check_out_time > '10:00')
     )

2. If count < total_rooms for that type → rooms available

3. Also check daily bookings for same date (daily booking blocks hourly)

This approach:
  ✅ No need to pre-create slots
  ✅ Guest picks any start time (not forced into fixed slots)
  ✅ Flexible durations (3h, 4h, 5h, etc.)
  ✅ Works with mixed daily + hourly on same room type
```

### Mixed Mode (BOTH Daily and Hourly)

When a hotel allows both:

```
Deluxe Room (5 physical rooms):

March 15:
  Room 1: Daily booking (Guest A, full day)
  Room 2: Daily booking (Guest B, full day)
  Room 3: Hourly — 8am-12pm (Guest C), 2pm-6pm (Guest D)
  Room 4: Hourly — 10am-1pm (Guest E)
  Room 5: Available (daily or hourly)

The system tracks:
  - Daily inventory: 5 total - 2 daily - 0 fully-booked-hourly = 3 available for daily
  - Hourly: checks each room's hourly schedule for conflicts

A daily booking BLOCKS that room for hourly.
Multiple hourly bookings can share a room if they don't overlap.
```

### Admin UI for Hourly vs Daily

```
Hotel Admin Panel → Settings → Booking Configuration

┌──────────────────────────────────────────────┐
│ Booking Model                                │
│                                              │
│ ○ Daily Only (24-hour check-in/check-out)    │
│ ○ Hourly Only                                │
│ ● Both Daily and Hourly                      │
│                                              │
│ ── Daily Settings ──                         │
│ Check-in Time:  [14:00 ▾]                    │
│ Check-out Time: [12:00 ▾]                    │
│                                              │
│ ── Hourly Settings ──                        │
│ Minimum Hours:  [3  ▾]                       │
│ Maximum Hours:  [12 ▾]                       │
│ Available From: [06:00 ▾]                    │
│ Available Until: [22:00 ▾]                   │
│                                              │
│ ── Per Room Type Override ──                 │
│ Deluxe Room:    [Both ▾] ₹500/hr  ₹3500/day │
│ Suite:          [Daily Only ▾]     ₹7000/day │
│ Standard Room:  [Both ▾] ₹300/hr  ₹2000/day │
└──────────────────────────────────────────────┘
```

### Guest UI for Hourly Booking

```
radhikaresort.in/rooms/deluxe-room

┌──────────────────────────────────────────────┐
│                                              │
│ ┌─────────┐ ┌──────────┐                    │
│ │ ● Daily │ │ ○ Hourly │  ← Toggle          │
│ └─────────┘ └──────────┘                    │
│                                              │
│ (When Hourly selected):                      │
│                                              │
│ Date:       [March 15, 2026    📅]           │
│ Check-in:   [10:00 AM         ▾]            │
│ Duration:   [◀ ── 4 hours ── ▶] (slider)    │
│ Check-out:  02:00 PM (auto)                  │
│                                              │
│ ₹500/hour × 4 hours = ₹2,000                │
│ GST (18%):              ₹360                 │
│ ─────────────────────────────                │
│ Total:                  ₹2,360               │
│                                              │
│ [Book Now]                                   │
└──────────────────────────────────────────────┘
```

---

## 7. Double-Booking Prevention

### Three-Layer Protection

**Layer 1: Redis Distributed Lock**
```
When guest clicks "Book Now":
  Acquire lock: "lock:roomtype:{id}:date:{date}" (for daily)
  OR: "lock:roomtype:{id}:date:{date}:hour:{start}-{end}" (for hourly)
  TTL: 10 minutes (auto-release if user abandons)

If lock already held → show "Room is being booked by someone else, please wait"
```

**Layer 2: PostgreSQL Transaction**
```
BEGIN TRANSACTION;
  -- Check availability (SELECT ... FOR UPDATE — row-level lock)
  SELECT available_count FROM room_inventory
    WHERE room_type_id = X AND date = '2026-03-15'
    FOR UPDATE;

  -- Only proceed if available_count > 0
  IF available_count > 0 THEN
    INSERT INTO bookings (...);
    UPDATE room_inventory SET available_count = available_count - 1
      WHERE room_type_id = X AND date = '2026-03-15';
    COMMIT;
  ELSE
    ROLLBACK; -- Room sold out between search and book
  END IF;
```

**Layer 3: Application-Level Validation**
```
Before payment:
  Re-check availability (in case lock expired and another booking came in)

After payment:
  Final atomic check + booking creation in one transaction
  If fails → auto-refund payment
```

### Hourly Double-Booking Prevention

```
For hourly bookings, the overlap check is critical:

-- Check if ANY existing booking overlaps with requested time
SELECT COUNT(*) FROM bookings
WHERE room_type_id = :roomTypeId
  AND check_in_date = :date
  AND booking_type = 'HOURLY'  
  AND status IN ('CONFIRMED', 'CHECKED_IN')
  AND check_in_time < :requestedEndTime
  AND check_out_time > :requestedStartTime

-- Also count daily bookings (they block all hourly)
+ SELECT COUNT(*) FROM bookings
  WHERE room_type_id = :roomTypeId
  AND check_in_date <= :date
  AND check_out_date > :date
  AND booking_type = 'DAILY'
  AND status IN ('CONFIRMED', 'CHECKED_IN')

If (hourly_overlaps + daily_bookings) >= total_rooms → NOT AVAILABLE
```

---

## 8. SEO Strategy

### On-Page SEO (Every Hotel Site)

| Element | Implementation |
|---|---|
| **Meta Title** | Dynamic: `{hotel.name} - Book Rooms from ₹{minPrice} | {city}` |
| **Meta Description** | Custom per hotel via admin, fallback auto-generated |
| **Canonical URL** | `https://radhikaresort.in/rooms/deluxe-ocean-view` |
| **Open Graph** | Title, description, image (1200×630) for social sharing |
| **Twitter Cards** | Large image summary cards |
| **JSON-LD** | Hotel, LodgingBusiness, HotelRoom, Offer, AggregateRating, Review |
| **Sitemap** | Auto-generated `sitemap.xml` per hotel domain |
| **Robots.txt** | Allow all, point to sitemap |
| **Heading Structure** | Semantic H1 → H2 → H3 hierarchy |
| **Image Alt Text** | Required field when hotel uploads photos |
| **URL Structure** | Clean slugs: `/rooms/deluxe-ocean-view` (no IDs) |

### Technical SEO

| Element | Implementation |
|---|---|
| **SSR** | All pages server-rendered (no blank HTML for crawlers) |
| **ISR** | Hotel pages revalidate every 60 seconds (fresh but cached) |
| **Core Web Vitals** | LCP <1.5s, CLS <0.1, FID <100ms |
| **Mobile-Friendly** | Responsive Tailwind, tested on all screen sizes |
| **Page Speed** | Nginx caching, Cloudflare CDN, image optimization |
| **HTTPS** | Let's Encrypt auto-SSL on all domains |
| **Internationalization** | hreflang tags (future: multi-language) |

### Content SEO

```
Each hotel gets these auto-generated pages (indexable):

radhikaresort.in/
├── /                           (H1: "Radhika Resort — Luxury Beach Hotel in Goa")
├── /rooms                      (H1: "Rooms & Suites at Radhika Resort")
├── /rooms/deluxe-ocean-view    (H1: "Deluxe Ocean View Room — Radhika Resort")
├── /rooms/premium-suite        (Unique page per room type)
├── /gallery                    (H1: "Photo Gallery — Radhika Resort Goa")
├── /about                      (H1: "About Radhika Resort")
├── /location                   (H1: "Location & How to Reach Radhika Resort")
├── /reviews                    (H1: "Guest Reviews — Radhika Resort")
├── /offers                     (H1: "Special Offers & Deals — Radhika Resort")
├── /contact                    (H1: "Contact Radhika Resort")
├── /blog/                      (Optional: SEO articles)
│   ├── /things-to-do-in-goa
│   └── /best-time-to-visit-goa
├── /sitemap.xml
└── /robots.txt
```

### BlueStay Aggregator SEO

```
bluestay.in/
├── /                           (H1: "Book Hotels Across India — BlueStay")
├── /hotels                     (H1: "All Hotels")
├── /hotels/goa                 (H1: "Hotels in Goa — BlueStay")
├── /hotels/goa/radhika-resort  (H1: "Radhika Resort Goa — Book on BlueStay")
├── /about
├── /for-hotels                 (Lead gen: "List Your Hotel on BlueStay")
├── /blog/
├── /sitemap.xml
└── /robots.txt
```

**Important**: radhikaresort.in and bluestay.in/hotels/goa/radhika-resort will have **different content** to avoid duplicate content penalties. The hotel's own site focuses on "book directly" messaging, while BlueStay's page focuses on comparison and discovery.

---

## 9. Mobile-First Design

### Design Principles

1. **Touch targets**: All buttons minimum 48×48px (Google recommendation)
2. **Thumb zone**: Key actions (Book Now, Search) in easy thumb reach
3. **No horizontal scroll**: Everything stacks vertically on mobile
4. **Fast first paint**: Skeleton loaders for perceived speed
5. **Offline support**: PWA caches recently viewed hotels
6. **Native feel**: Bottom sheets, swipe gestures, pull-to-refresh

### Key UI Patterns

| Component | Mobile Implementation |
|---|---|
| **Navigation** | Bottom tab bar (Home, Search, Bookings, Profile) |
| **Room Cards** | Full-width, swipeable image carousel, tap to expand |
| **Date Picker** | Full-screen calendar with drag-to-select range |
| **Time Picker** | Large scroll wheels (like iOS time picker) for hourly |
| **Image Gallery** | Full-screen, pinch-to-zoom, swipe between images |
| **Booking Form** | Multi-step wizard, one section per screen |
| **Filters** | Bottom sheet with checkboxes, "Apply" button |
| **Search** | Sticky search bar, location autocomplete, "Near Me" |
| **Reviews** | Horizontal scroll cards, tap to expand |

### Progressive Web App (PWA)

```
Features:
├── Install prompt ("Add to Home Screen")
├── App icon on phone home screen
├── Opens without browser chrome (full-screen feel)
├── Offline: browse cached hotels, view past bookings
├── Push notifications: booking confirmations, reminders
├── Background sync: queue booking if offline, submit when online
└── Share target: share hotel with friends via native share sheet
```

### Image Optimization Pipeline

```
Hotel uploads 5MB JPEG
  ↓
Cloudflare R2 stores original
  ↓
On first request, Cloudflare Images generates:
  ├── thumbnail:  200×150  WebP/AVIF  (~15KB)  — for cards
  ├── medium:     800×600  WebP/AVIF  (~80KB)  — for mobile detail
  ├── large:     1920×1080 WebP/AVIF  (~200KB) — for desktop
  └── og:       1200×630  JPEG       (~150KB) — for social sharing
  ↓
CDN caches all variants globally
  ↓
Next.js <Image> component:
  - Lazy loads off-screen images
  - Shows blur placeholder while loading
  - Serves correct size based on viewport
  - Uses WebP/AVIF for modern browsers, JPEG fallback
```

---

## 10. Payment & Commission Model

### Payment Flow (Direct Booking on Hotel Site)

```
Guest books on radhikaresort.in:
  Total: ₹8,850
  Commission: ₹0 (direct booking, hotel keeps 100%)

Payment goes to:
  Radhika Resort's own Razorpay/Stripe account
  (configured in hotel admin settings)
```

### Payment Flow (BlueStay Aggregator Booking)

```
Guest books on bluestay.in:
  Total: ₹8,850
  BlueStay commission (10%): ₹885
  Hotel receives: ₹7,965

Using Razorpay Route (India):
  ├── Guest pays ₹8,850 to BlueStay's Razorpay account
  ├── Razorpay auto-transfers ₹7,965 to Radhika Resort's linked account
  └── ₹885 stays with BlueStay

Using Stripe Connect (Global):
  └── Same split, handled by Stripe Connect direct charges
```

### Commission Configuration

```
Hotel Admin (Platform Admin sets this):
  ├── Default rate: 10%
  ├── Per-hotel override: Radhika = 8% (negotiated deal)
  ├── Rate type: Percentage or Flat fee
  └── Commission applies ONLY to BlueStay bookings (not direct)
```

### Payment Gateway Setup

```
For each hotel:
  1. Hotel creates own Razorpay/Stripe account
  2. Links it from hotel admin panel (OAuth flow)
  3. BlueStay stores account_id for split payments

Direct bookings → charge hotel's own account
BlueStay bookings → charge BlueStay account → auto-split to hotel
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Weeks 1–6)

| Step | Task | Details |
|---|---|---|
| 1.1 | Initialize Turborepo monorepo | Create `apps/web`, `apps/api`, `packages/ui`, `packages/types`, `packages/utils` |
| 1.2 | Set up NestJS API | GraphQL with Apollo, Prisma ORM, JWT auth, tenant guard |
| 1.3 | Design & migrate database | Full Prisma schema (all tables from Section 5), seed with test data |
| 1.4 | Multi-tenant middleware | Next.js middleware: domain → Redis lookup → hotelId header injection |
| 1.5 | Docker Compose setup | PostgreSQL 16, Redis 7, NestJS API, Next.js web, Nginx reverse proxy |
| 1.6 | CI/CD pipeline | GitHub Actions: lint, test, build, deploy to VPS on push |

### Phase 2: Booking Engine (Weeks 7–12)

| Step | Task | Details |
|---|---|---|
| 2.1 | Room & inventory CRUD API | Create room types, rooms; bulk inventory editor (set prices for date ranges) |
| 2.2 | Daily booking flow | Search → hold (Redis lock) → guest details → payment → confirm → update inventory |
| 2.3 | Hourly booking flow | Time picker → overlap check → hold → payment → confirm |
| 2.4 | Mixed mode support | Hotels with `BOTH` model: UI toggle between daily/hourly, combined availability check |
| 2.5 | Razorpay integration | Create order → checkout → verify payment → capture → webhook handling |
| 2.6 | Stripe integration | Payment intents → checkout → webhook → Stripe Connect for splits |
| 2.7 | Booking management | List, cancel (with refund policy), modify dates/times, resend confirmation |

### Phase 3: Hotel Frontend (Weeks 13–18)

| Step | Task | Details |
|---|---|---|
| 3.1 | Design system | shadcn/ui + custom components: RoomCard, BookingCalendar, TimePicker, ImageGallery |
| 3.2 | Hotel homepage | Hero, search widget, featured rooms, amenities, map, reviews, footer |
| 3.3 | Room listing page | Filters, room cards with image carousels, daily/hourly toggle |
| 3.4 | Room detail page | Image gallery, availability calendar/time slots, booking form (sticky) |
| 3.5 | Booking checkout | 3-step wizard, guest details, payment integration, confirmation page |
| 3.6 | Guest portal | Login (OTP), my bookings, modify/cancel, invoices, reviews |
| 3.7 | PWA setup | manifest.json, service worker, offline caching, install prompt |
| 3.8 | Theming engine | CSS variables from hotel config, dynamic colors/fonts/logo |

### Phase 4: Hotel Admin Panel (Weeks 19–24)

| Step | Task | Details |
|---|---|---|
| 4.1 | Admin dashboard | Revenue cards, occupancy chart, today's check-ins/outs, recent bookings |
| 4.2 | Room management | CRUD room types + rooms, photo uploader with crop, amenities picker |
| 4.3 | Pricing & availability | Calendar view, drag to select dates, set price/close dates; hourly rate editor |
| 4.4 | Booking management | List/filter/search bookings, change status, manual walk-in entry |
| 4.5 | Content management | Edit homepage hero, about, FAQs; WYSIWYG editor for non-tech users |
| 4.6 | SEO settings | Meta title/description per page, OG image upload, JSON-LD preview |
| 4.7 | Booking model config | Choose daily/hourly/both, set hours, check-in/out times |
| 4.8 | Payment config | Link Razorpay/Stripe account, view payouts |
| 4.9 | Analytics | Occupancy, revenue by source (direct vs BlueStay), popular rooms, avg stay |

### Phase 5: BlueStay Aggregator (Weeks 25–30)

| Step | Task | Details |
|---|---|---|
| 5.1 | Aggregator homepage | Search bar, trending destinations, featured hotels, CTA for hotel owners |
| 5.2 | Hotel search | Typesense-powered instant search, filters, map view, sort options |
| 5.3 | Hotel detail page | Hotel info, rooms listing, reviews, book with commission |
| 5.4 | Aggregator booking flow | Same engine as direct, but source='BLUESTAY', commission applied |
| 5.5 | Commission engine | Per-hotel rates, auto-split payments, commission ledger, settlement tracking |
| 5.6 | Platform admin | Onboard hotels, manage commissions, platform analytics, moderation |
| 5.7 | Hotel onboarding flow | Self-serve signup → configure hotel → link payment → domain setup guide |

### Phase 6: Advanced Features (Weeks 31–36)

| Step | Task | Details |
|---|---|---|
| 6.1 | Review system | Post-checkout prompt, star + text + photo reviews, moderation queue |
| 6.2 | Notifications | Email (Resend), SMS/WhatsApp (MSG91), push notifications (PWA) |
| 6.3 | Smart pricing suggestions | Analyze occupancy trends → suggest price adjustments |
| 6.4 | Security hardening | Rate limiting, CORS, helmet, XSS/CSRF protection, audit logging |
| 6.5 | Performance optimization | Redis caching, ISR, Cloudflare CDN, Lighthouse 95+ score |
| 6.6 | Monitoring & backups | Sentry, BetterStack, daily DB backups to R2, disaster recovery |
| 6.7 | Documentation | Hotel onboarding guide, API docs, admin user manual |
| 6.8 | Launch preparation | Staging testing, load testing, security audit, first hotel go-live |

---

## 12. Cost Estimates

### Your Costs (BlueStay Platform)

| Item | Monthly Cost | Notes |
|---|---|---|
| VPS (Hetzner CPX21) | $12-20 | 4GB RAM, 3 vCPU, plenty for start |
| Domain (bluestay.in) | ~$1 | $12/year |
| Cloudflare (free tier) | $0 | CDN, DNS, DDoS protection |
| Cloudflare R2 (storage) | $0-1 | Free up to 10GB storage |
| Resend (email) | $0 | Free up to 3,000 emails/month |
| Sentry (errors) | $0 | Free tier for small projects |
| SSL certificates | $0 | Let's Encrypt |
| **TOTAL** | **$15-25/month** | |

### Scaling Costs

| Hotels | VPS Needed | Monthly Cost |
|---|---|---|
| 1-10 hotels | 4GB RAM ($12) | $15-25 |
| 10-30 hotels | 8GB RAM ($20) | $25-35 |
| 30-100 hotels | 16GB RAM ($40) | $45-60 |
| 100+ hotels | 2 servers + load bal | $100-150 |

### Per Hotel Costs (What Hotel Pays)

| Item | Monthly Cost | Paid By |
|---|---|---|
| Domain (radhikaresort.in) | ~$1 | Hotel |
| Hosting | $0 | Runs on your VPS |
| SSL | $0 | Let's Encrypt on your VPS |
| Payment gateway fees | 2-3% per txn | Deducted from payment |
| BlueStay commission | 8-15% per booking (only BlueStay bookings) | Auto-deducted |
| **TOTAL for hotel** | **~$1/month + transaction fees** | |

### Revenue Model

```
Revenue from 1 hotel (moderate traffic):
  20 bookings/month × ₹5,000 avg × 10% commission = ₹10,000/month (~$120)

Revenue from 10 hotels:
  200 bookings/month × ₹5,000 avg × 10% commission = ₹1,00,000/month (~$1,200)

Revenue from 50 hotels:
  1,000 bookings/month × ₹5,000 avg × 10% commission = ₹5,00,000/month (~$6,000)

Your costs at 50 hotels: ~$60/month
Your profit at 50 hotels: ~$5,940/month
```

---

## 13. Open-Source References

| Project | What to Learn From It |
|---|---|
| **Vercel Platforms Starter** (github.com/vercel/platforms) | Multi-tenant Next.js with custom domains — directly applicable pattern |
| **Cal.com** (github.com/calcom/cal.com) | Next.js + Prisma multi-tenant scheduling, hourly time slot management |
| **Medusa.js** (github.com/medusajs/medusa) | Headless commerce with multi-tenant patterns, payment plugin architecture |
| **QloApps** (github.com/webkul/hotelcommerce) | Hotel booking feature reference (room types, seasonal pricing, check-in/out) |
| **T3 Stack** (create.t3.gg) | Full-stack TypeScript scaffold (Next.js + Prisma + tRPC) |
| **Houseware** (various open-source hotel PMS) | Property management system features for admin panel reference |

**Recommendation**: Don't fork any of these. Use them as architecture and feature references. Build from scratch using the T3/NestJS patterns.

---

## 14. Verification & Testing

### Automated Tests

| Type | Tool | What to Test |
|---|---|---|
| Unit Tests | Vitest | Booking engine logic, commission calc, inventory lock/release, hourly overlap detection |
| Integration Tests | Vitest + Supertest | Full booking flow (search → hold → pay → confirm), cancellation + refund |
| E2E Tests | Playwright | White-label booking flow, aggregator booking flow, admin panel CRUD |
| Load Tests | k6 or Artillery | 100 concurrent bookings on same room type — verify zero double-bookings |
| Visual Tests | Playwright screenshots | Mobile/desktop layout regression |

### Manual Checks

- [ ] Deploy to staging VPS
- [ ] Point two test domains (test-hotel-1.example.com, test-hotel-2.example.com)
- [ ] Verify tenant isolation (Hotel 1 cannot see Hotel 2 data)
- [ ] Complete booking on hotel site (daily)
- [ ] Complete booking on hotel site (hourly)
- [ ] Complete booking on aggregator (verify commission split)
- [ ] Cancel booking (verify refund)
- [ ] Attempt double booking (verify prevention)
- [ ] Test on iPhone SE (smallest screen)
- [ ] Test on Android Chrome
- [ ] Run Lighthouse audit (target: 95+ on all categories)
- [ ] Validate structured data (Google Rich Results Test)
- [ ] Check sitemap.xml generation
- [ ] Verify SSL on all domains

### Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | 95+ |
| Lighthouse SEO | 100 |
| Lighthouse Accessibility | 95+ |
| First Contentful Paint | <0.8s |
| Largest Contentful Paint | <1.5s |
| Time to Interactive | <2s |
| Cumulative Layout Shift | <0.1 |
| API Response Time (p99) | <200ms |
| Concurrent Booking Test | 0 double-bookings |

---

## 15. Key Decisions Log

| Decision | Chose | Over | Reason |
|---|---|---|---|
| Database per tenant | Single shared DB | Separate DBs | No sync needed, simpler ops, sufficient isolation via hotelId FK |
| API framework | NestJS | Express.js | Modular architecture (guards, interceptors), better for complex multi-tenant system |
| API style | GraphQL | REST | Frontend requests exactly what it needs, fewer requests, type-safe |
| Frontend framework | Next.js 15 (App Router) | Pages Router / Remix | Better SEO (Metadata API), Server Components, middleware for domain resolution |
| Styling | Tailwind CSS v4 + shadcn/ui | Material UI / Chakra | Smaller bundle, more customizable, great mobile-first utilities |
| ORM | Prisma 6 | TypeORM / Drizzle | Best TypeScript integration, auto-migrations, excellent DX |
| Search | Typesense | Meilisearch / Algolia | Self-hosted (free), typo-tolerance, geo-search, faster than Meilisearch |
| Hosting | Self-hosted VPS (Hetzner) | Vercel / AWS | Budget-friendly, full control, no cold starts, easier custom domain management |
| Hourly inventory | Overlap-check algorithm | Pre-created time slots | More flexible (guests pick any time), no slot management needed, handles mixed mode |
| Payment splits | Razorpay Route + Stripe Connect | Manual transfers | Automatic split at gateway level, cleaner compliance, instant hotel payouts |
| Image storage | Cloudflare R2 | AWS S3 | Free egress (S3 charges $0.09/GB), built-in image optimization |
| Domain per hotel | Own domain (radhikaresort.in) | Subdomain (radhika.bluestay.in) | Better SEO authority, hotel owns their brand, more professional |

---

## Appendix: New Hotel Onboarding Checklist

```
When a new hotel joins BlueStay:

1. [ ] Platform admin creates hotel tenant in database
2. [ ] Generate API key for hotel
3. [ ] Set commission rate
4. [ ] Hotel buys their domain
5. [ ] Hotel points DNS A record to VPS IP
6. [ ] Run SSL setup: certbot --nginx -d hotel-domain.com
7. [ ] Add Nginx server block for new domain
8. [ ] Hotel admin logs in at hotel-domain.com/admin
9. [ ] Hotel configures: rooms, pricing, photos, booking model (daily/hourly/both)
10. [ ] Hotel links Razorpay/Stripe account
11. [ ] Test booking on hotel site
12. [ ] Hotel goes live on BlueStay aggregator
13. [ ] Verify Google Search Console setup for hotel domain

Time: ~30 minutes per hotel (automate further in Phase 6)
```
```

This is the complete content for `plan.md`. To create the file, please either:
1. **Enable file editing tools** in this chat and I'll create it directly, or
2. Copy the content above into `/workspaces/hotel-booking/plan.md`

The key addition is **Section 6 (Booking Models)** which covers:
- Hotel-level config: `DAILY`, `HOURLY`, or `BOTH`
- Per-room-type override (e.g., Suites = daily only, Standard rooms = both)
- **Overlap-check algorithm** for hourly bookings (no pre-created slots needed — guests pick any start time + duration)
- Mixed mode handling (daily booking blocks hourly for that room, multiple hourly bookings can share a room if no time overlap)
- Admin UI mockup for configuring booking models
- Guest UI mockup for the hourly booking time picker