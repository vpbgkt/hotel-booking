'use client';

/**
 * Platform Admin - Review Moderation
 * Approve or delete pending reviews across all hotels
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  PLATFORM_PENDING_REVIEWS,
  APPROVE_REVIEW,
  DELETE_REVIEW,
} from '@/lib/graphql/queries/platform-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Star,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  MessageSquare,
  User,
  Hotel,
} from 'lucide-react';

interface PendingReview {
  id: string;
  hotelId: string;
  hotelName?: string;
  guestName?: string;
  guestEmail?: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
}

export default function PlatformModerationPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error, refetch } = useQuery<any>(PLATFORM_PENDING_REVIEWS, {
    variables: { page, limit },
  });

  const [approveReview, { loading: approving }] = useMutation(APPROVE_REVIEW, {
    onCompleted: () => refetch(),
  });

  const [deleteReview, { loading: deleting }] = useMutation(DELETE_REVIEW, {
    onCompleted: () => refetch(),
  });

  const reviews: PendingReview[] = data?.platformPendingReviews?.reviews || [];
  const total = data?.platformPendingReviews?.total || 0;
  const hasMore = data?.platformPendingReviews?.hasMore || false;

  if (loading && reviews.length === 0) {
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reviews</h2>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
          <p className="text-sm text-gray-500">{total} reviews awaiting moderation</p>
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Review content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }
                        />
                      ))}
                    </div>

                    {/* Hotel */}
                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                      <Hotel size={10} className="mr-1" />
                      {review.hotelName || 'Unknown Hotel'}
                    </Badge>
                  </div>

                  {review.title && (
                    <h3 className="font-medium text-gray-900 mb-1">{review.title}</h3>
                  )}

                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      {review.guestName || 'Anonymous'}
                      {review.guestEmail && ` (${review.guestEmail})`}
                    </span>
                    <span>{format(new Date(review.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    disabled={approving}
                    onClick={() =>
                      approveReview({ variables: { reviewId: review.id } })
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check size={14} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={deleting}
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this review? This cannot be undone.')
                      ) {
                        deleteReview({ variables: { reviewId: review.id } });
                      }
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {reviews.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
          <p className="text-gray-500 text-sm mt-1">
            No reviews are pending moderation right now.
          </p>
        </div>
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
