/**
 * GraphQL Queries for Hotels
 */

import { gql } from '@apollo/client';

// Hotel fragments for reuse
export const HOTEL_CARD_FRAGMENT = gql`
  fragment HotelCard on Hotel {
    id
    name
    slug
    description
    city
    state
    address
    starRating
    heroImageUrl
    logoUrl
    averageRating
    reviewCount
    startingPrice
    isFeatured
    bookingModel
  }
`;

export const HOTEL_DETAIL_FRAGMENT = gql`
  fragment HotelDetail on Hotel {
    ...HotelCard
    phone
    email
    whatsapp
    latitude
    longitude
    pincode
    checkInTime
    checkOutTime
    hourlyMinHours
    hourlyMaxHours
    themeConfig
  }
  ${HOTEL_CARD_FRAGMENT}
`;

// Queries
export const GET_FEATURED_HOTELS = gql`
  query GetFeaturedHotels($limit: Float) {
    featuredHotels(limit: $limit) {
      ...HotelCard
    }
  }
  ${HOTEL_CARD_FRAGMENT}
`;

export const GET_HOTELS = gql`
  query GetHotels($filters: HotelFiltersInput, $pagination: HotelPaginationInput) {
    hotels(filters: $filters, pagination: $pagination) {
      hotels {
        ...HotelCard
      }
      total
      page
      limit
      hasMore
    }
  }
  ${HOTEL_CARD_FRAGMENT}
`;

export const GET_HOTEL_BY_SLUG = gql`
  query GetHotelBySlug($slug: String!) {
    hotelBySlug(slug: $slug) {
      ...HotelDetail
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
      reviews {
        id
        rating
        title
        comment
        createdAt
        guest {
          name
          avatarUrl
        }
      }
    }
  }
  ${HOTEL_DETAIL_FRAGMENT}
`;

export const GET_HOTEL_BY_ID = gql`
  query GetHotelById($id: ID!) {
    hotel(id: $id) {
      ...HotelDetail
    }
  }
  ${HOTEL_DETAIL_FRAGMENT}
`;

export const SEARCH_HOTELS = gql`
  query SearchHotels($query: String!, $limit: Float) {
    searchHotels(query: $query, limit: $limit) {
      id
      name
      slug
      city
      state
      heroImageUrl
      starRating
    }
  }
`;

export const GET_POPULAR_CITIES = gql`
  query GetPopularCities($limit: Float) {
    popularCities(limit: $limit) {
      city
      state
      hotelCount
    }
  }
`;
