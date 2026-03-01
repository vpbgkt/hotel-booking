'use client';

/**
 * Admin Branding & Theme Page - BlueStay
 * Customize hotel white-label appearance: colors, fonts, header style
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth/auth-context';
import { GET_HOTEL_BY_ID } from '@/lib/graphql/queries/hotels';
import { UPDATE_HOTEL } from '@/lib/graphql/queries/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  Type,
  Layout,
  Eye,
} from 'lucide-react';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'light' | 'dark' | 'transparent';
  heroStyle: 'full' | 'split' | 'minimal';
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  headerStyle: 'transparent',
  heroStyle: 'full',
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Poppins', label: 'Poppins (Clean)' },
  { value: 'Lora', label: 'Lora (Classic)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Merriweather', label: 'Merriweather (Traditional)' },
];

const PRESET_THEMES = [
  { name: 'BlueStay Default', primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' },
  { name: 'Emerald Resort', primary: '#059669', secondary: '#047857', accent: '#fbbf24' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#f97316' },
  { name: 'Crimson Luxury', primary: '#dc2626', secondary: '#b91c1c', accent: '#eab308' },
  { name: 'Ocean Teal', primary: '#0891b2', secondary: '#0e7490', accent: '#f59e0b' },
  { name: 'Midnight Gold', primary: '#1f2937', secondary: '#111827', accent: '#d97706' },
];

export default function AdminBrandingPage() {
  const { user } = useAuth();
  const hotelId = user?.hotelId;
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: hotelData, loading } = useQuery<any>(GET_HOTEL_BY_ID, {
    variables: { id: hotelId },
    skip: !hotelId,
  });

  const [updateHotel, { loading: saving }] = useMutation(UPDATE_HOTEL, {
    onCompleted: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    if (hotelData?.hotel?.themeConfig) {
      setTheme({ ...DEFAULT_THEME, ...hotelData.hotel.themeConfig });
    }
  }, [hotelData]);

  const handleSave = async () => {
    await updateHotel({
      variables: {
        input: {
          hotelId,
          themeConfig: theme,
        },
      },
    });
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  if (!hotelId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">No Hotel Assigned</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding & Theme</h1>
          <p className="text-gray-500 mt-1">Customize your hotel&apos;s white-label appearance</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Saved
            </div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Theme
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-600" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            {/* Preview Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                backgroundColor: theme.headerStyle === 'dark' ? theme.primaryColor : 
                                 theme.headerStyle === 'light' ? '#ffffff' : 'transparent',
                background: theme.headerStyle === 'transparent' 
                  ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                  : undefined,
              }}
            >
              <span
                className="font-bold text-lg"
                style={{
                  color: theme.headerStyle === 'light' ? theme.primaryColor : '#ffffff',
                  fontFamily: theme.fontFamily,
                }}
              >
                {hotelData?.hotel?.name || 'Your Hotel'}
              </span>
              <div className="flex gap-4 text-sm" style={{ color: theme.headerStyle === 'light' ? '#6b7280' : '#ffffffcc' }}>
                <span>Rooms</span>
                <span>Gallery</span>
                <span>Contact</span>
              </div>
            </div>
            {/* Preview Hero */}
            <div
              className="px-6 py-12 text-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}ee, ${theme.secondaryColor}ee)`,
              }}
            >
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: theme.fontFamily }}
              >
                Welcome to {hotelData?.hotel?.name || 'Your Hotel'}
              </h2>
              <p className="text-white/80 mb-4" style={{ fontFamily: theme.fontFamily }}>
                Your perfect stay awaits
              </p>
              <button
                className="px-6 py-2 rounded-lg font-medium text-sm"
                style={{
                  backgroundColor: theme.accentColor,
                  color: '#ffffff',
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Themes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-600" />
            Theme Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors group"
              >
                <div className="flex gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-600" />
            Custom Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="#2563eb"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="#1e40af"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  placeholder="#f59e0b"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="w-4 h-4 text-brand-600" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Family</label>
          <select
            value={theme.fontFamily}
            onChange={(e) => setTheme((prev) => ({ ...prev, fontFamily: e.target.value }))}
            className="w-full md:w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Applied to headings and navigation on your hotel website.
          </p>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Layout className="w-4 h-4 text-brand-600" />
            Layout Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
            <div className="flex gap-3">
              {(['transparent', 'dark', 'light'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setTheme((prev) => ({ ...prev, headerStyle: style }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    theme.headerStyle === style
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Section Style</label>
            <div className="flex gap-3">
              {(['full', 'split', 'minimal'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setTheme((prev) => ({ ...prev, heroStyle: style }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    theme.heroStyle === style
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
