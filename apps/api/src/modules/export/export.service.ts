import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

/**
 * Generates a self-contained static-site ZIP for a hotel.
 * Includes HTML pages, CSS, and hotel data as JSON.
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build ZIP for a hotel and return a readable stream
   */
  async buildSiteZip(hotelId: string): Promise<{ stream: PassThrough; filename: string }> {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        roomTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        media: { orderBy: { sortOrder: 'asc' } },
        seoMeta: true,
        reviews: {
          where: { isPublished: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { guest: { select: { name: true } } },
        },
      },
    });

    if (!hotel) throw new NotFoundException('Hotel not found');

    const passthrough = new PassThrough();
    const archive = archiver.default('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      this.logger.error(`Archive error for hotel ${hotelId}`, err);
      passthrough.destroy(err);
    });

    archive.pipe(passthrough);

    // CSS
    archive.append(this.generateCSS(hotel.themeConfig as any), { name: 'css/style.css' });

    // Main page
    archive.append(this.generateIndex(hotel), { name: 'index.html' });

    // Rooms page
    archive.append(this.generateRoomsPage(hotel), { name: 'rooms.html' });

    // Reviews page
    archive.append(this.generateReviewsPage(hotel), { name: 'reviews.html' });

    // Hotel data as JSON (for custom integrations)
    archive.append(JSON.stringify({ hotel, exportedAt: new Date().toISOString() }, null, 2), {
      name: 'data/hotel.json',
    });

    await archive.finalize();

    return { stream: passthrough, filename: `${hotel.slug}-site.zip` };
  }

  private generateCSS(theme: any): string {
    const primary = theme?.primaryColor || '#2563eb';
    const font = theme?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    return `
:root { --primary: ${primary}; --font: ${font}; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--font); color: #1f2937; background: #fff; line-height: 1.6; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
header { background: var(--primary); color: #fff; padding: 24px 0; }
header h1 { font-size: 28px; }
header p { opacity: 0.85; margin-top: 4px; }
nav { background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
nav a { margin-right: 24px; text-decoration: none; color: var(--primary); font-weight: 500; }
.hero { padding: 60px 0; text-align: center; background: #f3f4f6; }
.hero h2 { font-size: 36px; margin-bottom: 12px; }
.section { padding: 48px 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.card-body { padding: 20px; }
.card h3 { font-size: 20px; margin-bottom: 8px; }
.card .price { color: var(--primary); font-size: 24px; font-weight: 700; }
.card .amenities { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.card .amenities span { background: #eff6ff; color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 13px; }
.review { border-bottom: 1px solid #e5e7eb; padding: 20px 0; }
.review .stars { color: #f59e0b; }
.review .author { font-weight: 600; }
footer { background: #111827; color: #9ca3af; padding: 32px 0; text-align: center; font-size: 14px; }
`;
  }

  private pageWrapper(hotel: any, title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${hotel.name}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>${hotel.name}</h1>
      <p>${hotel.address}, ${hotel.city}, ${hotel.state}</p>
    </div>
  </header>
  <nav>
    <div class="container">
      <a href="index.html">Home</a>
      <a href="rooms.html">Rooms</a>
      <a href="reviews.html">Reviews</a>
    </div>
  </nav>
  ${content}
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${hotel.name}. All rights reserved.</p>
      <p style="margin-top:8px">${hotel.phone} &middot; ${hotel.email}</p>
    </div>
  </footer>
</body>
</html>`;
  }

  private generateIndex(hotel: any): string {
    const stars = '&#9733;'.repeat(hotel.starRating);
    const content = `
  <div class="hero">
    <div class="container">
      <h2>Welcome to ${hotel.name}</h2>
      <p style="font-size:18px;color:#6b7280">${stars} ${hotel.starRating}-Star Hotel in ${hotel.city}</p>
      <p style="margin-top:16px;max-width:600px;margin-left:auto;margin-right:auto;color:#4b5563">${hotel.description || ''}</p>
    </div>
  </div>
  <div class="section">
    <div class="container">
      <h2 style="margin-bottom:24px">Our Rooms</h2>
      <div class="grid">
        ${(hotel.roomTypes || []).slice(0, 3).map((rt: any) => `
        <div class="card">
          ${rt.images?.[0] ? `<img src="${rt.images[0]}" alt="${rt.name}" style="width:100%;height:200px;object-fit:cover">` : ''}
          <div class="card-body">
            <h3>${rt.name}</h3>
            <p class="price">&#8377;${rt.basePriceDaily.toLocaleString('en-IN')}<span style="font-size:14px;font-weight:400;color:#6b7280"> / night</span></p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
    return this.pageWrapper(hotel, 'Home', content);
  }

  private generateRoomsPage(hotel: any): string {
    const content = `
  <div class="section">
    <div class="container">
      <h2 style="margin-bottom:24px">Rooms &amp; Suites</h2>
      <div class="grid">
        ${(hotel.roomTypes || []).map((rt: any) => `
        <div class="card">
          ${rt.images?.[0] ? `<img src="${rt.images[0]}" alt="${rt.name}" style="width:100%;height:220px;object-fit:cover">` : ''}
          <div class="card-body">
            <h3>${rt.name}</h3>
            <p style="color:#6b7280;margin-bottom:12px">${rt.description || ''}</p>
            <p class="price">&#8377;${rt.basePriceDaily.toLocaleString('en-IN')}<span style="font-size:14px;font-weight:400;color:#6b7280"> / night</span></p>
            <p style="color:#6b7280;font-size:14px;margin-top:8px">Max guests: ${rt.maxGuests}</p>
            <div class="amenities">
              ${(rt.amenities || []).map((a: string) => `<span>${a}</span>`).join('')}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
    return this.pageWrapper(hotel, 'Rooms', content);
  }

  private generateReviewsPage(hotel: any): string {
    const content = `
  <div class="section">
    <div class="container">
      <h2 style="margin-bottom:24px">Guest Reviews</h2>
      ${(hotel.reviews || []).length === 0 ? '<p style="color:#6b7280">No reviews yet.</p>' : ''}
      ${(hotel.reviews || []).map((r: any) => `
      <div class="review">
        <p class="stars">${'&#9733;'.repeat(r.rating)}${'&#9734;'.repeat(5 - r.rating)}</p>
        <p class="author">${r.guest?.name || 'Guest'}</p>
        ${r.title ? `<p style="font-weight:600;margin-top:4px">${r.title}</p>` : ''}
        <p style="color:#4b5563;margin-top:4px">${r.comment || ''}</p>
        ${r.hotelReply ? `<p style="background:#f9fafb;padding:12px;border-radius:8px;margin-top:8px;font-size:14px"><strong>Hotel reply:</strong> ${r.hotelReply}</p>` : ''}
      </div>`).join('')}
    </div>
  </div>`;
    return this.pageWrapper(hotel, 'Reviews', content);
  }

  // =============================================================
  // Starter Kit: Next.js project template with API key integration
  // =============================================================

  async buildStarterKit(hotelId: string, apiUrl: string): Promise<{ stream: PassThrough; filename: string }> {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true, name: true, slug: true, city: true, state: true },
    });

    if (!hotel) throw new NotFoundException('Hotel not found');

    const passthrough = new PassThrough();
    const archive = archiver.default('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      this.logger.error(`Starter kit archive error for hotel ${hotelId}`, err);
      passthrough.destroy(err);
    });

    archive.pipe(passthrough);

    const slug = hotel.slug;

    // package.json
    archive.append(JSON.stringify({
      name: `${slug}-website`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        next: '^14.2.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        typescript: '^5.3.0',
        '@types/react': '^18.2.0',
        '@types/node': '^20.11.0',
      },
    }, null, 2), { name: `${slug}-starter/package.json` });

    // .env.local
    archive.append(
      `# BlueStay API Configuration\n` +
      `# Get your API key from the admin dashboard: /admin/api-keys\n` +
      `NEXT_PUBLIC_API_URL=${apiUrl}\n` +
      `NEXT_PUBLIC_HOTEL_ID=${hotelId}\n` +
      `API_KEY=bsk_your_api_key_here\n` +
      `NEXT_PUBLIC_ADMIN_PATH=/admin\n`,
      { name: `${slug}-starter/.env.local` },
    );

    // .env.example
    archive.append(
      `# Public API base URL (no trailing slash)\n` +
      `NEXT_PUBLIC_API_URL=https://api.bluestay.in\n` +
      `\n` +
      `# Hotel ID for this website (provided by BlueStay)\n` +
      `NEXT_PUBLIC_HOTEL_ID=hotel_xxxxxxxxx\n` +
      `\n` +
      `# Hotel-scoped API key (never commit real value)\n` +
      `API_KEY=bsk_xxxxxxxxxxxxxxxxxxxxxxxxx\n` +
      `\n` +
      `# Admin route path on hotel domain\n` +
      `NEXT_PUBLIC_ADMIN_PATH=/admin\n`,
      { name: `${slug}-starter/.env.example` },
    );

    // Client handoff guide
    archive.append(
      `# Client Handoff Guide\n\n` +
      `This starter is safe to share with a hotel client. It does not include BlueStay database credentials.\n\n` +
      `## What to Share\n` +
      `- Source code in this package\n` +
      `- A hotel-scoped API key\n` +
      `- The hotel's own HOTEL_ID\n\n` +
      `## What Not to Share\n` +
      `- Platform database URL\n` +
      `- Redis credentials\n` +
      `- Platform admin JWT secrets\n\n` +
      `## Setup\n` +
      `1. Copy .env.example to .env.local\n` +
      `2. Fill NEXT_PUBLIC_API_URL, NEXT_PUBLIC_HOTEL_ID, API_KEY\n` +
      `3. Run npm install\n` +
      `4. Run npm run dev\n\n` +
      `## Admin Access\n` +
      `- Hotel admin panel path: /admin\n` +
      `- On custom domain (e.g. radhikaresort.in/admin), only that hotel's users should have access\n`,
      { name: `${slug}-starter/CLIENT_HANDOFF.md` },
    );

    // tsconfig.json
    archive.append(JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        paths: { '@/*': ['./src/*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    }, null, 2), { name: `${slug}-starter/tsconfig.json` });

    // next.config.js
    archive.append(
      `/** @type {import('next').NextConfig} */\n` +
      `const nextConfig = {};\n` +
      `module.exports = nextConfig;\n`,
      { name: `${slug}-starter/next.config.js` },
    );

    // lib/api.ts — API client
    archive.append(
      `/**\n` +
      ` * BlueStay API Client\n` +
      ` * Fetches hotel data via the BlueStay GraphQL API using your API key.\n` +
      ` */\n\n` +
      `const API_URL = process.env.NEXT_PUBLIC_API_URL + '/graphql';\n` +
      `const API_KEY = process.env.API_KEY!;\n` +
      `const HOTEL_ID = process.env.NEXT_PUBLIC_HOTEL_ID!;\n\n` +
      `export async function query<T = any>(graphql: string, variables?: Record<string, any>): Promise<T> {\n` +
      `  const res = await fetch(API_URL, {\n` +
      `    method: 'POST',\n` +
      `    headers: {\n` +
      `      'Content-Type': 'application/json',\n` +
      `      'x-api-key': API_KEY,\n` +
      `    },\n` +
      `    body: JSON.stringify({ query: graphql, variables }),\n` +
      `    next: { revalidate: 300 }, // Cache for 5 min\n` +
      `  });\n\n` +
      `  const json = await res.json();\n` +
      `  if (json.errors) throw new Error(json.errors[0].message);\n` +
      `  return json.data;\n` +
      `}\n\n` +
      `export { HOTEL_ID };\n`,
      { name: `${slug}-starter/src/lib/api.ts` },
    );

    // app/layout.tsx
    archive.append(
      `import './globals.css';\n\n` +
      `export const metadata = {\n` +
      `  title: '${hotel.name}',\n` +
      `  description: 'Welcome to ${hotel.name} — ${hotel.city}, ${hotel.state}',\n` +
      `};\n\n` +
      `export default function RootLayout({ children }: { children: React.ReactNode }) {\n` +
      `  return (\n` +
      `    <html lang="en">\n` +
      `      <body>{children}</body>\n` +
      `    </html>\n` +
      `  );\n` +
      `}\n`,
      { name: `${slug}-starter/src/app/layout.tsx` },
    );

    // app/globals.css
    archive.append(
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n` +
      `body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }\n`,
      { name: `${slug}-starter/src/app/globals.css` },
    );

    // app/page.tsx — home page
    archive.append(
      `import { query, HOTEL_ID } from '@/lib/api';\n\n` +
      `async function getHotel() {\n` +
      `  const data = await query(\`\n` +
      `    query GetHotel($id: ID!) {\n` +
      `      hotel(id: $id) {\n` +
      `        id name description address city state phone email\n` +
      `        starRating heroImageUrl logoUrl\n` +
      `        roomTypes { id name description basePriceDaily maxGuests images amenities }\n` +
      `      }\n` +
      `    }\n` +
      `  \`, { id: HOTEL_ID });\n` +
      `  return data.hotel;\n` +
      `}\n\n` +
      `export default async function HomePage() {\n` +
      `  const hotel = await getHotel();\n\n` +
      `  return (\n` +
      `    <main className="min-h-screen">\n` +
      `      {/* Hero */}\n` +
      `      <section className="bg-gray-900 text-white py-20 px-4 text-center">\n` +
      `        <h1 className="text-4xl font-bold">{hotel.name}</h1>\n` +
      `        <p className="text-lg text-gray-300 mt-2">{hotel.city}, {hotel.state}</p>\n` +
      `        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">{hotel.description}</p>\n` +
      `      </section>\n\n` +
      `      {/* Rooms */}\n` +
      `      <section className="py-16 px-4 max-w-6xl mx-auto">\n` +
      `        <h2 className="text-3xl font-bold mb-8">Our Rooms</h2>\n` +
      `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">\n` +
      `          {hotel.roomTypes?.map((room: any) => (\n` +
      `            <div key={room.id} className="border rounded-xl overflow-hidden shadow-sm">\n` +
      `              {room.images?.[0] && (\n` +
      `                <img src={room.images[0]} alt={room.name} className="w-full h-48 object-cover" />\n` +
      `              )}\n` +
      `              <div className="p-4">\n` +
      `                <h3 className="text-xl font-semibold">{room.name}</h3>\n` +
      `                <p className="text-gray-500 text-sm mt-1">{room.description}</p>\n` +
      `                <p className="text-2xl font-bold text-blue-600 mt-3">\n` +
      `                  ₹{room.basePriceDaily.toLocaleString('en-IN')}\n` +
      `                  <span className="text-sm font-normal text-gray-400"> / night</span>\n` +
      `                </p>\n` +
      `              </div>\n` +
      `            </div>\n` +
      `          ))}\n` +
      `        </div>\n` +
      `      </section>\n\n` +
      `      {/* Footer */}\n` +
      `      <footer className="bg-gray-100 py-8 px-4 text-center text-gray-500 text-sm">\n` +
      `        <p>© ${new Date().getFullYear()} {hotel.name}. All rights reserved.</p>\n` +
      `        <p className="mt-1">{hotel.phone} · {hotel.email}</p>\n` +
      `      </footer>\n` +
      `    </main>\n` +
      `  );\n` +
      `}\n`,
      { name: `${slug}-starter/src/app/page.tsx` },
    );

    // README.md
    archive.append(
      `# ${hotel.name} — Website\n\n` +
      `A Next.js website powered by BlueStay API.\n\n` +
      `## Quick Start\n\n` +
      `1. Install dependencies:\n` +
      `   \`\`\`bash\n   npm install\n   \`\`\`\n\n` +
      `2. Get your API key from the admin dashboard at \`/admin/api-keys\`.\n\n` +
      `3. Update \`.env.local\` with your API key:\n` +
      `   \`\`\`\n   API_KEY=bsk_your_real_key\n   \`\`\`\n\n` +
      `4. Start the dev server:\n` +
      `   \`\`\`bash\n   npm run dev\n   \`\`\`\n\n` +
      `## API Reference\n\n` +
      `Your API key supports these queries:\n\n` +
      `| Query | Description |\n` +
      `|-------|-------------|\n` +
      `| \`hotel(id: ID!)\` | Hotel details, theme, branding |\n` +
      `| \`roomTypes(hotelId: ID!)\` | Room types, pricing, amenities |\n` +
      `| \`checkAvailability(...)\` | Check room availability |\n` +
      `| \`hotelReviews(hotelId: ID!)\` | Guest reviews |\n` +
      `| \`createDailyBooking(input)\` | Create a booking |\n\n` +
      `## Deployment\n\n` +
      `Deploy to Vercel, Netlify, or any Node.js host:\n\n` +
      `\`\`\`bash\nnpm run build\nnpm start\n\`\`\`\n\n` +
      `Set the same environment variables on your hosting platform.\n`,
      { name: `${slug}-starter/README.md` },
    );

    await archive.finalize();

    return { stream: passthrough, filename: `${slug}-starter-kit.zip` };
  }
}
