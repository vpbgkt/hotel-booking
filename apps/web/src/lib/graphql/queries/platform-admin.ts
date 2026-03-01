import { gql } from '@apollo/client';

// ============================================
// Dashboard
// ============================================

export const PLATFORM_DASHBOARD_STATS = gql`
  query PlatformDashboardStats {
    platformDashboardStats {
      totalHotels
      activeHotels
      totalBookings
      monthlyBookings
      bookingGrowth
      totalRevenue
      monthlyRevenue
      totalGuests
      totalCommissions
      pendingCommissions
      recentHotels {
        id
        name
        city
        state
        isActive
        createdAt
        bookingsCount
        roomTypesCount
      }
      recentBookings {
        id
        bookingNumber
        status
        totalAmount
        checkIn
        checkOut
        createdAt
        hotel {
          name
        }
        guest {
          name
          email
        }
      }
    }
  }
`;

// ============================================
// Hotels Management
// ============================================

export const PLATFORM_HOTELS = gql`
  query PlatformHotels($filters: PlatformHotelsFilter) {
    platformHotels(filters: $filters) {
      hotels {
        id
        name
        slug
        city
        state
        starRating
        isActive
        isFeatured
        commissionRate
        createdAt
        heroImageUrl
        bookingsCount
        roomTypesCount
        reviewsCount
        adminsCount
        primaryDomain
      }
      total
      page
      limit
      hasMore
    }
  }
`;

export const TOGGLE_HOTEL_ACTIVE = gql`
  mutation ToggleHotelActive($hotelId: ID!, $isActive: Boolean!) {
    platformToggleHotelActive(hotelId: $hotelId, isActive: $isActive) {
      id
      isActive
    }
  }
`;

export const TOGGLE_HOTEL_FEATURED = gql`
  mutation ToggleHotelFeatured($hotelId: ID!, $isFeatured: Boolean!) {
    platformToggleHotelFeatured(hotelId: $hotelId, isFeatured: $isFeatured) {
      id
      isFeatured
    }
  }
`;

export const UPDATE_HOTEL_COMMISSION = gql`
  mutation UpdateHotelCommission($hotelId: ID!, $commissionRate: Float!) {
    platformUpdateHotelCommission(hotelId: $hotelId, commissionRate: $commissionRate) {
      id
      commissionRate
    }
  }
`;

// ============================================
// Commissions
// ============================================

export const PLATFORM_COMMISSIONS = gql`
  query PlatformCommissions($filters: CommissionsFilter) {
    platformCommissions(filters: $filters) {
      commissions {
        id
        hotelId
        hotelName
        bookingId
        bookingAmount
        commissionRate
        commissionAmount
        status
        settledAt
        createdAt
        bookingInfo {
          bookingNumber
          totalAmount
          status
          guestName
        }
      }
      total
      page
      limit
      hasMore
      totalCommissionAmount
      totalBookingAmount
    }
  }
`;

export const SETTLE_COMMISSION = gql`
  mutation SettleCommission($commissionId: ID!) {
    platformSettleCommission(commissionId: $commissionId) {
      id
      status
      settledAt
    }
  }
`;

export const BULK_SETTLE_COMMISSIONS = gql`
  mutation BulkSettleCommissions($commissionIds: [ID!]!) {
    platformBulkSettleCommissions(commissionIds: $commissionIds) {
      count
    }
  }
`;

// ============================================
// Analytics
// ============================================

export const PLATFORM_ANALYTICS = gql`
  query PlatformAnalytics($months: Int) {
    platformAnalytics(months: $months) {
      monthlyRevenue {
        month
        bookings
        revenue
      }
      topHotels {
        hotelId
        hotelName
        city
        totalRevenue
        totalBookings
      }
      sourceDistribution {
        source
        count
        revenue
      }
      cityPerformance {
        city
        bookings
        revenue
      }
    }
  }
`;

// ============================================
// Moderation
// ============================================

export const PLATFORM_PENDING_REVIEWS = gql`
  query PlatformPendingReviews($page: Int, $limit: Int) {
    platformPendingReviews(page: $page, limit: $limit) {
      reviews {
        id
        hotelId
        hotelName
        guestName
        guestEmail
        rating
        title
        comment
        createdAt
      }
      total
      hasMore
    }
  }
`;

export const APPROVE_REVIEW = gql`
  mutation ApproveReview($reviewId: ID!) {
    platformApproveReview(reviewId: $reviewId) {
      id
      isPublished
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    platformDeleteReview(reviewId: $reviewId) {
      success
      message
    }
  }
`;

// ============================================
// Hotel Onboarding
// ============================================

export const ONBOARD_HOTEL = gql`
  mutation OnboardHotel($input: OnboardHotelInput!) {
    onboardHotel(input: $input) {
      success
      message
      hotelId
      hotelSlug
      adminEmail
    }
  }
`;
