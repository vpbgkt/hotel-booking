/**
 * Web App Manifest - BlueStay PWA
 * Next.js metadata file API for manifest.json
 */

import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BlueStay - Hotel Booking',
    short_name: 'BlueStay',
    description: 'Book hotels across India. Compare prices, read reviews, and get instant confirmation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    categories: ['travel', 'booking', 'hotels'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1280x720',
        type: 'image/png',
      },
    ],
  };
}
