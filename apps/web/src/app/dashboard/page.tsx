'use client';

/**
 * Dashboard Overview Page - BlueStay
 * Shows summary of user's bookings, recent activity, and quick actions
 */

import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  ChevronRight,
  Hotel,
  TrendingUp,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data - will be replaced with real API calls
const stats = [
  { label: 'Total Bookings', value: '12', icon: CalendarDays, color: 'text-blue-600 bg-blue-100' },
  { label: 'Upcoming Stays', value: '2', icon: Clock, color: 'text-green-600 bg-green-100' },
  { label: 'Cities Visited', value: '8', icon: MapPin, color: 'text-purple-600 bg-purple-100' },
  { label: 'Reward Points', value: '2,450', icon: TrendingUp, color: 'text-orange-600 bg-orange-100' },
];

const recentBookings = [
  {
    id: '1',
    hotelName: 'Radhika Resort',
    location: 'Diu, Gujarat',
    checkIn: '2025-02-15',
    checkOut: '2025-02-18',
    status: 'upcoming',
    image: '/images/hotels/radhika-resort.jpg',
  },
  {
    id: '2',
    hotelName: 'Seaside Villa',
    location: 'Goa',
    checkIn: '2025-01-10',
    checkOut: '2025-01-12',
    status: 'completed',
    image: '/images/hotels/seaside-villa.jpg',
  },
];

const quickActions = [
  { label: 'Book a Hotel', href: '/hotels', icon: Hotel },
  { label: 'View Bookings', href: '/dashboard/bookings', icon: CalendarDays },
  { label: 'Leave a Review', href: '/dashboard/reviews', icon: Star },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-brand-100">
          Manage your bookings, explore new destinations, and earn rewards.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Link 
                href="/dashboard/bookings"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight size={16} />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center">
                        <Hotel size={24} className="text-brand-700" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{booking.hotelName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {booking.location}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(booking.checkIn).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short' 
                        })} - {new Date(booking.checkOut).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'upcoming'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Hotel size={48} className="mx-auto text-gray-300" />
                  <p className="mt-4 text-gray-500">No bookings yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/hotels">Book Your First Stay</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      {action.label}
                    </span>
                    <ChevronRight size={16} className="ml-auto text-gray-400" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Reward Points Card */}
          <Card className="border-0 shadow-sm mt-6 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <Star size={20} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">BlueStay Rewards</h3>
              </div>
              <p className="text-3xl font-bold text-amber-600">2,450</p>
              <p className="text-sm text-gray-600 mt-1">Points Available</p>
              <Button variant="outline" className="w-full mt-4">
                Redeem Points
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
