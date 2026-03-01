# BlueStay — Multi-Tenant Hotel Booking Platform

A full-stack, production-ready hotel reservation system built as a multi-tenant SaaS platform. Hotels get their own white-label booking websites while guests discover and book through a central aggregator (like Booking.com / OYO).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (SSL)                          │
│              bluestay.in │ api.bluestay.in                  │
└────────┬────────────────────────────────┬───────────────────┘
         │                                │
┌────────▼────────┐              ┌────────▼────────┐
│   Next.js 15    │  ◄──gql──►  │   NestJS 10     │
│   (Frontend)    │              │   (GraphQL API) │
│   Port 3000     │              │   Port 4000     │
└─────────────────┘              └────────┬────────┘
                                          │
                               ┌──────────┴──────────┐
                               │                      │
                        ┌──────▼──────┐       ┌───────▼──────┐
                        │ PostgreSQL  │       │   Redis 7    │
                        │     16      │       │  (Cache/Lock)│
                        └─────────────┘       └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4, Apollo Client |
| Backend | NestJS 10, GraphQL (code-first), Prisma ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (caching, session, distributed locks) |
| Auth | JWT (access + refresh tokens), OTP via Redis |
| Email | Nodemailer (SMTP configurable) |
| Testing | Jest + ts-jest + @nestjs/testing |
| CI/CD | GitHub Actions |
| Infra | Docker, Nginx, multi-stage builds |

## Features

### Aggregator Platform (bluestay.in)
- Hotel search with city/date/guest filters
- Hotel detail pages with room types, pricing, reviews
- Guest registration, login, OTP authentication
- Booking engine with real-time availability
- Guest dashboard (bookings, reviews, profile)
- SEO: dynamic sitemap, robots.txt, JSON-LD structured data
- PWA manifest + mobile optimizations

### Hotel Admin Dashboard (/admin)
- Dashboard with revenue, occupancy, booking stats
- Hotel settings (info, booking model, check-in/out times)
- Room type CRUD with inventory management
- Booking management (confirm, check-in, check-out, cancel)
- Calendar view with date-level pricing/availability
- Smart pricing engine with occupancy-based suggestions
- Guest management and review moderation
- Payment gateway configuration (Razorpay/Stripe)
- Analytics with revenue trends and room performance

### Platform Admin (/platform-admin)
- Multi-hotel management (activate, suspend, edit)
- Commission tracking and settlement (single + bulk)
- Platform-wide analytics and revenue dashboard
- CMS for aggregator content management
- User management across all roles

### White-Label Hotel Sites (custom domains)
- Tenant-specific branding with hotel data
- Room listing, gallery, amenities, location
- Direct booking flow
- Guest reviews and ratings
- JSON-LD structured data per hotel

### Booking Engine
- Daily + hourly booking support
- Redis distributed locks for double-booking prevention
- Inventory management with date-level overrides
- Smart pricing with demand/seasonal adjustments
- Commission calculation for BlueStay bookings
- Tax (GST) calculation
- Booking lifecycle: PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT

### Security
- JWT authentication with refresh token rotation
- Rate limiting (API + login endpoints)
- CORS with origin whitelist
- Input validation (class-validator + whitelist mode)
- Helmet security headers
- Redis-backed session management

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/hotel-booking.git
cd hotel-booking

# Start database and cache
docker compose up postgres redis -d

# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env

# Generate Prisma client and push schema
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
cd ../..

# Start development servers
npm run dev:api   # API on http://localhost:4000/graphql
npm run dev:web   # Web on http://localhost:3000
```

### Docker Development (all services)
```bash
docker compose up -d
# API: http://localhost:4000/graphql
# Web: http://localhost:3000
# Adminer: http://localhost:8080 (with --profile tools)
```

### Production Deployment
```bash
# Configure environment
cp .env.production.example .env.production
# Edit .env.production with real values

# Run migrations
docker compose -f docker-compose.prod.yml --profile migrate run migrate

# Build and start
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Test Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | admin@bluestay.in | password123 |
| Hotel Admin | admin@radhikaresort.in | password123 |
| Guest | guest@example.com | password123 |

## Running Tests

```bash
cd apps/api

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Project Structure

```
hotel-booking/
├── apps/
│   ├── api/                    # NestJS GraphQL API
│   │   ├── prisma/             # Schema + migrations + seed
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # JWT auth, OTP, registration
│   │   │   │   ├── admin/      # Hotel admin + platform admin
│   │   │   │   ├── booking/    # Booking engine (daily + hourly)
│   │   │   │   ├── hotel/      # Hotel entities + public queries
│   │   │   │   ├── notification/ # Email notifications (SMTP)
│   │   │   │   ├── pricing/    # Smart pricing engine
│   │   │   │   ├── prisma/     # Prisma service
│   │   │   │   ├── redis/      # Redis service (cache + locks)
│   │   │   │   ├── review/     # Guest reviews + ratings
│   │   │   │   └── user/       # User entities
│   │   │   └── main.ts
│   │   └── Dockerfile
│   └── web/                    # Next.js 15 frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (aggregator)/ # Public hotel search + detail
│       │   │   ├── admin/        # Hotel admin dashboard (11 pages)
│       │   │   ├── auth/         # Login + register pages
│       │   │   ├── dashboard/    # Guest dashboard
│       │   │   ├── hotel/        # White-label tenant pages
│       │   │   ├── platform-admin/ # Super admin (5 pages)
│       │   │   └── sections/     # Homepage sections
│       │   ├── components/ui/    # Shared UI components
│       │   ├── contexts/         # Auth + tenant context
│       │   └── lib/graphql/      # GraphQL queries + mutations
│       └── Dockerfile
├── nginx/                      # Nginx reverse proxy config
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
└── .github/workflows/ci.yml   # GitHub Actions CI
```

## Environment Variables

### API (`apps/api/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| REDIS_URL | Redis connection string | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| CORS_ORIGINS | Allowed origins (comma-separated) | - |
| SMTP_HOST | SMTP server host | - |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_USER | SMTP username | - |
| SMTP_PASS | SMTP password | - |

### Web (`apps/web/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | GraphQL endpoint URL | - |
| NEXT_PUBLIC_SITE_URL | Frontend base URL | - |

## API Overview

The API exposes a single GraphQL endpoint at `/graphql`. Key operations:

**Public Queries**
- `hotels` — Search/filter hotels with pagination
- `hotel(slug)` — Hotel detail with rooms + reviews
- `featuredHotels` — Homepage featured hotels

**Auth Mutations**
- `register` / `login` / `requestOTP` / `verifyOTP`
- `refreshToken` / `changePassword`

**Guest Operations**
- `createDailyBooking` / `createHourlyBooking`
- `cancelBooking` / `myBookings`
- `createReview` / `myReviews`

**Hotel Admin**
- `adminDashboardStats` / `adminAnalytics`
- `updateHotel` / CRUD room types / calendar inventory
- `adminBookings` with status management

**Platform Admin**
- `platformDashboardStats` / `platformAnalytics`
- `platformHotels` / `platformToggleHotel`
- `platformCommissions` / `platformSettleCommission`

## License

Private — All rights reserved.
