/**
 * Robots.txt - BlueStay
 * Next.js metadata file API for robots.txt
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bluestay.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/auth/', '/api/', '/platform-admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
