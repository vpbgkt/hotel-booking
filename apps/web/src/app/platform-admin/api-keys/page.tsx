'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import {
  PLATFORM_API_KEYS,
  PLATFORM_TOGGLE_API_KEY,
  PLATFORM_DELETE_API_KEY,
} from '@/lib/graphql/queries/platform-admin';
import { useState } from 'react';
import {
  Key,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
} from 'lucide-react';

interface ApiKeyHotel {
  name: string;
  slug: string;
}

interface ApiKeyEntry {
  id: string;
  hotelId: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  rateLimitPerMinute: number;
  allowedOrigins: string[];
  lastUsedAt: string | null;
  requestCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  hotel: ApiKeyHotel;
}

export default function PlatformApiKeysPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<any>(PLATFORM_API_KEYS, {
    variables: {
      filters: {
        page,
        limit: 20,
        ...(search && { search }),
        ...(activeFilter !== undefined && { isActive: activeFilter }),
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [toggleKey, { loading: toggling }] = useMutation<any>(PLATFORM_TOGGLE_API_KEY, {
    onCompleted: () => refetch(),
  });

  const [deleteKey, { loading: deleting }] = useMutation<any>(PLATFORM_DELETE_API_KEY, {
    onCompleted: () => {
      setDeleteConfirm(null);
      refetch();
    },
  });

  const keys: ApiKeyEntry[] = data?.platformApiKeys?.keys || [];
  const total: number = data?.platformApiKeys?.total || 0;
  const hasMore: boolean = data?.platformApiKeys?.hasMore || false;

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage API keys across all hotels on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or key prefix..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={activeFilter === undefined ? '' : activeFilter.toString()}
              onChange={(e) => {
                setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </select>
            <button
              onClick={() => refetch()}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Keys</div>
          <div className="text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {keys.filter((k) => k.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Disabled</div>
          <div className="text-2xl font-bold text-red-600">
            {keys.filter((k) => !k.isActive).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && keys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="animate-spin mx-auto mb-3" size={24} />
            Loading API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Key className="mx-auto mb-3 text-gray-300" size={32} />
            <p>No API keys found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Key</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Hotel</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Permissions</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Usage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{key.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{key.keyPrefix}...</div>
                      <div className="text-xs text-gray-400">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{key.hotel.name}</div>
                      <div className="text-xs text-gray-500">{key.hotel.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium"
                          >
                            {p.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {key.permissions.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                            +{key.permissions.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Rate: {key.rateLimitPerMinute}/min
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{key.requestCount.toLocaleString()} requests</div>
                      <div className="text-xs text-gray-500">
                        {key.lastUsedAt
                          ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                          : 'Never used'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isExpired(key.expiresAt) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                          <AlertTriangle size={12} /> Expired
                        </span>
                      ) : key.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <Shield size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <ShieldOff size={12} /> Disabled
                        </span>
                      )}
                      {key.expiresAt && !isExpired(key.expiresAt) && (
                        <div className="text-[10px] text-gray-400 mt-1">
                          Expires {new Date(key.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            toggleKey({
                              variables: { keyId: key.id, isActive: !key.isActive },
                            })
                          }
                          disabled={toggling}
                          className={`p-1.5 rounded-lg text-sm transition-colors ${
                            key.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={key.isActive ? 'Disable' : 'Enable'}
                        >
                          {key.isActive ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                        {deleteConfirm === key.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                deleteKey({ variables: { keyId: key.id } })
                              }
                              disabled={deleting}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(key.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Page {page} &middot; {total} total keys
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
