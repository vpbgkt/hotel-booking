import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { Hotel } from '../hotel/entities/hotel.entity';
import { RoomType } from '../room/entities/room-type.entity';
import { Booking } from '../booking/entities/booking.entity';
import { UpdateHotelInput, CreateRoomTypeInput, UpdateRoomTypeInput } from './dto/admin.input';

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
}
