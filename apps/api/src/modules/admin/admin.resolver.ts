import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { Hotel } from '../hotel/entities/hotel.entity';
import { RoomType, RoomInventory } from '../room/entities/room-type.entity';
import { Booking } from '../booking/entities/booking.entity';
import { UpdateHotelInput, CreateRoomTypeInput, UpdateRoomTypeInput, BulkInventoryUpdateInput, SingleDateInventoryInput, UpsertSeoMetaInput, UpdateHotelContentInput } from './dto/admin.input';
import { GraphQLJSON } from 'graphql-scalars';

// Dashboard stats response type
@ObjectType()
class AdminDashboardStats {
  @Field(() => Int)
  totalBookings: number;

  @Field(() => Int)
  monthlyBookings: number;

  @Field(() => Int)
  todayCheckIns: number;

  @Field(() => Int)
  todayCheckOuts: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  monthlyRevenue: number;

  @Field(() => Int)
  totalRooms: number;

  @Field(() => Int)
  occupiedRooms: number;

  @Field(() => Int)
  occupancyRate: number;

  @Field(() => [Booking])
  recentBookings: Booking[];
}

@ObjectType()
class DeleteResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
class BulkUpdateResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Int)
  daysUpdated: number;
}

@ObjectType()
class InventoryCalendarDay {
  @Field()
  date: string;

  @Field(() => Int)
  available: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  basePrice: number;

  @Field()
  isClosed: boolean;

  @Field(() => Int)
  minStayNights: number;

  @Field()
  hasCustomPrice: boolean;

  @Field()
  hasCustomAvailability: boolean;
}

@ObjectType()
class InventoryCalendar {
  @Field()
  roomTypeId: string;

  @Field()
  roomTypeName: string;

  @Field(() => Float)
  basePriceDaily: number;

  @Field(() => Int)
  totalRooms: number;

  @Field(() => [InventoryCalendarDay])
  calendar: InventoryCalendarDay[];
}

// ============================================
// Analytics Response Types
// ============================================

@ObjectType()
class MonthlyDataPoint {
  @Field()
  month: string;

  @Field(() => Int)
  bookings: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class RoomTypePopularity {
  @Field()
  roomTypeName: string;

  @Field(() => Int)
  bookings: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class BookingsBySource {
  @Field()
  source: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
class BookingsByStatus {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
class AdminAnalytics {
  @Field(() => [MonthlyDataPoint])
  monthlyData: MonthlyDataPoint[];

  @Field(() => [RoomTypePopularity])
  roomTypePopularity: RoomTypePopularity[];

  @Field(() => [BookingsBySource])
  bookingsBySource: BookingsBySource[];

  @Field(() => [BookingsByStatus])
  bookingsByStatus: BookingsByStatus[];

  @Field(() => Float)
  averageBookingValue: number;

  @Field(() => Float)
  averageStayNights: number;
}

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // Dashboard
  // ============================================

  @Query(() => AdminDashboardStats, {
    name: 'adminDashboardStats',
    description: 'Get dashboard stats for hotel admin',
  })
  async getDashboardStats(
    @Args('hotelId', { type: () => ID }) hotelId: string,
  ) {
    return this.adminService.getDashboardStats(hotelId);
  }

  // ============================================
  // Hotel Management
  // ============================================

  @Mutation(() => Hotel, {
    name: 'updateHotel',
    description: 'Update hotel details (admin only)',
  })
  async updateHotel(@Args('input') input: UpdateHotelInput) {
    return this.adminService.updateHotel(input);
  }

  // ============================================
  // Room Type CRUD
  // ============================================

  @Query(() => [RoomType], {
    name: 'adminRoomTypes',
    description: 'Get all room types for admin (including inactive)',
  })
  async getAdminRoomTypes(
    @Args('hotelId', { type: () => ID }) hotelId: string,
  ) {
    return this.adminService.getRoomTypesForAdmin(hotelId);
  }

  @Mutation(() => RoomType, {
    name: 'createRoomType',
    description: 'Create a new room type',
  })
  async createRoomType(@Args('input') input: CreateRoomTypeInput) {
    return this.adminService.createRoomType(input);
  }

  @Mutation(() => RoomType, {
    name: 'updateRoomType',
    description: 'Update an existing room type',
  })
  async updateRoomType(@Args('input') input: UpdateRoomTypeInput) {
    return this.adminService.updateRoomType(input);
  }

  @Mutation(() => DeleteResult, {
    name: 'deleteRoomType',
    description: 'Deactivate a room type (soft delete)',
  })
  async deleteRoomType(@Args('id', { type: () => ID }) id: string) {
    return this.adminService.deleteRoomType(id);
  }

  // ============================================
  // Inventory / Pricing Management
  // ============================================

  @Query(() => InventoryCalendar, {
    name: 'adminInventoryCalendar',
    description: 'Get inventory calendar for admin pricing management',
  })
  async getInventoryCalendar(
    @Args('roomTypeId', { type: () => ID }) roomTypeId: string,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ) {
    return this.adminService.getInventoryForDateRange(roomTypeId, startDate, endDate);
  }

  @Mutation(() => BulkUpdateResult, {
    name: 'bulkUpdateInventory',
    description: 'Bulk update pricing and availability for a date range',
  })
  async bulkUpdateInventory(@Args('input') input: BulkInventoryUpdateInput) {
    return this.adminService.bulkUpdateInventory(input);
  }

  @Mutation(() => RoomInventory, {
    name: 'updateDateInventory',
    description: 'Update inventory for a single date',
  })
  async updateDateInventory(@Args('input') input: SingleDateInventoryInput) {
    return this.adminService.updateSingleDateInventory(input);
  }

  // ============================================
  // Analytics
  // ============================================

  @Query(() => AdminAnalytics, {
    name: 'adminAnalytics',
    description: 'Get hotel analytics data',
  })
  async getAnalytics(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('months', { type: () => Int, nullable: true, defaultValue: 6 }) months: number,
  ) {
    return this.adminService.getAnalytics(hotelId, months);
  }

  // ============================================
  // SEO Meta
  // ============================================

  @Query(() => [SeoMetaType], {
    name: 'adminSeoMeta',
    description: 'Get all SEO meta entries for a hotel',
  })
  async getSeoMeta(
    @Args('hotelId', { type: () => ID }) hotelId: string,
  ) {
    return this.adminService.getSeoMetaForHotel(hotelId);
  }

  @Mutation(() => SeoMetaType, {
    name: 'upsertSeoMeta',
    description: 'Create or update SEO meta for a page',
  })
  async upsertSeoMeta(@Args('input') input: UpsertSeoMetaInput) {
    return this.adminService.upsertSeoMeta(input);
  }

  @Mutation(() => DeleteResult, {
    name: 'deleteSeoMeta',
    description: 'Delete SEO meta entry',
  })
  async deleteSeoMeta(@Args('id', { type: () => ID }) id: string) {
    return this.adminService.deleteSeoMeta(id);
  }

  // ============================================
  // Content / Theme
  // ============================================

  @Query(() => HotelContentType, {
    name: 'adminHotelContent',
    description: 'Get hotel content (description, images, theme)',
  })
  async getHotelContent(
    @Args('hotelId', { type: () => ID }) hotelId: string,
  ) {
    return this.adminService.getHotelContent(hotelId);
  }

  @Mutation(() => Hotel, {
    name: 'updateHotelContent',
    description: 'Update hotel content and theme',
  })
  async updateHotelContent(@Args('input') input: UpdateHotelContentInput) {
    const { hotelId, ...data } = input;
    return this.adminService.updateHotelContent(hotelId, data);
  }
}

// ============================================
// Additional ObjectTypes
// ============================================

@ObjectType()
class SeoMetaType {
  @Field(() => ID)
  id: string;

  @Field()
  hotelId: string;

  @Field()
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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
class HotelContentType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  heroImageUrl?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  themeConfig?: any;
}
