/**
 * GraphQL Queries & Mutations for Hotel Admin Panel
 */

import { gql } from '@apollo/client';

// ============================================
// Dashboard
// ============================================

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats($hotelId: ID!) {
    adminDashboardStats(hotelId: $hotelId) {
      totalBookings
      monthlyBookings
      todayCheckIns
      todayCheckOuts
      totalRevenue
      monthlyRevenue
      totalRooms
      occupiedRooms
      occupancyRate
      recentBookings {
        id
        bookingNumber
        guestName
        guestEmail
        guestPhone
        status
        paymentStatus
        totalAmount
        checkInDate
        checkOutDate
        bookingType
        numRooms
        numGuests
        createdAt
        roomType {
          name
        }
      }
    }
  }
`;

// ============================================
// Room Types
// ============================================

export const GET_ADMIN_ROOM_TYPES = gql`
  query GetAdminRoomTypes($hotelId: ID!) {
    adminRoomTypes(hotelId: $hotelId) {
      id
      name
      slug
      description
      basePriceDaily
      basePriceHourly
      maxGuests
      maxExtraGuests
      extraGuestCharge
      totalRooms
      amenities
      images
      isActive
      sortOrder
      createdAt
    }
  }
`;

export const CREATE_ROOM_TYPE = gql`
  mutation CreateRoomType($input: CreateRoomTypeInput!) {
    createRoomType(input: $input) {
      id
      name
      slug
      basePriceDaily
      basePriceHourly
      maxGuests
      totalRooms
      isActive
    }
  }
`;

export const UPDATE_ROOM_TYPE = gql`
  mutation UpdateRoomType($input: UpdateRoomTypeInput!) {
    updateRoomType(input: $input) {
      id
      name
      slug
      description
      basePriceDaily
      basePriceHourly
      maxGuests
      maxExtraGuests
      extraGuestCharge
      totalRooms
      amenities
      images
      isActive
      sortOrder
    }
  }
`;

export const DELETE_ROOM_TYPE = gql`
  mutation DeleteRoomType($id: ID!) {
    deleteRoomType(id: $id) {
      success
      message
    }
  }
`;

// ============================================
// Hotel Management
// ============================================

export const UPDATE_HOTEL = gql`
  mutation UpdateHotel($input: UpdateHotelInput!) {
    updateHotel(input: $input) {
      id
      name
      description
      address
      city
      state
      pincode
      phone
      email
      whatsapp
      heroImageUrl
      logoUrl
      starRating
      checkInTime
      checkOutTime
      latitude
      longitude
    }
  }
`;

// ============================================
// Bookings (reuse existing queries with hotelId filter)
// ============================================

export const GET_ADMIN_BOOKINGS = gql`
  query GetAdminBookings($filters: BookingFiltersInput, $pagination: BookingPaginationInput) {
    bookings(filters: $filters, pagination: $pagination) {
      bookings {
        id
        bookingNumber
        guestName
        guestEmail
        guestPhone
        status
        paymentStatus
        bookingType
        checkInDate
        checkOutDate
        checkInTime
        checkOutTime
        numHours
        numRooms
        numGuests
        totalAmount
        source
        createdAt
        roomType {
          name
          slug
        }
      }
      total
      page
      limit
      hasMore
    }
  }
`;

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
    updateBookingStatus(input: $input) {
      id
      status
      paymentStatus
      bookingNumber
    }
  }
`;
