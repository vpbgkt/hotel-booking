/**
 * Booking Confirmation Page
 * /booking/[id]/confirmation - Shows booking confirmation details
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Download,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Booking Confirmed - BlueStay',
  description: 'Your hotel booking has been confirmed',
};

// Mock booking data - In production, fetch from API
async function getBookingData(id: string) {
  return {
    id,
    confirmationNumber: `BS${id.toUpperCase().slice(0, 8)}`,
    status: 'CONFIRMED',
    hotel: {
      name: 'Radhika Beach Resort',
      address: '123 Beach Road, Porbandar',
      city: 'Porbandar',
      state: 'Gujarat',
      phone: '+91 98765 43210',
      email: 'contact@radhikaresort.com',
    },
    room: {
      name: 'Deluxe Sea View Room',
    },
    checkInDate: '2024-12-20',
    checkInTime: '2:00 PM',
    checkOutDate: '2024-12-22',
    checkOutTime: '11:00 AM',
    nights: 2,
    guestCount: 2,
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+91 98765 43210',
    roomTotal: 5000,
    taxes: 900,
    total: 5900,
    paymentMethod: 'Credit Card',
    paidAt: new Date().toISOString(),
  };
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;
  const booking = await getBookingData(id);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600">
                Your reservation has been successfully booked
              </p>
            </div>
            
            {/* Confirmation Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="bg-brand-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-100 text-sm">Confirmation Number</p>
                    <p className="text-xl font-bold tracking-wide">
                      {booking.confirmationNumber}
                    </p>
                  </div>
                  <div className="bg-white text-brand-600 px-3 py-1 rounded-full text-sm font-medium">
                    {booking.status}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Hotel Info */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {booking.hotel.name}
                  </h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{booking.hotel.address}, {booking.hotel.city}, {booking.hotel.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${booking.hotel.phone}`} className="text-brand-600 hover:underline">
                        {booking.hotel.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${booking.hotel.email}`} className="text-brand-600 hover:underline">
                        {booking.hotel.email}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Check-in */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        Check-in
                      </div>
                      <p className="font-semibold text-gray-900">{booking.checkInDate}</p>
                      <p className="text-sm text-gray-500">After {booking.checkInTime}</p>
                    </div>
                    
                    {/* Check-out */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        Check-out
                      </div>
                      <p className="font-semibold text-gray-900">{booking.checkOutDate}</p>
                      <p className="text-sm text-gray-500">Before {booking.checkOutTime}</p>
                    </div>
                    
                    {/* Room */}
                    <div>
                      <div className="text-gray-500 text-sm mb-1">Room Type</div>
                      <p className="font-semibold text-gray-900">{booking.room.name}</p>
                    </div>
                    
                    {/* Guests */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <User className="w-4 h-4" />
                        Guests
                      </div>
                      <p className="font-semibold text-gray-900">{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                
                {/* Guest Details */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Guest Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="text-gray-900 font-medium">{booking.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="text-gray-900">{booking.guestEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="text-gray-900">{booking.guestPhone}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Summary */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Room ({booking.nights} night{booking.nights > 1 ? 's' : ''})
                      </span>
                      <span className="text-gray-900">
                        ₹{booking.roomTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & fees</span>
                      <span className="text-gray-900">
                        ₹{booking.taxes.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-semibold text-gray-900">Total Paid</span>
                      <span className="font-bold text-gray-900">
                        ₹{booking.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Payment Method</span>
                      <span>{booking.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              <Link href="/bookings">
                <Button>View All Bookings</Button>
              </Link>
            </div>
            
            {/* Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-800">
                A confirmation email has been sent to <strong>{booking.guestEmail}</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
