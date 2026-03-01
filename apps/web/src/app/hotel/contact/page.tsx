'use client';

/**
 * Hotel Tenant — Contact Page
 */

import { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/lib/tenant/tenant-context';

export default function TenantContactPage() {
  const { hotel, loading, theme } = useTenant();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the message via API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  if (loading || !hotel) {
    return (
      <div className="min-h-screen pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="py-12 text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor || '#2563eb'}, ${theme.secondaryColor || '#1e40af'})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-white/80">We&apos;d love to hear from you</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{hotel.name}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor || '#2563eb' }} />
                  <div>
                    <p className="font-medium text-gray-900">{hotel.address}</p>
                    <p className="text-sm text-gray-600">{hotel.city}, {hotel.state} — {hotel.pincode}</p>
                  </div>
                </div>
                {hotel.phone && (
                  <a href={`tel:${hotel.phone}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Phone className="w-5 h-5 flex-shrink-0" style={{ color: theme.primaryColor || '#2563eb' }} />
                    <span className="text-gray-700">{hotel.phone}</span>
                  </a>
                )}
                {hotel.email && (
                  <a href={`mailto:${hotel.email}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Mail className="w-5 h-5 flex-shrink-0" style={{ color: theme.primaryColor || '#2563eb' }} />
                    <span className="text-gray-700">{hotel.email}</span>
                  </a>
                )}
                {hotel.whatsapp && (
                  <a
                    href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <MessageCircle className="w-5 h-5 flex-shrink-0" style={{ color: theme.primaryColor || '#2563eb' }} />
                    <span className="text-gray-700">WhatsApp: {hotel.whatsapp}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: theme.primaryColor || '#2563eb' }} />
                Front Desk Hours
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Front Desk</span>
                  <span className="font-medium text-gray-900">24 hours</span>
                </li>
                <li className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-medium text-gray-900">{hotel.checkInTime || '2:00 PM'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-medium text-gray-900">{hotel.checkOutTime || '11:00 AM'}</span>
                </li>
              </ul>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Map will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h2>

            {submitted && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-center gap-2 text-sm">
                <Check className="w-5 h-5" />
                Thank you! Your message has been sent. We&apos;ll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Your name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: theme.primaryColor || undefined }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
