/**
 * Payment Page
 * /booking/[id]/payment - Handles payment for a booking
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaymentForm } from './payment-form';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Complete Your Payment - BlueStay',
  description: 'Securely complete your hotel booking payment',
};

// Mock booking data - In production, fetch from API
async function getBookingData(id: string) {
  // This would be a GraphQL query in production
  return {
    id,
    hotelName: 'Sample Hotel',
    roomName: 'Deluxe Room',
    checkInDate: '2024-12-20',
    checkOutDate: '2024-12-22',
    nights: 2,
    guestCount: 2,
    roomTotal: 5000,
    taxes: 900,
    total: 5900,
    status: 'PENDING_PAYMENT',
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const booking = await getBookingData(id);
  
  if (!booking) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Complete Your Booking
            </h1>
            <p className="text-gray-600 mb-8">
              You&apos;re just one step away from confirming your stay
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-3">
                <PaymentForm bookingId={id} amount={booking.total} />
              </div>
              
              {/* Booking Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Booking Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">{booking.hotelName}</p>
                      <p className="text-sm text-gray-500">{booking.roomName}</p>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in</span>
                        <span className="text-gray-900">{booking.checkInDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-out</span>
                        <span className="text-gray-900">{booking.checkOutDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Guests</span>
                        <span className="text-gray-900">{booking.guestCount}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Room ({booking.nights} night{booking.nights > 1 ? 's' : ''})
                        </span>
                        <span className="text-gray-900">
                          ₹{booking.roomTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span className="text-gray-900">
                          ₹{booking.taxes.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-gray-900">
                          ₹{booking.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🔒 Your payment is secured with 256-bit SSL encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
