/**
 * Commission Service - BlueStay API
 *
 * Manages commission tracking, settlement, and dispute resolution
 * for bookings made through the BlueStay aggregator.
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================
  // Commission Queries
  // ============================================

  /**
   * Get commission records for a specific hotel
   */
  async getHotelCommissions(
    hotelId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { hotelId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    const [commissions, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        include: {
          booking: {
            select: {
              bookingNumber: true,
              guestName: true,
              checkInDate: true,
              checkOutDate: true,
              totalAmount: true,
              source: true,
              status: true,
            },
          },
          hotel: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.commission.count({ where }),
    ]);

    return {
      commissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all commissions across the platform (for platform admin)
   */
  async getPlatformCommissions(filters?: {
    hotelId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.hotelId) where.hotelId = filters.hotelId;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    const [commissions, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        include: {
          booking: {
            select: {
              bookingNumber: true,
              guestName: true,
              checkInDate: true,
              checkOutDate: true,
              totalAmount: true,
              source: true,
              status: true,
            },
          },
          hotel: {
            select: { id: true, name: true, slug: true, city: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.commission.count({ where }),
    ]);

    return {
      commissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get commission summary stats for a hotel
   */
  async getHotelCommissionSummary(hotelId: string) {
    const cacheKey = `commission:summary:${hotelId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalCommission,
      pendingCommission,
      settledCommission,
      disputedCommission,
      monthlyCommission,
      lastMonthCommission,
      totalBookings,
      recentCommissions,
    ] = await Promise.all([
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { hotelId },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { hotelId, status: 'PENDING' },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { hotelId, status: 'SETTLED' },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { hotelId, status: 'DISPUTED' },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { hotelId, createdAt: { gte: monthStart } },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: {
          hotelId,
          createdAt: { gte: lastMonthStart, lt: monthStart },
        },
      }),
      this.prisma.commission.count({ where: { hotelId } }),
      this.prisma.commission.findMany({
        where: { hotelId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: { bookingNumber: true, totalAmount: true },
          },
        },
      }),
    ]);

    const summary = {
      totalCommission: totalCommission._sum.commissionAmount || 0,
      pendingCommission: pendingCommission._sum.commissionAmount || 0,
      settledCommission: settledCommission._sum.commissionAmount || 0,
      disputedCommission: disputedCommission._sum.commissionAmount || 0,
      monthlyCommission: monthlyCommission._sum.commissionAmount || 0,
      lastMonthCommission: lastMonthCommission._sum.commissionAmount || 0,
      totalBookings,
      recentCommissions,
    };

    await this.redis.set(cacheKey, JSON.stringify(summary), this.CACHE_TTL);
    return summary;
  }

  /**
   * Get platform-wide commission summary
   */
  async getPlatformCommissionSummary() {
    const cacheKey = 'commission:platform:summary';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCommission,
      pendingCommission,
      settledCommission,
      monthlyCommission,
      topHotels,
    ] = await Promise.all([
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true, bookingAmount: true },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { status: 'PENDING' },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { status: 'SETTLED' },
      }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.commission.groupBy({
        by: ['hotelId'],
        _sum: { commissionAmount: true },
        orderBy: { _sum: { commissionAmount: 'desc' } },
        take: 10,
      }),
    ]);

    // Enrich top hotels with names
    const hotelIds = topHotels.map((h) => h.hotelId);
    const hotels = await this.prisma.hotel.findMany({
      where: { id: { in: hotelIds } },
      select: { id: true, name: true, city: true },
    });
    const hotelMap = new Map(hotels.map((h) => [h.id, h]));

    const summary = {
      totalCommission: totalCommission._sum.commissionAmount || 0,
      totalBookingValue: totalCommission._sum.bookingAmount || 0,
      pendingCommission: pendingCommission._sum.commissionAmount || 0,
      settledCommission: settledCommission._sum.commissionAmount || 0,
      monthlyCommission: monthlyCommission._sum.commissionAmount || 0,
      topHotels: topHotels.map((h) => ({
        hotelId: h.hotelId,
        hotelName: hotelMap.get(h.hotelId)?.name || 'Unknown',
        city: hotelMap.get(h.hotelId)?.city || '',
        totalCommission: h._sum.commissionAmount || 0,
      })),
    };

    await this.redis.set(cacheKey, JSON.stringify(summary), this.CACHE_TTL);
    return summary;
  }

  // ============================================
  // Commission Mutations
  // ============================================

  /**
   * Settle pending commissions for a hotel
   */
  async settleCommissions(hotelId: string, commissionIds?: string[]) {
    const where: any = {
      hotelId,
      status: 'PENDING',
    };
    if (commissionIds?.length) {
      where.id = { in: commissionIds };
    }

    const result = await this.prisma.commission.updateMany({
      where,
      data: {
        status: 'SETTLED',
        settledAt: new Date(),
      },
    });

    // Invalidate cache
    await this.redis.del(`commission:summary:${hotelId}`);
    await this.redis.del('commission:platform:summary');

    this.logger.log(`Settled ${result.count} commissions for hotel ${hotelId}`);

    return {
      settledCount: result.count,
      message: `${result.count} commission(s) settled successfully`,
    };
  }

  /**
   * Mark a commission as disputed
   */
  async disputeCommission(commissionId: string, reason: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot dispute a commission with status: ${commission.status}`,
      );
    }

    const updated = await this.prisma.commission.update({
      where: { id: commissionId },
      data: { status: 'DISPUTED' },
    });

    // Invalidate caches
    await this.redis.del(`commission:summary:${commission.hotelId}`);
    await this.redis.del('commission:platform:summary');

    this.logger.warn(
      `Commission ${commissionId} disputed. Reason: ${reason}`,
    );

    return updated;
  }

  /**
   * Resolve a disputed commission (platform admin)
   */
  async resolveDispute(
    commissionId: string,
    resolution: 'SETTLE' | 'WAIVE',
  ) {
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status !== 'DISPUTED') {
      throw new BadRequestException('Commission is not in disputed state');
    }

    if (resolution === 'SETTLE') {
      const updated = await this.prisma.commission.update({
        where: { id: commissionId },
        data: { status: 'SETTLED', settledAt: new Date() },
      });

      this.logger.log(`Disputed commission ${commissionId} settled`);

      // Invalidate caches
      await this.redis.del(`commission:summary:${commission.hotelId}`);
      await this.redis.del('commission:platform:summary');

      return updated;
    } else {
      // WAIVE - delete the commission record
      await this.prisma.commission.delete({
        where: { id: commissionId },
      });

      // Update booking to remove commission
      await this.prisma.booking.update({
        where: { id: commission.bookingId },
        data: {
          commissionAmount: 0,
          hotelPayout: commission.bookingAmount,
        },
      });

      this.logger.log(`Commission ${commissionId} waived`);

      // Invalidate caches
      await this.redis.del(`commission:summary:${commission.hotelId}`);
      await this.redis.del('commission:platform:summary');

      return { message: 'Commission waived successfully' };
    }
  }

  /**
   * Update commission rate for a hotel
   */
  async updateHotelCommissionRate(
    hotelId: string,
    rate: number,
    type: 'PERCENTAGE' | 'FLAT' = 'PERCENTAGE',
  ) {
    if (type === 'PERCENTAGE' && (rate < 0 || rate > 0.5)) {
      throw new BadRequestException(
        'Commission rate must be between 0 and 50%',
      );
    }

    const hotel = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        commissionRate: rate,
        commissionType: type,
      },
    });

    this.logger.log(
      `Updated commission rate for hotel ${hotelId}: ${rate} (${type})`,
    );

    return hotel;
  }

  /**
   * Get commission rate change history (monthly averages)
   */
  async getCommissionTrends(hotelId?: string, months: number = 12) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const where: any = {
        createdAt: { gte: monthStart, lte: monthEnd },
      };
      if (hotelId) where.hotelId = hotelId;

      const result = await this.prisma.commission.aggregate({
        _sum: { commissionAmount: true, bookingAmount: true },
        _count: true,
        where,
      });

      trends.push({
        month: monthStart.toISOString().slice(0, 7), // "2026-03"
        totalBookingValue: result._sum.bookingAmount || 0,
        totalCommission: result._sum.commissionAmount || 0,
        bookingCount: result._count,
        avgRate:
          result._sum.bookingAmount && result._sum.commissionAmount
            ? (result._sum.commissionAmount / result._sum.bookingAmount) * 100
            : 0,
      });
    }

    return trends;
  }
}
