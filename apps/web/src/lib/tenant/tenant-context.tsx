'use client';

/**
 * Hotel Tenant Context
 * Provides hotel data and theme configuration to all tenant pages.
 * For dev/demo, we resolve tenant by slug query parameter or use first hotel.
 */

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_HOTEL_BY_SLUG_TENANT } from '@/lib/graphql/queries/tenant';

interface RoomTypeInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePriceDaily: number;
  basePriceHourly?: number | null;
  maxGuests: number;
  maxExtraGuests: number;
  extraGuestCharge: number;
  totalRooms: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
}

export interface TenantHotel {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  averageRating?: number;
  reviewCount?: number;
  heroImageUrl?: string;
  logoUrl?: string;
  galleryImages?: string[];
  startingPrice?: number;
  startingHourlyPrice?: number;
  bookingModel: 'DAILY' | 'HOURLY' | 'BOTH';
  checkInTime?: string;
  checkOutTime?: string;
  hourlyMinHours?: number;
  hourlyMaxHours?: number;
  amenities?: string[];
  policies?: string[];
  themeConfig?: ThemeConfig;
  isFeatured?: boolean;
  isVerified?: boolean;
  roomTypes?: RoomTypeInfo[];
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerStyle?: 'light' | 'dark' | 'transparent';
  heroStyle?: 'full' | 'split' | 'minimal';
}

interface TenantContextType {
  hotel: TenantHotel | null;
  loading: boolean;
  error?: string;
  theme: ThemeConfig;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  headerStyle: 'transparent',
  heroStyle: 'full',
};

const TenantContext = createContext<TenantContextType>({
  hotel: null,
  loading: true,
  theme: DEFAULT_THEME,
});

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

/**
 * Apply CSS custom properties based on hotel theme config
 */
function applyTheme(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  if (theme.primaryColor) {
    root.style.setProperty('--tenant-primary', theme.primaryColor);
    // Generate lighter/darker shades
    root.style.setProperty('--tenant-primary-light', `${theme.primaryColor}20`);
    root.style.setProperty('--tenant-primary-dark', theme.secondaryColor || theme.primaryColor);
  }
  if (theme.accentColor) {
    root.style.setProperty('--tenant-accent', theme.accentColor);
  }
  if (theme.fontFamily) {
    root.style.setProperty('--tenant-font', theme.fontFamily);
  }
}

// In dev, we default to "radhika-resort" slug
const DEFAULT_SLUG = 'radhika-resort';

export function TenantProvider({ 
  children, 
  slug 
}: { 
  children: ReactNode;
  slug?: string;
}) {
  const hotelSlug = slug || DEFAULT_SLUG;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(GET_HOTEL_BY_SLUG_TENANT, {
    variables: { slug: hotelSlug },
    fetchPolicy: 'cache-and-network',
  });

  const hotel: TenantHotel | null = data?.hotelBySlug || null;
  const theme = { ...DEFAULT_THEME, ...(hotel?.themeConfig as ThemeConfig || {}) };

  useEffect(() => {
    applyTheme(theme);
  }, [theme.primaryColor, theme.secondaryColor, theme.accentColor]);

  return (
    <TenantContext.Provider
      value={{
        hotel,
        loading,
        error: error?.message,
        theme,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
