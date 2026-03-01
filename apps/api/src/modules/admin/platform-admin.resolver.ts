import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { ObjectType, Field, Float, InputType } from '@nestjs/graphql';
import { PlatformAdminService } from './platform-admin.service';
import { OnboardHotelInput } from './dto/onboard-hotel.input';
import { Hotel } from '../hotel/entities/hotel.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Review } from '../review/entities/review.entity';

// ============================================
// Response Types
// ============================================

@ObjectType()
class RecentHotelInfo {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field(() => Int)
  bookingsCount: number;

  @Field(() => Int)
  roomTypesCount: number;
}

@ObjectType()
class PlatformDashboardStats {
  @Field(() => Int)
  totalHotels: number;

  @Field(() => Int)
  activeHotels: number;

  @Field(() => Int)
  totalBookings: number;

  @Field(() => Int)
  monthlyBookings: number;

  @Field(() => Int)
  bookingGrowth: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  monthlyRevenue: number;

  @Field(() => Int)
  totalGuests: number;

  @Field(() => Float)
  totalCommissions: number;

  @Field(() => Float)
  pendingCommissions: number;

  @Field(() => [RecentHotelInfo])
  recentHotels: RecentHotelInfo[];

  @Field(() => [Booking])
  recentBookings: Booking[];
}

// Hotels list types
@ObjectType()
class PlatformHotel extends Hotel {
  @Field(() => Int, { nullable: true })
  bookingsCount?: number;

  @Field(() => Int, { nullable: true })
  roomTypesCount?: number;

  @Field(() => Int, { nullable: true })
  reviewsCount?: number;

  @Field(() => Int, { nullable: true })
  adminsCount?: number;

  @Field({ nullable: true })
  primaryDomain?: string;
}

@ObjectType()
class PlatformHotelsList {
  @Field(() => [PlatformHotel])
  hotels: PlatformHotel[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasMore: boolean;
}

// Commission types
@ObjectType()
class CommissionBookingInfo {
  @Field({ nullable: true })
  bookingNumber?: string;

  @Field(() => Float, { nullable: true })
  totalAmount?: number;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  guestName?: string;
}

@ObjectType()
class CommissionEntry {
  @Field(() => ID)
  id: string;

  @Field()
  hotelId: string;

  @Field({ nullable: true })
  hotelName?: string;

  @Field()
  bookingId: string;

  @Field(() => Float)
  bookingAmount: number;

  @Field(() => Float)
  commissionRate: number;

  @Field(() => Float)
  commissionAmount: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  settledAt?: Date;

  @Field()
  createdAt: Date;

  @Field(() => CommissionBookingInfo, { nullable: true })
  bookingInfo?: CommissionBookingInfo;
}

@ObjectType()
class CommissionsList {
  @Field(() => [CommissionEntry])
  commissions: CommissionEntry[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasMore: boolean;

  @Field(() => Float)
  totalCommissionAmount: number;

  @Field(() => Float)
  totalBookingAmount: number;
}

// Analytics types
@ObjectType()
class PlatformMonthlyData {
  @Field()
  month: string;

  @Field(() => Int)
  bookings: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class TopHotelData {
  @Field()
  hotelId: string;

  @Field()
  hotelName: string;

  @Field()
  city: string;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  totalBookings: number;
}

@ObjectType()
class SourceDistribution {
  @Field()
  source: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class CityPerformance {
  @Field()
  city: string;

  @Field(() => Int)
  bookings: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class PlatformAnalytics {
  @Field(() => [PlatformMonthlyData])
  monthlyRevenue: PlatformMonthlyData[];

  @Field(() => [TopHotelData])
  topHotels: TopHotelData[];

  @Field(() => [SourceDistribution])
  sourceDistribution: SourceDistribution[];

  @Field(() => [CityPerformance])
  cityPerformance: CityPerformance[];
}

// Moderation types
@ObjectType()
class PendingReviewEntry {
  @Field(() => ID)
  id: string;

  @Field()
  hotelId: string;

  @Field({ nullable: true })
  hotelName?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
class PendingReviewsList {
  @Field(() => [PendingReviewEntry])
  reviews: PendingReviewEntry[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
class BulkSettleResult {
  @Field(() => Int)
  count: number;
}

@ObjectType()
class PlatformDeleteResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

// ============================================
// Input Types
// ============================================

@InputType()
class PlatformHotelsFilter {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  city?: string;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@InputType()
class CommissionsFilter {
  @Field({ nullable: true })
  hotelId?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

// ============================================
// Onboarding Result Type
// ============================================

@ObjectType()
class OnboardHotelResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ID)
  hotelId: string;

  @Field()
  hotelSlug: string;

  @Field()
  adminEmail: string;
}

// ============================================
// Resolver
// ============================================

@Resolver()
export class PlatformAdminResolver {
  constructor(private readonly platformService: PlatformAdminService) {}

  // Dashboard
  @Query(() => PlatformDashboardStats, {
    name: 'platformDashboardStats',
    description: 'Get platform-wide dashboard statistics',
  })
  async getPlatformStats() {
    return this.platformService.getPlatformStats();
  }

  // Hotels
  @Query(() => PlatformHotelsList, {
    name: 'platformHotels',
    description: 'List all hotels with management info',
  })
  async getHotels(
    @Args('filters', { type: () => PlatformHotelsFilter, nullable: true })
    filters?: PlatformHotelsFilter,
  ) {
    return this.platformService.getAllHotels(filters || undefined);
  }

  @Mutation(() => Hotel, {
    name: 'platformToggleHotelActive',
    description: 'Activate or deactivate a hotel',
  })
  async toggleHotelActive(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('isActive') isActive: boolean,
  ) {
    return this.platformService.toggleHotelActive(hotelId, isActive);
  }

  @Mutation(() => Hotel, {
    name: 'platformToggleHotelFeatured',
    description: 'Toggle hotel featured status',
  })
  async toggleHotelFeatured(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('isFeatured') isFeatured: boolean,
  ) {
    return this.platformService.toggleHotelFeatured(hotelId, isFeatured);
  }

  @Mutation(() => Hotel, {
    name: 'platformUpdateHotelCommission',
    description: 'Update hotel commission rate',
  })
  async updateCommission(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('commissionRate', { type: () => Float }) commissionRate: number,
  ) {
    return this.platformService.updateHotelCommission(hotelId, commissionRate);
  }

  // Commissions
  @Query(() => CommissionsList, {
    name: 'platformCommissions',
    description: 'List commissions with filters',
  })
  async getCommissions(
    @Args('filters', { type: () => CommissionsFilter, nullable: true })
    filters?: CommissionsFilter,
  ) {
    const result = await this.platformService.getCommissions(filters || undefined);
    return {
      ...result,
      commissions: result.commissions.map((c: any) => ({
        ...c,
        hotelName: c.hotel?.name,
        bookingInfo: c.booking
          ? {
              bookingNumber: c.booking.bookingNumber,
              totalAmount: c.booking.totalAmount,
              status: c.booking.status,
              guestName: c.booking.guest?.name,
            }
          : null,
      })),
    };
  }

  @Mutation(() => CommissionEntry, {
    name: 'platformSettleCommission',
    description: 'Mark a commission as settled',
  })
  async settleCommission(
    @Args('commissionId', { type: () => ID }) commissionId: string,
  ) {
    return this.platformService.settleCommission(commissionId);
  }

  @Mutation(() => BulkSettleResult, {
    name: 'platformBulkSettleCommissions',
    description: 'Bulk settle multiple commissions',
  })
  async bulkSettle(
    @Args('commissionIds', { type: () => [ID] }) commissionIds: string[],
  ) {
    return this.platformService.bulkSettleCommissions(commissionIds);
  }

  // Analytics
  @Query(() => PlatformAnalytics, {
    name: 'platformAnalytics',
    description: 'Get platform-wide analytics',
  })
  async getAnalytics(
    @Args('months', { type: () => Int, nullable: true, defaultValue: 6 })
    months: number,
  ) {
    return this.platformService.getPlatformAnalytics(months);
  }

  // Moderation
  @Query(() => PendingReviewsList, {
    name: 'platformPendingReviews',
    description: 'Get reviews pending moderation',
  })
  async getPendingReviews(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ) {
    const result = await this.platformService.getPendingReviews(page, limit);
    return {
      ...result,
      reviews: result.reviews.map((r: any) => ({
        id: r.id,
        hotelId: r.hotelId,
        hotelName: r.hotel?.name,
        guestName: r.guest?.name,
        guestEmail: r.guest?.email,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    };
  }

  @Mutation(() => Review, {
    name: 'platformApproveReview',
    description: 'Approve a pending review',
  })
  async approveReview(@Args('reviewId', { type: () => ID }) reviewId: string) {
    return this.platformService.approveReview(reviewId);
  }

  @Mutation(() => PlatformDeleteResult, {
    name: 'platformDeleteReview',
    description: 'Delete a review',
  })
  async deleteReview(@Args('reviewId', { type: () => ID }) reviewId: string) {
    return this.platformService.deleteReview(reviewId);
  }

  // Onboarding
  @Mutation(() => OnboardHotelResult, {
    name: 'onboardHotel',
    description: 'Self-serve hotel onboarding - creates hotel + admin account',
  })
  async onboardHotel(@Args('input') input: OnboardHotelInput) {
    return this.platformService.onboardHotel(input);
  }
}