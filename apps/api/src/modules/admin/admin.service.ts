import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateHotelInput, CreateRoomTypeInput, UpdateRoomTypeInput } from './dto/admin.input';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================
  // Dashboard Stats
  // ============================================

  async getDashboardStats(hotelId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBookings,
      monthlyBookings,
      todayCheckIns,
      todayCheckOuts,
      revenueResult,
      monthlyRevenue,
      totalRooms,
      occupiedRooms,
      recentBookings,
    ] = await Promise.all([
      // Total bookings count
      this.prisma.booking.count({
        where: { hotelId, status: { not: 'CANCELLED' } },
      }),
      // This month's bookings
      this.prisma.booking.count({
        where: {
          hotelId,
          createdAt: { gte: monthStart },
          status: { not: 'CANCELLED' },
        },
      }),
      // Today's check-ins
      this.prisma.booking.count({
        where: {
          hotelId,
          checkInDate: { gte: todayStart, lt: todayEnd },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
      }),
      // Today's check-outs
      this.prisma.booking.count({
        where: {
          hotelId,
          checkOutDate: { gte: todayStart, lt: todayEnd },
          status: { in: ['CHECKED_IN', 'CHECKED_OUT'] },
        },
      }),
      // Total revenue
      this.prisma.booking.aggregate({
        where: { hotelId, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      // Monthly revenue
      this.prisma.booking.aggregate({
        where: {
          hotelId,
          paymentStatus: 'PAID',
          createdAt: { gte: monthStart },
        },
        _sum: { totalAmount: true },
      }),
      // Total rooms
      this.prisma.room.count({ where: { hotelId } }),
      // Occupied rooms (currently checked in)
      this.prisma.booking.count({
        where: { hotelId, status: 'CHECKED_IN' },
      }),
      // Recent bookings
      this.prisma.booking.findMany({
        where: { hotelId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          roomType: { select: { name: true } },
        },
      }),
    ]);

    const occupancyRate = totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    return {
      totalBookings,
      monthlyBookings,
      todayCheckIns,
      todayCheckOuts,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      totalRooms,
      occupiedRooms,
      occupancyRate,
      recentBookings,
    };
  }

  // ============================================
  // Hotel Management
  // ============================================

  async updateHotel(input: UpdateHotelInput) {
    const { hotelId, ...updateData } = input;

    // Check hotel exists
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      throw new NotFoundException(`Hotel ${hotelId} not found`);
    }

    // Filter out undefined values
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const updated = await this.prisma.hotel.update({
      where: { id: hotelId },
      data,
      include: {
        domains: true,
        roomTypes: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });

    // Invalidate cache
    await this.redis.delPattern(`hotel:*`);
    await this.redis.delPattern(`hotels:*`);

    return updated;
  }

  // ============================================
  // Room Type CRUD
  // ============================================

  async createRoomType(input: CreateRoomTypeInput) {
    const { hotelId, ...data } = input;

    // Verify hotel exists
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      throw new NotFoundException(`Hotel ${hotelId} not found`);
    }

    const roomType = await this.prisma.roomType.create({
      data: {
        hotelId,
        ...data,
      },
    });

    // Create physical rooms based on totalRooms
    if (data.totalRooms > 0) {
      const rooms = Array.from({ length: data.totalRooms }, (_, i) => ({
        hotelId,
        roomTypeId: roomType.id,
        roomNumber: `${roomType.name.replace(/\s+/g, '').slice(0, 3).toUpperCase()}${String(i + 1).padStart(2, '0')}`,
        floor: 1,
      }));

      await this.prisma.room.createMany({ data: rooms });
    }

    // Invalidate cache
    await this.redis.delPattern(`hotel:*`);
    await this.redis.delPattern(`room-types:*`);

    return roomType;
  }

  async updateRoomType(input: UpdateRoomTypeInput) {
    const { id, ...updateData } = input;

    const roomType = await this.prisma.roomType.findUnique({ where: { id } });
    if (!roomType) {
      throw new NotFoundException(`Room type ${id} not found`);
    }

    // Filter out undefined values
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const updated = await this.prisma.roomType.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await this.redis.delPattern(`hotel:*`);
    await this.redis.delPattern(`room-types:*`);

    return updated;
  }

  async deleteRoomType(id: string) {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
      include: { bookings: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } }, take: 1 } },
    });

    if (!roomType) {
      throw new NotFoundException(`Room type ${id} not found`);
    }

    if (roomType.bookings.length > 0) {
      throw new ForbiddenException('Cannot delete room type with active bookings. Deactivate it instead.');
    }

    // Soft delete - just deactivate
    await this.prisma.roomType.update({
      where: { id },
      data: { isActive: false },
    });

    // Invalidate cache
    await this.redis.delPattern(`hotel:*`);
    await this.redis.delPattern(`room-types:*`);

    return { success: true, message: 'Room type deactivated successfully' };
  }

  async getRoomTypesForAdmin(hotelId: string) {
    // Admin sees ALL room types including inactive
    return this.prisma.roomType.findMany({
      where: { hotelId },
      orderBy: { sortOrder: 'asc' },
      include: {
        rooms: { select: { id: true, roomNumber: true, status: true } },
        _count: { select: { bookings: true } },
      },
    });
  }
}
