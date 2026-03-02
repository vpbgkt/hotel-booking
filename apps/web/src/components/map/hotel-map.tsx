'use client';

/**
 * Hotel Map Component — Leaflet + OpenStreetMap
 * 
 * Displays hotel location on an interactive map with a marker and popup.
 * Uses free OpenStreetMap tiles (no API key required).
 */

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface HotelMapProps {
  latitude?: number;
  longitude?: number;
  hotelName?: string;
  address?: string;
  height?: string;
  className?: string;
}

export function HotelMap({
  latitude,
  longitude,
  hotelName = 'Hotel',
  address,
  height = '300px',
  className = '',
}: HotelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    let mapInstance: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Import leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Wait a bit for CSS to load
      await new Promise((r) => setTimeout(r, 100));

      if (!mapRef.current) return;

      // Clear any existing map
      mapRef.current.innerHTML = '';

      mapInstance = L.map(mapRef.current).setView([latitude, longitude], 15);

      // OpenStreetMap tiles (free, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Custom marker icon
      const icon = L.divIcon({
        html: `<div style="background: #2563eb; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>`,
        className: '',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([latitude, longitude], { icon }).addTo(mapInstance);

      // Popup with hotel info
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 180px;">
          <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${hotelName}</strong>
          ${address ? `<span style="font-size: 12px; color: #6b7280; display: block;">${address}</span>` : ''}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
             target="_blank" rel="noopener noreferrer"
             style="font-size: 12px; color: #2563eb; text-decoration: none; display: inline-block; margin-top: 6px;">
            Get Directions →
          </a>
        </div>
      `;
      marker.bindPopup(popupContent);

      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [latitude, longitude, hotelName, address]);

  // If no coordinates, show a fallback
  if (!latitude || !longitude) {
    return (
      <div
        className={`bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 ${className}`}
        style={{ height }}
      >
        <MapPin className="w-8 h-8 mb-2" />
        <p className="text-sm">Map location not available</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center text-gray-400">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
