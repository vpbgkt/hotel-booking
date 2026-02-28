'use client';

/**
 * Platform Admin - Commissions Management
 * View, filter, and settle commissions from hotel bookings
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  PLATFORM_COMMISSIONS,
  SETTLE_COMMISSION,
  BULK_SETTLE_COMMISSIONS,
} from '@/lib/graphql/queries/platform-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  IndianRupee,
  Loader2,
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Filter,
} from 'lucide-react';

interface CommissionEntry {
  id: string;
  hotelId: string;
  hotelName?: string;
  bookingId: string;
  bookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  settledAt?: string;
  createdAt: string;
  bookingInfo?: {
    bookingNumber?: string;
    totalAmount?: number;
    status?: string;
    guestName?: string;
  };
}

export default function PlatformCommissionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const limit = 25;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error, refetch } = useQuery<any>(PLATFORM_COMMISSIONS, {
    variables: {
      filters: {
        ...(statusFilter && { status: statusFilter }),
        page,
        limit,
      },
    },
  });

  const [settleCommission, { loading: settling }] = useMutation(SETTLE_COMMISSION, {
    onCompleted: () => refetch(),
  });

  const [bulkSettle, { loading: bulkSettling }] = useMutation(BULK_SETTLE_COMMISSIONS, {
    onCompleted: () => {
      setSelectedIds(new Set());
      refetch();
    },
  });

  const commissions: CommissionEntry[] = data?.platformCommissions?.commissions || [];
  const total = data?.platformCommissions?.total || 0;
  const totalCommissionAmount = data?.platformCommissions?.totalCommissionAmount || 0;
  const totalBookingAmount = data?.platformCommissions?.totalBookingAmount || 0;
  const hasMore = data?.platformCommissions?.hasMore || false;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    const pending = commissions.filter((c) => c.status === 'PENDING').map((c) => c.id);
    setSelectedIds(new Set(pending));
  };

  const handleBulkSettle = () => {
    if (selectedIds.size === 0) return;
    bulkSettle({ variables: { commissionIds: Array.from(selectedIds) } });
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Commission</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalCommissionAmount.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Booking Value</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalBookingAmount.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Commission Records</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Bulk actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-900"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SETTLED">Settled</option>
              </select>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleBulkSettle}
                  disabled={bulkSettling}
                >
                  {bulkSettling ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <CheckCheck size={14} className="mr-1" />
                  )}
                  Settle Selected
                </Button>
              </div>
            )}

            {commissions.some((c) => c.status === 'PENDING') && selectedIds.size === 0 && (
              <Button type="button" size="sm" variant="outline" onClick={selectAllPending}>
                Select All Pending
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && commissions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">{error.message}</p>
        </div>
      )}

      {/* Commissions table */}
      {!loading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) selectAllPending();
                        else setSelectedIds(new Set());
                      }}
                      checked={
                        selectedIds.size > 0 &&
                        commissions
                          .filter((c) => c.status === 'PENDING')
                          .every((c) => selectedIds.has(c.id))
                      }
                    />
                  </th>
                  <th className="text-left px-4 py-3">Hotel</th>
                  <th className="text-left px-4 py-3">Booking</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Rate</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {c.status === 'PENDING' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {c.hotelName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">
                        {c.bookingInfo?.bookingNumber || c.bookingId.slice(0, 8)}
                      </div>
                      {c.bookingInfo?.guestName && (
                        <div className="text-xs text-gray-400">{c.bookingInfo.guestName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₹{c.bookingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Math.round(c.commissionRate * 100)}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      ₹{c.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          c.status === 'SETTLED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {c.status === 'SETTLED' ? (
                          <Check size={10} className="mr-1" />
                        ) : (
                          <Clock size={10} className="mr-1" />
                        )}
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {format(new Date(c.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'PENDING' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={settling}
                          onClick={() =>
                            settleCommission({ variables: { commissionId: c.id } })
                          }
                        >
                          <Check size={12} className="mr-1" />
                          Settle
                        </Button>
                      )}
                      {c.status === 'SETTLED' && c.settledAt && (
                        <span className="text-xs text-gray-400">
                          {format(new Date(c.settledAt), 'dd MMM')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {commissions.length === 0 && (
            <div className="text-center py-12">
              <IndianRupee className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Commissions</h3>
              <p className="text-gray-500 text-sm mt-1">
                Commission records will appear here after bookings are made through BlueStay.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 flex items-center px-3">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
