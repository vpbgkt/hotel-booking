'use client';

/**
 * Platform Admin Dashboard - BlueStay
 * Platform-wide stats: total hotels, revenue, bookings, commissions
 */

import { useQuery } from '@apollo/client/react';
import { PLATFORM_DASHBOARD_STATS } from '@/lib/graphql/queries/platform-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Hotel,
  IndianRupee,
  CalendarCheck,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  AlertCircle,
  BedDouble,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CHECKED_IN: 'bg-green-100 text-green-800',
  CHECKED_OUT: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
};

export default function PlatformDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(PLATFORM_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  const stats = data?.platformDashboardStats;

  const statCards = [
    {
      label: 'Total Hotels',
      value: stats?.totalHotels || 0,
      sub: `${stats?.activeHotels || 0} active`,
      icon: Hotel,
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      label: 'Monthly Revenue',
      value: `₹${(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`,
      sub: `Total: ₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Monthly Bookings',
      value: stats?.monthlyBookings || 0,
      sub: (
        <span className="flex items-center gap-1">
          {stats?.bookingGrowth >= 0 ? (
            <TrendingUp size={12} className="text-green-600" />
          ) : (
            <TrendingDown size={12} className="text-red-600" />
          )}
          {stats?.bookingGrowth >= 0 ? '+' : ''}
          {stats?.bookingGrowth || 0}% vs last month
        </span>
      ),
      icon: CalendarCheck,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Total Guests',
      value: stats?.totalGuests || 0,
      sub: `${stats?.totalBookings || 0} total bookings`,
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Total Commissions',
      value: `₹${(stats?.totalCommissions || 0).toLocaleString('en-IN')}`,
      sub: `₹${(stats?.pendingCommissions || 0).toLocaleString('en-IN')} pending`,
      icon: IndianRupee,
      color: 'text-amber-600 bg-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
                </div>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hotels */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Hotels</CardTitle>
              <Link
                href="/platform-admin/hotels"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.recentHotels || []).map(
                (hotel: {
                  id: string;
                  name: string;
                  city: string;
                  state: string;
                  isActive: boolean;
                  bookingsCount: number;
                  roomTypesCount: number;
                  createdAt: string;
                }) => (
                  <div
                    key={hotel.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{hotel.name}</div>
                      <div className="text-xs text-gray-500">
                        {hotel.city}, {hotel.state}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <BedDouble size={10} /> {hotel.roomTypesCount} rooms
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarCheck size={10} /> {hotel.bookingsCount} bookings
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        hotel.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ),
              )}
              {(stats?.recentHotels || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No hotels yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <Link
                href="/platform-admin/commissions"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                Commissions <ArrowRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.recentBookings || []).map(
                (booking: {
                  id: string;
                  bookingNumber: string;
                  status: string;
                  totalAmount: number;
                  checkIn: string;
                  hotel?: { name: string };
                  guest?: { name: string };
                  createdAt: string;
                }) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {booking.bookingNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.hotel?.name} &middot; {booking.guest?.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-gray-900">
                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </div>
                      <Badge className={statusColors[booking.status] || 'bg-gray-100 text-gray-800'}>
                        {booking.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ),
              )}
              {(stats?.recentBookings || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
