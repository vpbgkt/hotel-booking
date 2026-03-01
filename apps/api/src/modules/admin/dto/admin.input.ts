import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { BookingModel } from '../../hotel/entities/hotel.entity';

@InputType()
export class UpdateHotelInput {
  @Field(() => ID)
  hotelId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  pincode?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  heroImageUrl?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field(() => Int, { nullable: true })
  starRating?: number;

  @Field({ nullable: true })
  checkInTime?: string;

  @Field({ nullable: true })
  checkOutTime?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  themeConfig?: Record<string, unknown>;

  @Field(() => BookingModel, { nullable: true })
  bookingModel?: BookingModel;

  @Field(() => Int, { nullable: true })
  hourlyMinHours?: number;

  @Field(() => Int, { nullable: true })
  hourlyMaxHours?: number;

  @Field({ nullable: true })
  razorpayAccountId?: string;

  @Field({ nullable: true })
  stripeAccountId?: string;
}

@InputType()
export class CreateRoomTypeInput {
  @Field(() => ID)
  hotelId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  basePriceDaily: number;

  @Field(() => Float, { nullable: true })
  basePriceHourly?: number;

  @Field(() => Int, { defaultValue: 2 })
  maxGuests: number;

  @Field(() => Int, { defaultValue: 0 })
  maxExtraGuests: number;

  @Field(() => Float, { defaultValue: 0 })
  extraGuestCharge: number;

  @Field(() => Int, { defaultValue: 1 })
  totalRooms: number;

  @Field(() => [String], { defaultValue: [] })
  amenities: string[];

  @Field(() => [String], { defaultValue: [] })
  images: string[];

  @Field(() => Int, { defaultValue: 0 })
  sortOrder: number;
}

@InputType()
export class UpdateRoomTypeInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  basePriceDaily?: number;

  @Field(() => Float, { nullable: true })
  basePriceHourly?: number;

  @Field(() => Int, { nullable: true })
  maxGuests?: number;

  @Field(() => Int, { nullable: true })
  maxExtraGuests?: number;

  @Field(() => Float, { nullable: true })
  extraGuestCharge?: number;

  @Field(() => Int, { nullable: true })
  totalRooms?: number;

  @Field(() => [String], { nullable: true })
  amenities?: string[];

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class BulkInventoryUpdateInput {
  @Field(() => ID)
  roomTypeId: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => Float, { nullable: true, description: 'Price override for the date range (null = use base price)' })
  priceOverride?: number;

  @Field(() => Int, { nullable: true, description: 'Override available count' })
  availableCount?: number;

  @Field({ nullable: true, description: 'Close/open dates for booking' })
  isClosed?: boolean;

  @Field(() => Int, { nullable: true, description: 'Minimum stay nights' })
  minStayNights?: number;
}

@InputType()
export class SingleDateInventoryInput {
  @Field(() => ID)
  roomTypeId: string;

  @Field()
  date: Date;

  @Field(() => Float, { nullable: true })
  priceOverride?: number;

  @Field(() => Int, { nullable: true })
  availableCount?: number;

  @Field({ nullable: true })
  isClosed?: boolean;

  @Field(() => Int, { nullable: true })
  minStayNights?: number;
}

// ============================================
// SEO Meta
// ============================================

@InputType()
export class UpsertSeoMetaInput {
  @Field(() => ID)
  hotelId: string;

  @Field({ description: 'Page identifier e.g. "homepage", "rooms", "contact"' })
  pageSlug: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  ogImageUrl?: string;

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  customJsonLd?: any;
}

// ============================================
// Content / Theme
// ============================================

@InputType()
export class UpdateHotelContentInput {
  @Field(() => ID)
  hotelId: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  heroImageUrl?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Theme config: { primaryColor, fontFamily, etc. }' })
  themeConfig?: any;
}
