/**
 * GraphQL Queries for Hotel Tenant Pages
 * Used on hotel-specific domains (e.g., radhikaresort.in)
 */

import { gql } from '@apollo/client';

export const TENANT_HOTEL_FRAGMENT = gql`
  fragment TenantHotel on Hotel {
    id
    name
    slug
    tagline
    description
    address
    city
    state
    pincode
    phone
    email
    whatsapp
    website
    latitude
    longitude
    starRating
    averageRating
    reviewCount
    heroImageUrl
    logoUrl
    galleryImages
    startingPrice
    startingHourlyPrice
    bookingModel
    checkInTime
    checkOutTime
    hourlyMinHours
    hourlyMaxHours
    amenities
    policies
    themeConfig
    isFeatured
    isVerified
  }
`;

export const GET_HOTEL_BY_DOMAIN = gql`
  query GetHotelByDomain($domain: String!) {
    hotelByDomain(domain: $domain) {
      ...TenantHotel
      roomTypes {
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
      }
    }
  }
  ${TENANT_HOTEL_FRAGMENT}
`;

export const GET_HOTEL_BY_SLUG_TENANT = gql`
  query GetHotelBySlugTenant($slug: String!) {
    hotelBySlug(slug: $slug) {
      ...TenantHotel
      roomTypes {
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
      }
    }
  }
  ${TENANT_HOTEL_FRAGMENT}
`;

export const GET_TENANT_ROOM_TYPES = gql`
  query GetTenantRoomTypes($hotelId: ID!) {
    roomTypes(hotelId: $hotelId) {
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
      availableRooms
    }
  }
`;

export const GET_TENANT_ROOM_DETAIL = gql`
  query GetTenantRoomDetail($id: ID!) {
    roomType(id: $id) {
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
      availableRooms
    }
  }
`;

export const GET_TENANT_REVIEWS = gql`
  query GetTenantReviews($hotelId: ID!, $page: Int, $limit: Int, $sortBy: String) {
    hotelReviews(hotelId: $hotelId, page: $page, limit: $limit, sortBy: $sortBy) {
      reviews {
        id
        rating
        title
        comment
        hotelReply
        isVerified
        createdAt
        guest {
          name
          avatarUrl
        }
      }
      total
      page
      limit
    }
    hotelReviewStats(hotelId: $hotelId) {
      averageRating
      totalReviews
      distribution {
        rating
        count
        percentage
      }
    }
  }
`;
