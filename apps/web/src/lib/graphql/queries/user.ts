/**
 * User GraphQL Queries
 */

import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      phone
      role
      avatarUrl
      hotelId
      createdAt
    }
  }
`;

export const GET_USER_BOOKINGS = gql`
  query GetUserBookings($filters: BookingFiltersInput, $pagination: PaginationInput) {
    myBookings(filters: $filters, pagination: $pagination) {
      bookings {
        id
        bookingNumber
        status
        bookingType
        checkInDate
        checkOutDate
        checkInTime
        checkOutTime
        numGuests
        numRooms
        totalAmount
        paymentStatus
        hotel {
          id
          name
          slug
          city
          heroImageUrl
        }
        roomType {
          id
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;
