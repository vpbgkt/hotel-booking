# BlueStay — Complete Project Guide

> Multi-Tenant Hotel Booking Platform  
> Built with NestJS + Next.js + Prisma + PostgreSQL + Redis

---

## Table of Contents

1. [What is BlueStay?](#1-what-is-bluestay)
2. [Who is it For?](#2-who-is-it-for)
3. [Feature Overview](#3-feature-overview)
4. [Architecture](#4-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Prerequisites](#6-prerequisites)
7. [Installation & Setup](#7-installation--setup)
8. [Configuration Reference](#8-configuration-reference)
9. [User Roles & Credentials](#9-user-roles--credentials)
10. [Multi-Tenant Routing](#10-multi-tenant-routing)
11. [Using the Platform](#11-using-the-platform)
12. [API Documentation](#12-api-documentation)
13. [Payment Gateway Setup](#13-payment-gateway-setup)
14. [Email & Notifications](#14-email--notifications)
15. [File Uploads & Storage](#15-file-uploads--storage)
16. [Database Management](#16-database-management)
17. [Testing](#17-testing)
18. [Production Deployment](#18-production-deployment)
19. [Monitoring & Observability](#19-monitoring--observability)
20. [Project Structure](#20-project-structure)
21. [Current Status & Remaining Work](#21-current-status--remaining-work)

---

## 1. What is BlueStay?

BlueStay is a **multi-tenant hotel booking SaaS platform** that serves three distinct use cases from a single codebase:

| Mode | URL Example | Purpose |
|------|-------------|---------|
| **Aggregator** | `bluestay.in` | OYO/Booking.com-style discovery platform where guests search, compare, and book hotels |
| **White-label** | `radhikaresort.in` | Each hotel gets its own branded website with direct booking capability |
| **Admin** | `bluestay.in/admin` | Hotel owners manage rooms, bookings, pricing, and analytics |

### How it Works

1. **Hotels onboard** via a self-service form or platform admin invitation
2. Each hotel gets a **white-label site** on its own domain (or a subdomain)
3. Guests discover hotels on the **aggregator** or visit the hotel's own domain
4. Bookings are processed with **real-time availability** checks using Redis-based distributed locks
5. Payments flow through **Razorpay** (India) with automatic commission splitting
6. Platform earns a **configurable commission** (default 10%) on each aggregator booking

### Why it's Useful

- **For hotel owners**: Get a professional booking website without building one. Manage everything from a single dashboard.
- **For travelers**: Discover and compare hotels, book with confidence, see real reviews.
- **For the platform operator**: Earn commissions, control quality, scale to thousands of properties.
- **For developers**: A real-world, production-grade reference architecture for multi-tenant SaaS.

---

## 2. Who is it For?

| Audience | Use Case |
|----------|----------|
| **Startup founders** | Launch a hotel booking marketplace in India |
| **Hotel chains** | Self-host for internal reservation management |
| **Developers** | Learn NestJS + Next.js + Prisma patterns at production scale |
| **Students** | Full-stack portfolio project with real-world complexity |

---

## 3. Feature Overview

### Booking Engine
- **Daily bookings** (overnight stays) with check-in / check-out dates
- **Hourly bookings** (day-use) with configurable min/max hours
- **Real-time availability** with Redis distributed locks (prevents double-booking)
- **Inventory management** per room type per date (max rooms, overrides)
- **Smart pricing** engine with occupancy-based suggestions
- **Auto-refund** on cancellations (configurable window)
- **Booking modification** (date changes, room upgrades)
- **Walk-in booking** support for front desk staff
- **Invoice PDF generation** (downloadable via `/api/invoices/:bookingId`)

### Payment Processing
- **Razorpay** integration (India — UPI, cards, net banking, wallets)
- **Demo gateway** for development/testing (auto-approves payments)
- **Webhook verification** for payment status updates
- **Commission auto-calculation** per booking

### Authentication & Authorization
- **JWT** (access + refresh tokens) with rotation
- **OTP login** via Redis-backed codes
- **Google OAuth** (social login)
- **Role-based access**: Guest, HotelAdmin, HotelStaff, PlatformAdmin
- **Tenant isolation** guards ensuring hotel admins only see their own data
- **API key authentication** for external frontends and self-hosted sites
- **Scoped permissions** per API key (read-only, booking, admin)
- **Rate limiting** per API key with configurable limits

### Hotel Admin Dashboard (16 pages)
- Dashboard with live revenue, occupancy, and booking stats
- Room type CRUD with drag-and-drop inventory calendar
- Booking management (confirm, check-in, check-out, cancel)
- Smart pricing with demand-based suggestions
- Guest review moderation
- Gallery management (image upload/reorder)
- SEO meta editor (title, description, OpenGraph, JSON-LD)
- Blog/content management
- Branding & theme configuration
- Walk-in booking form
- Payment & commission tracking
- API key management (generate, revoke, rotate keys for external access)

### Platform Admin (5 pages)
- Multi-hotel management (activate, suspend, configure)
- Commission tracking with settlement (single + bulk)
- Dispute handling with resolution workflow
- Platform-wide analytics (revenue, occupancy, bookings)
- Content moderation

### Guest Features
- Hotel search with city, date, guest, and price filters
- Interactive map view (Leaflet/OpenStreetMap)
- Hotel detail pages with gallery, amenities, rooms, reviews
- Secure booking flow with payment
- Booking history & management
- Review submission with star ratings
- Profile management
- Web push notifications (booking updates)

### Content & SEO
- Blog system with rich text posts
- Dynamic sitemap.xml and robots.txt
- OpenGraph & Twitter Card meta tags
- JSON-LD structured data for hotels
- PWA manifest with offline page

### Infrastructure
- Swagger API documentation at `/api/docs`
- Docker Compose for dev + production
- Nginx reverse proxy with rate limiting
- GitHub Actions CI pipeline
- Database backup/restore scripts
- k6 load testing configurations
- Sentry error tracking integration
- Web push notifications (VAPID)
- SMS/WhatsApp via MSG91

---

## 4. Architecture

```
                    ┌─────────── Internet ───────────┐
                    │                                 │
              ┌─────▼──────┐                          │
              │   Nginx    │  ← SSL termination       │
              │  (reverse  │  ← Rate limiting         │
              │   proxy)   │  ← Gzip compression      │
              └──┬──────┬──┘                          │
                 │      │                             │
    ┌────────────▼┐  ┌──▼────────────┐               │
    │  Next.js 15 │  │  NestJS 10    │               │
    │  (Frontend) │  │  (GraphQL API)│               │
    │  Port 3000  │  │  Port 4000    │               │
    │             │  │               │               │
    │ • SSR/CSR   │  │ • GraphQL     │               │
    │ • App Router│  │ • REST (/api) │               │
    │ • Tailwind  │  │ • WebSocket   │               │
    │ • Apollo    │  │ • Swagger     │               │
    └─────────────┘  └──┬───────┬───┘               │
                        │       │                    │
              ┌─────────▼┐  ┌──▼──────────┐         │
              │PostgreSQL │  │  Redis 7    │         │
              │   16      │  │             │         │
              │           │  │ • Cache     │         │
              │ • 16 models│ │ • Locks     │         │
              │ • 13 enums │ │ • OTP store │         │
              │ • Indexes  │ │ • Sessions  │         │
              └───────────┘  │ • BullMQ    │         │
                             └─────────────┘         │
                                                      │
              ┌─────────────────────────────────────┘
              │  External Services (configurable):
              │  • Razorpay (payments)
              │  • Google OAuth (social login)
              │  • SMTP (email)
              │  • MSG91 (SMS / WhatsApp)
              │  • S3/R2 (file storage)
              │  • Sentry (error tracking)
              │  • Web Push (VAPID)
              └────────────────────────────────────
```

### Multi-Tenant Request Flow

```
Guest visits radhikaresort.in
  → Nginx routes to Next.js
    → Next.js middleware detects custom domain
      → Reads HOTEL_DOMAIN_MAP: { "radhikaresort.in": "hotel-uuid" }
      → Sets headers: x-tenant-type=hotel, x-hotel-id=hotel-uuid
        → Next.js renders white-label hotel pages
          → Apollo Client includes tenant headers in GraphQL requests
            → NestJS reads headers in GraphQL context
              → TenantGuard ensures data isolation
```

---

## 5. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 20+ |
| **Frontend** | Next.js (App Router) | 15.5 |
| **UI** | React | 19 |
| **Styling** | Tailwind CSS | v4 |
| **GraphQL Client** | Apollo Client | 3.x |
| **Backend** | NestJS | 10 |
| **API** | GraphQL (code-first) + REST | |
| **ORM** | Prisma | 6.x |
| **Database** | PostgreSQL | 16 |
| **Cache/Queue** | Redis + BullMQ | 7 |
| **Auth** | Passport.js + JWT + Google OAuth | |
| **Payments** | Razorpay SDK | 2.9 |
| **Email** | Nodemailer | |
| **SMS** | MSG91 | |
| **Push** | web-push (VAPID) | |
| **PDF** | PDFKit | |
| **Maps** | Leaflet + OpenStreetMap | |
| **Testing** | Jest + Playwright + k6 | |
| **CI/CD** | GitHub Actions | |
| **Containers** | Docker + Docker Compose | |
| **Proxy** | Nginx | |
| **Monitoring** | Sentry | |
| **Monorepo** | Turborepo + npm workspaces | |

---

## 6. Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Node.js** | 18.x | 20.x |
| **npm** | 9.x | 10.x |
| **Docker** | 20.x | Latest |
| **Docker Compose** | 2.x | Latest |
| **Git** | 2.x | Latest |
| **OS** | Linux, macOS, WSL2 | Ubuntu 22/24 |
| **RAM** | 4 GB | 8 GB |
| **Disk** | 2 GB | 5 GB |

---

## 7. Installation & Setup

### Option A: Local Development (Recommended for Development)

```bash
# 1. Clone the repository
git clone https://github.com/vpbgkt/hotel-booking.git
cd hotel-booking

# 2. Start PostgreSQL and Redis
docker compose up postgres redis -d

# 3. Wait for services to be healthy
docker compose ps  # Ensure both show "healthy"

# 4. Install all dependencies (monorepo root)
npm install

# 5. Set up the API environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env if needed (defaults work for local dev)

# 6. Set up the Web environment
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local if needed (defaults work for local dev)

# 7. Generate Prisma client
cd apps/api
npx prisma generate

# 8. Push schema to database
npx prisma db push

# 9. Seed the database with sample data
npx prisma db seed

# 10. Go back to root
cd ../..

# 11. Start the API server
npm run dev:api
# → API running at http://localhost:4000/graphql
# → Swagger docs at http://localhost:4000/api/docs

# 12. In another terminal, start the web app
npm run dev:web
# → Web running at http://localhost:3000
```

### Option B: Full Docker Stack

```bash
# 1. Clone and enter directory
git clone https://github.com/vpbgkt/hotel-booking.git
cd hotel-booking

# 2. Start everything (Postgres, Redis, API, Web)
docker compose up -d

# 3. Seed the database (first time only)
docker compose exec api npx prisma db push
docker compose exec api npx prisma db seed

# 4. Access services
#    Web:      http://localhost:3000
#    API:      http://localhost:4000/graphql
#    Swagger:  http://localhost:4000/api/docs
#    Adminer:  http://localhost:8080  (with --profile tools)
```

### Option C: Production Deployment

See [Section 18: Production Deployment](#18-production-deployment).

### Verify Installation

After starting both servers:

```bash
# Check API health
curl http://localhost:4000/health
# → {"status":"ok","timestamp":"...","uptime":...}

# Check GraphQL
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ hotels(filter: { isActive: true }) { id name } }"}'
# → {"data":{"hotels":[...]}}

# Check Web
open http://localhost:3000
# → BlueStay homepage with featured hotels
```

---

## 8. Configuration Reference

### API Environment Variables (`apps/api/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | ✅ | — | Redis connection string |
| `REDIS_HOST` | | `localhost` | Redis host (used by BullMQ) |
| `REDIS_PORT` | | `6379` | Redis port |
| `REDIS_PASSWORD` | | — | Redis password |
| `JWT_SECRET` | ✅ | — | JWT access token secret (64+ chars) |
| `JWT_REFRESH_SECRET` | ✅ | — | JWT refresh token secret (64+ chars) |
| `JWT_EXPIRES_IN` | | `15m` | Access token expiry |
| `NODE_ENV` | | `development` | Environment (`development` / `production`) |
| `PORT` | | `4000` | API server port |
| **Payment** | | | |
| `RAZORPAY_KEY_ID` | | — | Razorpay API key (from dashboard.razorpay.com) |
| `RAZORPAY_KEY_SECRET` | | — | Razorpay secret key |
| **Email** | | | |
| `SMTP_HOST` | | — | SMTP server (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | | `587` | SMTP port |
| `SMTP_USER` | | — | SMTP username |
| `SMTP_PASS` | | — | SMTP password |
| `SMTP_FROM` | | — | From address (e.g., `BlueStay <noreply@bluestay.in>`) |
| **Google OAuth** | | | |
| `GOOGLE_CLIENT_ID` | | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | | — | OAuth callback URL |
| **Push Notifications** | | | |
| `VAPID_PUBLIC_KEY` | | — | VAPID public key (generate with `web-push generate-vapid-keys`) |
| `VAPID_PRIVATE_KEY` | | — | VAPID private key |
| `VAPID_SUBJECT` | | — | VAPID subject (e.g., `mailto:admin@bluestay.in`) |
| **SMS/WhatsApp** | | | |
| `MSG91_AUTH_KEY` | | — | MSG91 authentication key |
| `MSG91_SENDER_ID` | | — | MSG91 sender ID (6 chars) |
| `MSG91_TEMPLATE_ID` | | — | MSG91 SMS template ID |
| `MSG91_WHATSAPP_FROM` | | — | WhatsApp Business number |
| **File Storage** | | | |
| `UPLOAD_PROVIDER` | | `local` | Storage provider: `local` or `s3` |
| `S3_BUCKET` | | — | S3/R2 bucket name |
| `S3_REGION` | | `ap-south-1` | AWS region |
| `S3_ENDPOINT` | | — | Custom endpoint (for Cloudflare R2) |
| `S3_ACCESS_KEY_ID` | | — | AWS access key |
| `S3_SECRET_ACCESS_KEY` | | — | AWS secret key |
| `S3_PUBLIC_URL` | | — | Public URL prefix for uploaded files |
| **Error Tracking** | | | |
| `SENTRY_DSN` | | — | Sentry DSN for error reporting |

### Web Environment Variables (`apps/web/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | — | GraphQL endpoint URL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | — | Frontend base URL |
| `API_URL` | | same as above | Server-side API URL (for SSR) |
| `NEXT_PUBLIC_RAZORPAY_KEY` | | — | Razorpay publishable key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | | — | Google OAuth client ID |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | | — | VAPID public key for push subscriptions |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | | — | Google Analytics ID |
| `NEXT_PUBLIC_GTM_ID` | | — | Google Tag Manager ID |
| `NEXT_PUBLIC_ENABLE_HOURLY_BOOKING` | | `true` | Feature flag: hourly bookings |
| `NEXT_PUBLIC_ENABLE_REVIEWS` | | `true` | Feature flag: guest reviews |
| `NEXT_PUBLIC_CDN_URL` | | — | CDN URL for images |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | | `localhost` | Allowed image domains |
| `SENTRY_DSN` | | — | Sentry DSN for frontend errors |
| `SENTRY_ORG` | | — | Sentry organization slug |
| `SENTRY_PROJECT` | | — | Sentry project name |

---

## 9. User Roles & Credentials

### Roles

| Role | Access | Scope |
|------|--------|-------|
| **Guest** | Browse hotels, book rooms, write reviews, manage profile | Own bookings only |
| **HotelStaff** | Check-in/out guests, view bookings | Assigned hotel only |
| **HotelAdmin** | Full hotel management, pricing, analytics | Assigned hotel only |
| **PlatformAdmin** | Manage all hotels, commissions, platform analytics | Everything |

### Seed Data Credentials (Development)

After running `npx prisma db seed`, these users are available:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Platform Admin** | `admin@bluestay.in` | `password123` | Access to `/platform-admin` |
| **Hotel Admin** | `admin@radhikaresort.in` | `password123` | Manages Radhika Resort. Access to `/admin` |
| **Hotel Staff** | `staff@radhikaresort.in` | `password123` | Front desk staff for Radhika Resort |
| **Guest** | `guest@example.com` | `password123` | Has sample bookings and reviews |

### How to Login

1. Go to `http://localhost:3000/auth/login`
2. Enter email and password
3. Based on role, you'll be redirected to:
   - **Guest** → `/dashboard`
   - **HotelAdmin/HotelStaff** → `/admin`
   - **PlatformAdmin** → `/platform-admin`

### Accessing Admin Pages Directly

| Page | URL | Required Role |
|------|-----|---------------|
| Hotel Admin Dashboard | `/admin` | HotelAdmin, HotelStaff |
| Hotel Bookings | `/admin/bookings` | HotelAdmin, HotelStaff |
| Hotel Rooms | `/admin/rooms` | HotelAdmin |
| Smart Pricing | `/admin/smart-pricing` | HotelAdmin |
| Hotel Analytics | `/admin/analytics` | HotelAdmin |
| Hotel Reviews | `/admin/reviews` | HotelAdmin |
| Hotel Settings | `/admin/settings` | HotelAdmin |
| Gallery Manager | `/admin/gallery` | HotelAdmin |
| SEO Settings | `/admin/seo` | HotelAdmin |
| Blog Manager | `/admin/blog` | HotelAdmin |
| Walk-in Booking | `/admin/walk-in` | HotelAdmin, HotelStaff |
| Payment Tracking | `/admin/payments` | HotelAdmin |
| Branding | `/admin/branding` | HotelAdmin |
| API Keys | `/admin/api-keys` | HotelAdmin |
| Platform Dashboard | `/platform-admin` | PlatformAdmin |
| All Hotels | `/platform-admin/hotels` | PlatformAdmin |
| Commissions | `/platform-admin/commissions` | PlatformAdmin |
| Platform Analytics | `/platform-admin/analytics` | PlatformAdmin |
| Moderation | `/platform-admin/moderation` | PlatformAdmin |

---

## 10. Multi-Tenant Routing

BlueStay supports three types of requests:

### 1. Aggregator (bluestay.in)
- Default mode — all traffic not matched to a specific hotel
- Headers: `x-tenant-type: aggregator`
- Shows the full hotel listing, search, comparisons

### 2. White-Label Hotel (radhikaresort.in)
- Domain-based routing in Next.js middleware
- Headers: `x-tenant-type: hotel`, `x-hotel-id: <hotel-uuid>`
- Shows only that hotel's branding, rooms, and booking flow

### 3. Admin
- Path-based routing (`/admin`, `/platform-admin`)
- Uses JWT + role checks for authorization
- Admin pages work on any domain

### Configuring Custom Domains

Currently, the domain → hotel mapping is in [apps/web/src/middleware.ts](apps/web/src/middleware.ts):

```typescript
const HOTEL_DOMAIN_MAP: Record<string, string> = {
  'radhikaresort.in': 'uuid-of-radhika-resort',
  'www.radhikaresort.in': 'uuid-of-radhika-resort',
  'mountainview.bluestay.in': 'uuid-of-mountain-view',
};
```

**To add a new hotel domain:**
1. Add the domain mapping to `HOTEL_DOMAIN_MAP` in middleware.ts
2. Configure DNS (A record or CNAME pointing to your server)
3. Add the domain to Nginx server blocks
4. Set up SSL (Let's Encrypt / certbot)

> **Note**: For a production system, this map should be loaded from Redis/database dynamically. This is noted as a future improvement.

---

## 11. Using the Platform

### As a Guest

1. **Browse hotels** at `http://localhost:3000/hotels`
2. **Filter** by city, dates, guests, price range
3. **View hotel details** — click any hotel card
4. **Select a room** and dates
5. **Book** — choose daily or hourly (if supported)
6. **Pay** — Razorpay or Demo gateway (dev mode)
7. **Get confirmation** with downloadable invoice PDF
8. **Manage bookings** at `/dashboard/bookings`
9. **Write reviews** after checkout at `/dashboard/reviews`

### As a Hotel Admin

1. **Login** with hotel admin credentials
2. **Dashboard** (`/admin`) shows today's revenue, check-ins, occupancy
3. **Manage rooms** (`/admin/rooms`) — create room types, set prices, manage inventory
4. **View bookings** (`/admin/bookings`) — confirm, check-in, check-out, cancel
5. **Set pricing** (`/admin/smart-pricing`) — get AI-based pricing suggestions
6. **Reply to reviews** (`/admin/reviews`)
7. **Upload photos** (`/admin/gallery`)
8. **Write blog posts** (`/admin/blog`)
9. **Configure SEO** (`/admin/seo`) — meta tags, OpenGraph, JSON-LD
10. **Handle walk-ins** (`/admin/walk-in`) — quick front-desk booking
11. **Manage API keys** (`/admin/api-keys`) — generate keys for external integrations

### As a Platform Admin

1. **Login** with platform admin credentials
2. **Dashboard** (`/platform-admin`) shows platform-wide metrics
3. **Manage hotels** (`/platform-admin/hotels`) — activate, suspend, edit commission rates
4. **Track commissions** (`/platform-admin/commissions`) — view, settle, handle disputes
5. **View analytics** (`/platform-admin/analytics`) — revenue trends, top performers
6. **Moderate content** (`/platform-admin/moderation`)

### Hotel Self-Service Onboarding

Hotels can register themselves:
1. Visit `http://localhost:3000/onboard`
2. Fill in hotel details (name, address, rooms, etc.)
3. Platform admin reviews and activates the listing
4. Hotel admin account is created automatically

---

## 12. API Documentation

### GraphQL Playground
- URL: `http://localhost:4000/graphql`
- Interactive query editor with autocomplete
- Schema explorer in the sidebar

### Swagger REST Docs
- URL: `http://localhost:4000/api/docs`
- Documents REST endpoints (health, uploads, webhooks, invoices)
- Try endpoints directly from the browser

### Key GraphQL Operations

**Authentication:**
```graphql
# Register new account
mutation {
  register(input: {
    email: "user@example.com"
    password: "SecurePass123"
    name: "John Doe"
    phone: "9876543210"
  }) {
    accessToken
    refreshToken
    user { id email name role }
  }
}

# Login
mutation {
  login(input: {
    email: "guest@example.com"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user { id email name role }
  }
}

# OTP Login (step 1: request OTP)
mutation { requestOTP(phone: "9876543210") }

# OTP Login (step 2: verify OTP)
mutation {
  verifyOTP(input: { phone: "9876543210", otp: "123456" }) {
    accessToken user { id }
  }
}
```

**Hotel Search:**
```graphql
# Search hotels
query {
  hotels(filter: {
    city: "Mandarmani"
    isActive: true
    minRating: 3
  }) {
    id name slug city starRating
    roomTypes { id name basePrice }
  }
}

# Get hotel by slug
query {
  hotelBySlug(slug: "radhika-resort") {
    id name description address city
    roomTypes {
      id name basePrice maxOccupancy amenities
    }
    reviews { id rating comment userName }
  }
}
```

**Bookings (requires auth token):**
```graphql
# Create daily booking
mutation {
  createDailyBooking(input: {
    hotelId: "..."
    roomTypeId: "..."
    checkIn: "2026-04-01T14:00:00Z"
    checkOut: "2026-04-03T12:00:00Z"
    guests: 2
    guestName: "John Doe"
    guestEmail: "john@example.com"
    guestPhone: "9876543210"
  }) {
    id bookingNumber status totalAmount
  }
}

# Get my bookings
query {
  myBookings {
    id bookingNumber status checkIn checkOut
    totalAmount hotel { name } roomType { name }
  }
}
```

### HTTP Headers for Tenant Context
```
Authorization: Bearer <jwt-token>
x-tenant-type: aggregator | hotel
x-hotel-id: <hotel-uuid>
```

### API Keys for External Integrations

Hotel owners can generate API keys to power custom frontends, mobile apps, or self-hosted sites.

**Generate an API key** from the admin dashboard at `/admin/api-keys`, or via GraphQL:

```graphql
mutation {
  generateApiKey(input: {
    hotelId: "your-hotel-id"
    name: "Production Site"
    permissions: [READ_HOTEL, READ_ROOMS, READ_AVAILABILITY, CREATE_BOOKING]
    rateLimitPerMinute: 60
    allowedOrigins: ["https://myhotel.com"]
  }) {
    plainTextKey   # Shown only once — store securely
    apiKey { id keyPrefix permissions }
  }
}
```

**Use the API key** via the `x-api-key` header:

```bash
curl -X POST https://api.bluestay.in/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: bsk_your_key_here" \
  -d '{"query":"{ hotel(id: \"your-hotel-id\") { name roomTypes { name basePriceDaily } } }"}'
```

**Available permissions:**

| Permission | Description |
|------------|-------------|
| `READ_HOTEL` | Hotel info, theme, branding |
| `READ_ROOMS` | Room types, amenities, images |
| `READ_AVAILABILITY` | Inventory, pricing per date |
| `READ_REVIEWS` | Guest reviews and ratings |
| `READ_BOOKINGS` | List bookings (admin) |
| `CREATE_BOOKING` | Create new bookings (checkout) |
| `MANAGE_BOOKINGS` | Update booking status |
| `MANAGE_ROOMS` | Create/update room types |
| `MANAGE_INVENTORY` | Update pricing/availability |

**Key management operations:** list keys, revoke, rotate, delete — all available at `/admin/api-keys`.

### Starter Kit (Self-Hosting)

Download a pre-configured Next.js starter project for your hotel:

```
GET /api/export/:hotelId/starter-kit
```

Or from UI: `Admin → Settings → Client Handoff / Source Export`.

Download options:
- `Starter Kit`: Next.js source package for hotel website + `.env.example`
- `Static ZIP`: static HTML/CSS export

Safe sharing checklist:
- Share: starter/static ZIP + hotel-scoped API key + hotel ID
- Do not share: platform DB URL, Redis URL, JWT secrets
- Hotel admin for custom domain is available at `https://<hotel-domain>/admin` (example: `https://radhikaresort.in/admin`)

The ZIP contains a working Next.js app with:
- API client pre-configured with your hotel ID and API URL
- Home page with hotel info and room listing
- Ready to deploy to Vercel, Netlify, or any Node.js host

---

## 13. Payment Gateway Setup

### Razorpay (Production)

1. Create account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Get API keys from Settings → API Keys
3. Configure in `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx
   ```
4. Set up webhook:
   - URL: `https://api.bluestay.in/api/payments/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`, `refund.processed`

### Demo Gateway (Development)

When Razorpay keys are empty, the system automatically uses a **Demo Gateway** that:
- Creates mock payment orders
- Auto-approves all payments
- Sets "demo" as the gateway ID
- Perfect for development and testing

No configuration needed — it's the default.

### Payment Flow

```
Guest selects room → CreateBooking → Booking (PENDING)
  → Razorpay order created → Guest pays via Razorpay checkout
    → Webhook: payment.captured → Booking (CONFIRMED)
    → Commission calculated and recorded
```

---

## 14. Email & Notifications

### Email (SMTP)

Configure any SMTP provider:

```env
# Gmail (enable "App Passwords" in Google Account)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=BlueStay <noreply@bluestay.in>

# Amazon SES
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIA...
SMTP_PASS=...
SMTP_FROM=BlueStay <noreply@bluestay.in>
```

When SMTP is not configured, emails are logged to console in development.

### SMS / WhatsApp (MSG91)

```env
MSG91_AUTH_KEY=your-auth-key
MSG91_SENDER_ID=BSTAY
MSG91_TEMPLATE_ID=your-template-id
MSG91_WHATSAPP_FROM=919876543210
```

When MSG91 is not configured, messages are logged as `[DRY RUN]`.

### Web Push Notifications

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys
```

Add to API `.env`:
```env
VAPID_PUBLIC_KEY=BPxxxxxxxx...
VAPID_PRIVATE_KEY=xxxxxxxx...
VAPID_SUBJECT=mailto:admin@bluestay.in
```

Add to Web `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxxxxxxxx...
```

---

## 15. File Uploads & Storage

### Local Storage (Default)

Files are stored in `apps/api/uploads/` and served at `http://localhost:4000/uploads/`.

Subdirectories:
- `uploads/hotels/` — Hotel logos and hero images
- `uploads/rooms/` — Room type photos
- `uploads/gallery/` — Hotel gallery images
- `uploads/avatars/` — User profile pictures

### S3/R2 Cloud Storage

```env
UPLOAD_PROVIDER=s3
S3_BUCKET=bluestay-media
S3_REGION=ap-south-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://media.bluestay.in

# For Cloudflare R2:
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
```

### Upload Limits

- Max file size: **5 MB**
- Allowed types: JPEG, PNG, WebP, GIF
- Max files per request: **10**

---

## 16. Database Management

### Prisma Commands

```bash
cd apps/api

# Generate client after schema changes
npx prisma generate

# Push schema to database (dev only)
npx prisma db push

# Seed with sample data
npx prisma db seed

# Open Prisma Studio (visual DB editor)
npx prisma studio
# → Opens at http://localhost:5555

# Reset database (drops all data)
npx prisma db push --force-reset
npx prisma db seed
```

### Database Backup

```bash
# Local backup
./scripts/backup.sh

# Backup + upload to S3
./scripts/backup.sh --upload-s3

# Custom retention (keep 30 days)
./scripts/backup.sh --retention 30

# Restore from backup
./scripts/restore.sh backups/bluestay_20260301_020000.sql.gz

# Restore from S3
./scripts/restore.sh --from-s3 bluestay_20260301_020000.sql.gz
```

### Direct Database Access

| Method | URL/Command |
|--------|-------------|
| **Adminer** (GUI) | `docker compose --profile tools up adminer -d` → `http://localhost:8080` |
| **Prisma Studio** | `cd apps/api && npx prisma studio` → `http://localhost:5555` |
| **psql** (CLI) | `docker compose exec postgres psql -U bluestay -d bluestay` |

### Seed Data Summary

The seed script creates:

| Entity | Count | Examples |
|--------|-------|---------|
| Hotels | 3 | Radhika Resort, Mountain View Lodge, City Central Hotel |
| Room Types | 5 | Deluxe Room, Super Deluxe, Suite, etc. |
| Physical Rooms | 30 | Room 101-110, 201-210, etc. |
| Room Inventory | 30 days | Per room type per date with base prices |
| Users | 4 | Platform admin, hotel admin, staff, guest |
| Bookings | 2 | Sample confirmed bookings with payments |
| Reviews | 1 | Sample 5-star review |
| SEO Metadata | 1 | For Radhika Resort |
| Media | 5 | Sample gallery images |

---

## 17. Testing

### Unit Tests (API)

```bash
cd apps/api

# Run all tests
npm test

# Run specific test file
npx jest --testPathPattern auth

# Run with coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

**Current test suites:**
| Suite | Tests | Module |
|-------|-------|--------|
| `auth.service.spec.ts` | 12 | Authentication (register, login, OTP, refresh) |
| `booking.service.spec.ts` | 10 | Booking engine (create, cancel, modify) |
| `admin.service.spec.ts` | 10 | Hotel admin (dashboard, stats, management) |
| `notification.service.spec.ts` | 8 | Email + push notifications |
| **Total** | **40** | |

### E2E Tests (Playwright)

```bash
# Install browsers (first time)
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test tests/e2e/booking-flow.spec.ts
```

### Load Tests (k6)

```bash
# Install k6
# macOS: brew install k6
# Ubuntu: sudo apt install k6

# Booking flow simulation
k6 run tests/load/k6-booking-flow.js

# Stress test
k6 run tests/load/k6-stress-test.js

# Custom parameters
k6 run --vus 100 --duration 5m tests/load/k6-booking-flow.js

# Against staging server
API_URL=https://api.staging.bluestay.in k6 run tests/load/k6-booking-flow.js
```

---

## 18. Production Deployment

### Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **OS** | Ubuntu 22.04 | Ubuntu 24.04 |
| **Domain** | 1 (bluestay.in) | + subdomains + hotel domains |

### Step-by-Step

```bash
# 1. Clone on server
git clone https://github.com/vpbgkt/hotel-booking.git
cd hotel-booking

# 2. Create production env
cp .env.production.example .env.production
nano .env.production
# Fill in ALL required values:
#   - Strong passwords for Postgres + Redis
#   - JWT secrets (generate with: openssl rand -hex 32)
#   - Razorpay keys
#   - SMTP credentials
#   - Domain configuration

# 3. Build and start
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 4. Run initial database setup
docker compose -f docker-compose.prod.yml exec api npx prisma db push
docker compose -f docker-compose.prod.yml exec api npx prisma db seed

# 5. Set up SSL (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d bluestay.in -d www.bluestay.in -d api.bluestay.in
# Copy certs to nginx/certs/

# 6. Set up cron for backups
crontab -e
# Add: 0 2 * * * /path/to/hotel-booking/scripts/backup.sh --upload-s3 >> /var/log/bluestay-backup.log 2>&1

# 7. Set up cron for cert renewal
# Add: 0 0 1 * * certbot renew --quiet
```

### DNS Configuration

| Record | Name | Value |
|--------|------|-------|
| A | `bluestay.in` | `<server-ip>` |
| A | `www.bluestay.in` | `<server-ip>` |
| A | `api.bluestay.in` | `<server-ip>` |
| CNAME | `*.bluestay.in` | `bluestay.in` |

For hotel custom domains, add A records pointing to the same server IP.

### Nginx Configuration

The production docker-compose includes Nginx with:
- SSL termination
- Rate limiting (10 req/s per IP)
- Gzip compression
- Security headers
- Proxy to API (port 4000) and Web (port 3000)

Configuration files:
- `nginx/nginx.conf` — Main config
- `nginx/conf.d/api.conf` — API server block
- `nginx/conf.d/web.conf` — Web server block

---

## 19. Monitoring & Observability

### Sentry (Error Tracking)

1. Create project at [sentry.io](https://sentry.io)
2. Configure:
   ```env
   # API
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   
   # Web
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ORG=your-org
   SENTRY_PROJECT=bluestay-web
   ```

### Health Checks

| Endpoint | Method | Response |
|----------|--------|----------|
| `/health` | GET | `{"status":"ok","timestamp":"...","uptime":...}` |
| `/graphql` | POST | GraphQL introspection |

### Logs

```bash
# API logs
docker compose logs -f api

# Web logs
docker compose logs -f web

# All services
docker compose logs -f
```

### Database Monitoring

```bash
# Active connections
docker compose exec postgres psql -U bluestay -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
docker compose exec postgres psql -U bluestay -c "SELECT pg_size_pretty(pg_database_size('bluestay'));"

# Slow queries
docker compose exec postgres psql -U bluestay -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## 20. Project Structure

```
hotel-booking/
├── apps/
│   ├── api/                          # NestJS GraphQL API
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema (609 lines, 16 models)
│   │   │   └── seed.ts               # Sample data seeder (551 lines)
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── decorators/       # @CurrentHotel, @GqlCurrentHotel
│   │   │   │   ├── filters/          # Sentry exception filter
│   │   │   │   ├── guards/           # RolesGuard, TenantGuard
│   │   │   │   └── interceptors/     # AuditLog interceptor
│   │   │   ├── modules/
│   │   │   │   ├── admin/            # Hotel admin + platform admin (4 files)
│   │   │   │   ├── analytics/        # Revenue, occupancy, booking analytics
│   │   │   │   ├── auth/             # JWT, OTP, Google OAuth, guards
│   │   │   │   ├── blog/             # Blog posts CRUD
│   │   │   │   ├── booking/          # Booking engine + invoice PDF
│   │   │   │   ├── commission/       # Commission tracking + settlement
│   │   │   │   ├── hotel/            # Hotel CRUD + search
│   │   │   │   ├── notification/     # Email + push + SMS/WhatsApp
│   │   │   │   ├── payment/          # Razorpay + Demo gateway + webhooks
│   │   │   │   ├── pricing/          # Smart pricing engine
│   │   │   │   ├── prisma/           # Prisma service
│   │   │   │   ├── queue/            # BullMQ job processing
│   │   │   │   ├── redis/            # Redis service (cache + locks)
│   │   │   │   ├── review/           # Guest reviews + ratings
│   │   │   │   ├── room/             # Room types + inventory
│   │   │   │   ├── upload/           # File upload (local + S3)
│   │   │   │   └── user/             # User profile management
│   │   │   ├── app.module.ts         # Root module (17 modules)
│   │   │   ├── main.ts               # Bootstrap + Swagger
│   │   │   ├── schema.gql            # Auto-generated GraphQL schema
│   │   │   └── sentry.ts             # Sentry configuration
│   │   └── Dockerfile
│   │
│   └── web/                          # Next.js 15 Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (aggregator)/     # Hotel search + detail pages
│       │   │   ├── admin/            # Hotel admin dashboard (15 pages)
│       │   │   ├── auth/             # Login + register
│       │   │   ├── blog/             # Public blog
│       │   │   ├── booking/          # Booking + payment flow
│       │   │   ├── dashboard/        # Guest dashboard (5 pages)
│       │   │   ├── hotel/            # White-label hotel pages (8 pages)
│       │   │   ├── onboard/          # Hotel self-service onboarding
│       │   │   ├── platform-admin/   # Platform admin (5 pages)
│       │   │   └── sections/         # Homepage sections
│       │   ├── components/
│       │   │   ├── booking/          # Booking widget, calendar, search
│       │   │   ├── hotel/            # Hotel card
│       │   │   ├── hotels/           # Hotel grid, filters, gallery
│       │   │   ├── layout/           # Header, footer
│       │   │   ├── map/              # Leaflet map
│       │   │   ├── pwa/              # Push notifications, service worker
│       │   │   ├── reviews/          # Review form, review section
│       │   │   ├── rooms/            # Room card
│       │   │   ├── tenant/           # Tenant header/footer
│       │   │   └── ui/               # Badge, button, card, input, etc.
│       │   ├── lib/
│       │   │   ├── auth/             # Auth context + hooks
│       │   │   ├── graphql/          # Apollo client + queries + mutations
│       │   │   └── tenant/           # Tenant context
│       │   └── middleware.ts          # Domain-based tenant routing
│       └── Dockerfile
│
├── packages/
│   ├── types/                        # Shared TypeScript types + Zod schemas
│   ├── utils/                        # Shared utilities (currency, dates, etc.)
│   ├── config/                       # Platform constants
│   └── ui/                           # Shared React components
│
├── tests/
│   ├── e2e/                          # Playwright E2E tests
│   └── load/                         # k6 load test configs
│
├── scripts/
│   ├── backup.sh                     # Database backup (local + S3)
│   └── restore.sh                    # Database restore
│
├── nginx/                            # Reverse proxy configuration
│   ├── nginx.conf
│   └── conf.d/
│
├── .github/workflows/ci.yml          # GitHub Actions CI
├── docker-compose.yml                # Development stack
├── docker-compose.prod.yml           # Production stack
├── .env.production.example           # Production env template
├── plan.md                           # Full project plan (1,201 lines)
└── turbo.json                        # Turborepo config
```

---

## 21. Current Status & Remaining Work

### What's Complete (✅)

| Area | Status | Notes |
|------|--------|-------|
| Database schema (16 models) | ✅ | Full schema with indexes and relations |
| API — 15 NestJS modules | ✅ | Auth, booking, hotel, room, payment, admin, review, commission, analytics, notification, pricing, blog, upload, queue, user |
| Frontend — 48 pages | ✅ | Aggregator, hotel admin, guest dashboard, white-label, platform admin, blog, onboarding |
| GraphQL API (code-first) | ✅ | 1,458 line auto-generated schema |
| JWT + OTP + Google OAuth | ✅ | Full auth flow with refresh tokens |
| Razorpay + Demo gateway | ✅ | Payments with webhook verification |
| Booking engine (daily + hourly) | ✅ | Redis locks, inventory management |
| Smart pricing | ✅ | Occupancy-based suggestions |
| Commission tracking | ✅ | Settlement, disputes, trends |
| Analytics | ✅ | Revenue, occupancy, bookings, guests |
| Blog system | ✅ | CRUD with frontend pages |
| Review system | ✅ | Star ratings, moderation |
| File uploads | ✅ | Local + S3/R2 providers |
| Email + Push + SMS | ✅ | Nodemailer, web-push, MSG91 |
| Multi-tenant middleware | ✅ | Domain-based routing |
| Docker (dev + prod) | ✅ | Compose files + Dockerfiles |
| Nginx reverse proxy | ✅ | Rate limiting, gzip, SSL |
| CI pipeline | ✅ | GitHub Actions |
| Unit tests (40 passing) | ✅ | Auth, booking, admin, notification |
| E2E tests (Playwright) | ✅ | Health, auth, booking flow, homepage |
| Load tests (k6) | ✅ | Booking flow + stress test |
| Swagger API docs | ✅ | At /api/docs |
| Backup/restore scripts | ✅ | PostgreSQL dump + S3 upload |
| Shared packages | ✅ | Types, utils, config, UI components |
| Guards & decorators | ✅ | RBAC + tenant isolation |
| SEO (sitemap, robots, meta) | ✅ | Dynamic generation |
| PWA support | ✅ | Manifest + offline page |
| Invoice PDF | ✅ | Downloadable PDF per booking |
| Walk-in booking | ✅ | Front desk booking form |
| Auto-refund | ✅ | Configurable cancellation window |
| Booking modification | ✅ | Date changes, room upgrades |
| Sentry integration | ✅ | API + Web error tracking |
| Hotel onboarding page | ✅ | Self-service form |

### What Could Be Improved (🔧)

These are **optional enhancements** — the platform is functional without them:

| Item | Priority | Description |
|------|----------|-------------|
| More unit tests | Medium | Currently 4 of 15 API modules have tests. Adding tests for payment, hotel, room, pricing, commission, blog would improve confidence. |
| Prisma migrations | High | Currently using `db push` (dev mode). For production, run `npx prisma migrate dev` to create proper migration history. |
| Dynamic domain routing | Medium | The hotel domain map is hardcoded in middleware.ts. For scale, load from Redis/database. |
| Email HTML templates | Low | Currently sends plain text. Adding HTML templates with branding would improve user experience. |
| Frontend tests | Low | No React component tests yet. Consider adding Vitest + React Testing Library. |
| CD pipeline | Medium | CI builds and tests but doesn't auto-deploy. Add deployment stage for staging/production. |
| Full-text search | Low | Hotel search uses Prisma queries. Typesense/Elasticsearch would improve search quality at scale. |
| SSL automation | Medium | Nginx certs directory is empty. Set up certbot for auto-renewal. |
| Frontend animations | Low | Framer Motion is installed but not used for page transitions. |

---

## Appendix: Quick Commands Reference

```bash
# ── Development ──────────────────────────
npm run dev:api                    # Start API (port 4000)
npm run dev:web                    # Start Web (port 3000)
docker compose up postgres redis -d # Start DB + cache

# ── Database ─────────────────────────────
cd apps/api
npx prisma generate                # Regenerate client
npx prisma db push                 # Push schema changes
npx prisma db seed                 # Seed sample data
npx prisma studio                  # Visual DB editor
npx prisma db push --force-reset   # Reset database

# ── Testing ──────────────────────────────
cd apps/api && npm test            # Unit tests
npx playwright test                # E2E tests
k6 run tests/load/k6-booking-flow.js  # Load test

# ── Production ───────────────────────────
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
./scripts/backup.sh --upload-s3    # Database backup
./scripts/restore.sh backups/latest.sql.gz  # Restore

# ── Utilities ────────────────────────────
npx web-push generate-vapid-keys   # Generate push keys
openssl rand -hex 32               # Generate JWT secret
curl http://localhost:4000/health   # Health check
```

---

*Last updated: March 2, 2026*
