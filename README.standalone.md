# Hotel Booking - Standalone Platform

Welcome to your standalone hotel booking platform. This bundle allows you to host your own dedicated hotel booking API, frontend, cache, and database on your own domain completely separately from any other tenant.

## Requirements
- Docker Compose v2 (Docker Desktop or Linux CLI)
- Node.js > 18.0.0 (if developing locally)

## Quick Start (Production/Deployment)

1. Unzip the codebase onto your server.
2. Initialize environment:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` fields heavily:
   - Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to random hashes!
   - Change `POSTGRES_PASSWORD` and `REDIS_PASSWORD`.
   - Update `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` to match your domain (e.g. `https://your-hotel.com`).
4. Boot the platform:
   ```bash
   docker compose up -d --build
   ```

## Included Services
The standard Docker compose boot involves:
- **web**: Next.js App Router (localhost:3000)
- **api**: NestJS GraphQL API (localhost:4000)
- **postgres**: Relational data store (5432)
- **redis**: Edge-caching and state (session/ttl) logic (6379)

These are secured automatically internally on the `hotel-net` Docker network bridge.

## Local Development (Without Docker)

If you wish to modify code locally before deploying to Docker:
```bash
# Provide dev DB configs
cp .env.example .env

# Install pnpm and dependencies
npm i -g pnpm
pnpm install

# Start development database
docker compose -f docker-compose.yml up postgres redis -d

# Start turborepo development
pnpm run dev
```

### Accessing the Platform Admin (Aggregator Context Removed)
Because this platform is un-tethered from the multi-tenant SaaS provider, you represent the global platform administrator. Log in primarily on your local or public URL to configure your hotel settings directly without interference.
