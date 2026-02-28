'use client';

/**
 * Platform Admin - Analytics
 * Platform-wide revenue, top hotels, booking sources, city performance
 */

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { PLATFORM_ANALYTICS } from '@/lib/graphql/queries/platform-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Hotel,
  MapPin,
  BarChart3,
} from 'lucide-react';

interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
}

interface TopHotel {
  hotelId: string;
  hotelName: string;
  city: string;
  totalRevenue: number;
  totalBookings: number;
}

interface SourceDist {
  source: string;
  count: number;
  revenue: number;
}

interface CityPerf {
  city: string;
  bookings: number;
  revenue: number;
}

export default function PlatformAnalyticsPage() {
  const [months, setMonths] = useState(6);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(PLATFORM_ANALYTICS, {
    variables: { months },
  });

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  const analytics = data?.platformAnalytics;
  const monthlyRevenue: MonthlyData[] = analytics?.monthlyRevenue || [];
  const topHotels: TopHotel[] = analytics?.topHotels || [];
  const sourceDistribution: SourceDist[] = analytics?.sourceDistribution || [];
  const cityPerformance: CityPerf[] = analytics?.cityPerformance || [];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);
  const maxBookings = Math.max(...monthlyRevenue.map((m) => m.bookings), 1);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Period:</span>
        {[3, 6, 12].map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={months === m ? 'default' : 'outline'}
            onClick={() => setMonths(m)}
          >
            {m} months
          </Button>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={18} /> Revenue & Bookings Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {/* Revenue bars */}
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">Revenue</div>
                <div className="flex items-end gap-2 h-40">
                  {monthlyRevenue.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="text-[10px] text-gray-500 mb-1">
                        ₹{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(0)}K` : m.revenue}
                      </div>
                      <div
                        className="w-full bg-indigo-500 rounded-t min-h-[2px] transition-all"
                        style={{
                          height: `${(m.revenue / maxRevenue) * 100}%`,
                        }}
                      />
                      <div className="text-[10px] text-gray-400 mt-1 truncate max-w-full">
                        {m.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bookings bars */}
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">Bookings</div>
                <div className="flex items-end gap-2 h-28">
                  {monthlyRevenue.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="text-[10px] text-gray-500 mb-1">{m.bookings}</div>
                      <div
                        className="w-full bg-green-500 rounded-t min-h-[2px] transition-all"
                        style={{
                          height: `${(m.bookings / maxBookings) * 100}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hotels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hotel size={18} /> Top Hotels by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topHotels.map((hotel, i) => {
                const maxHotelRevenue = Math.max(...topHotels.map((h) => h.totalRevenue), 1);
                return (
                  <div key={hotel.hotelId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div>
                        <span className="text-gray-400 mr-2">#{i + 1}</span>
                        <span className="font-medium text-gray-900">{hotel.hotelName}</span>
                        <span className="text-gray-400 ml-1">({hotel.city})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          ₹{hotel.totalRevenue.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {hotel.totalBookings} bookings
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 rounded-full h-2 transition-all"
                        style={{
                          width: `${(hotel.totalRevenue / maxHotelRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {topHotels.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} /> Booking Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sourceDistribution.map((src) => {
                const totalCount = sourceDistribution.reduce((s, d) => s + d.count, 0) || 1;
                const pct = Math.round((src.count / totalCount) * 100);
                return (
                  <div key={src.source}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {src.source?.replace('_', ' ').toLowerCase() || 'Unknown'}
                      </span>
                      <div className="text-right">
                        <span className="text-gray-900 font-medium">{src.count}</span>
                        <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
                        <span className="text-xs text-gray-400 ml-2">
                          ₹{src.revenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {sourceDistribution.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* City Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin size={18} /> City Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityPerformance.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-2">City</th>
                      <th className="text-right px-4 py-2">Bookings</th>
                      <th className="text-right px-4 py-2">Revenue</th>
                      <th className="text-right px-4 py-2">Avg per Booking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cityPerformance.map((city) => (
                      <tr key={city.city} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{city.city}</td>
                        <td className="px-4 py-2 text-right">{city.bookings}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          ₹{city.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-500">
                          ₹{city.bookings > 0
                            ? Math.round(city.revenue / city.bookings).toLocaleString('en-IN')
                            : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
