import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================
  // Platform Dashboard Stats
  // ============================================

  async getPlatformStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalHotels,
      activeHotels,
      totalBookings,
      monthlyBookings,
      lastMonthBookings,
      totalRevenue,
      monthlyRevenue,
      totalGuests,
      totalCommissions,
      pendingCommissions,
      recentHotels,
      recentBookings,
    ] = await Promise.all([
      this.prisma.hotel.count(),
      this.prisma.hotel.count({ where: { isActive: true } }),
      this.prisma.booking.count({ where: { status: { not: 'CANCELLED' } } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.booking.count({
        where: {
          createdAt: { gte: lastMonthStart, lt: monthStart },
          status: { not: 'CANCELLED' },
        },
      }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.user.count({ where: { role: 'GUEST' } }),
      this.prisma.commission.aggregate({ _sum: { commissionAmount: true } }),
      this.prisma.commission.aggregate({
        _sum: { commissionAmount: true },
        where: { status: 'PENDING' },
      }),
      this.prisma.hotel.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          isActive: true,
          createdAt: true,
          _count: { select: { bookings: true, roomTypes: true } },
        },
      }),
      this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          hotel: { select: { name: true } },
          guest: { select: { name: true, email: true } },
        },
      }),
    ]);

    const bookingGrowth = lastMonthBookings > 0
      ? Math.round(((monthlyBookings - lastMonthBookings) / lastMonthBookings) * 100)
      : 100;

    return {
      totalHotels,
      activeHotels,
      totalBookings,
      monthlyBookings,
      bookingGrowth,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      totalGuests,
      totalCommissions: totalCommissions._sum.commissionAmount || 0,
      pendingCommissions: pendingCommissions._sum.commissionAmount || 0,
      recentHotels: recentHotels.map((h) => ({
        id: h.id,
        name: h.name,
        city: h.city,
        state: h.state,
        isActive: h.isActive,
        createdAt: h.createdAt,
        bookingsCount: h._count.bookings,
        roomTypesCount: h._count.roomTypes,
      })),
      recentBookings,
    };
  }

  // ============================================
  // Hotels Management
  // ============================================

  async getAllHotels(filters?: {
    search?: string;
    isActive?: boolean;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.city) {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }

    const [hotels, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true,
              roomTypes: true,
              reviews: true,
              users: { where: { role: 'HOTEL_ADMIN' } },
            },
          },
          domains: { select: { domain: true, isPrimary: true } },
        },
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return {
      hotels: hotels.map((h) => ({
        ...h,
        bookingsCount: h._count.bookings,
        roomTypesCount: h._count.roomTypes,
        reviewsCount: h._count.reviews,
        adminsCount: h._count.users,
        primaryDomain: h.domains.find((d) => d.isPrimary)?.domain || null,
      })),
      total,
      page,
      limit,
      hasMore: skip + hotels.length < total,
    };
  }

  async toggleHotelActive(hotelId: string, isActive: boolean) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');

    const updated = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { isActive },
    });

    // Clear cache
    await this.redis.del(`hotel:${hotelId}`);
    await this.redis.del(`hotel:slug:${hotel.slug}`);

    return updated;
  }

  async toggleHotelFeatured(hotelId: string, isFeatured: boolean) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');

    const updated = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { isFeatured },
    });

    await this.redis.del(`hotel:${hotelId}`);
    return updated;
  }

  async updateHotelCommission(hotelId: string, commissionRate: number) {
    if (commissionRate < 0 || commissionRate > 1) {
      throw new BadRequestException('Commission rate must be between 0 and 1');
    }

    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { commissionRate },
    });
  }

  // ============================================
  // Commission Management
  // ============================================

  async getCommissions(filters?: {
    hotelId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.hotelId) where.hotelId = filters.hotelId;
    if (filters?.status) where.status = filters.status;

    const [commissions, total, totals] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hotel: { select: { name: true } },
          booking: {
            select: {
              bookingNumber: true,
              totalAmount: true,
              status: true,
              guest: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.commission.count({ where }),
      this.prisma.commission.aggregate({
        where,
        _sum: { commissionAmount: true, bookingAmount: true },
      }),
    ]);

    return {
      commissions,
      total,
      page,
      limit,
      hasMore: skip + commissions.length < total,
      totalCommissionAmount: totals._sum.commissionAmount || 0,
      totalBookingAmount: totals._sum.bookingAmount || 0,
    };
  }

  async settleCommission(commissionId: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
    });
    if (!commission) throw new NotFoundException('Commission not found');
    if (commission.status !== 'PENDING') {
      throw new BadRequestException('Commission is not in PENDING status');
    }

    return this.prisma.commission.update({
      where: { id: commissionId },
      data: { status: 'SETTLED', settledAt: new Date() },
    });
  }

  async bulkSettleCommissions(commissionIds: string[]) {
    const result = await this.prisma.commission.updateMany({
      where: { id: { in: commissionIds }, status: 'PENDING' },
      data: { status: 'SETTLED', settledAt: new Date() },
    });

    return { count: result.count };
  }

  // ============================================
  // Platform Analytics
  // ============================================

  async getPlatformAnalytics(months: number = 6) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Monthly platform revenue and bookings
    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalAmount: true,
        createdAt: true,
        source: true,
      },
    });

    const monthlyData: Record<string, { bookings: number; revenue: number }> = {};
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { bookings: 0, revenue: 0 };
    }

    bookings.forEach((b) => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].bookings += 1;
        monthlyData[key].revenue += b.totalAmount || 0;
      }
    });

    const monthlyRevenue = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top hotels by revenue
    const topHotels = await this.prisma.booking.groupBy({
      by: ['hotelId'],
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { status: { not: 'CANCELLED' } },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    });

    const hotelIds = topHotels.map((h) => h.hotelId);
    const hotelNames = await this.prisma.hotel.findMany({
      where: { id: { in: hotelIds } },
      select: { id: true, name: true, city: true },
    });
    const hotelMap = new Map(hotelNames.map((h) => [h.id, h]));

    const topHotelsList = topHotels.map((h) => ({
      hotelId: h.hotelId,
      hotelName: hotelMap.get(h.hotelId)?.name || 'Unknown',
      city: hotelMap.get(h.hotelId)?.city || '',
      totalRevenue: h._sum.totalAmount || 0,
      totalBookings: h._count.id,
    }));

    // Booking source distribution
    const sourceDistribution = await this.prisma.booking.groupBy({
      by: ['source'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    });

    const sources = sourceDistribution.map((s) => ({
      source: s.source,
      count: s._count.id,
      revenue: s._sum.totalAmount || 0,
    }));

    // City performance
    const cityBookings = await this.prisma.booking.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: {
        totalAmount: true,
        hotel: { select: { city: true } },
      },
    });

    const cityMap: Record<string, { bookings: number; revenue: number }> = {};
    cityBookings.forEach((b) => {
      const city = b.hotel.city;
      if (!cityMap[city]) cityMap[city] = { bookings: 0, revenue: 0 };
      cityMap[city].bookings += 1;
      cityMap[city].revenue += b.totalAmount || 0;
    });

    const cityPerformance = Object.entries(cityMap)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      monthlyRevenue,
      topHotels: topHotelsList,
      sourceDistribution: sources,
      cityPerformance,
    };
  }

  // ============================================
  // Moderation
  // ============================================

  async getPendingReviews(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { isPublished: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hotel: { select: { name: true } },
          guest: { select: { name: true, email: true } },
        },
      }),
      this.prisma.review.count({ where: { isPublished: false } }),
    ]);

    return { reviews, total, page, limit, hasMore: skip + reviews.length < total };
  }

  async approveReview(reviewId: string) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isPublished: true },
    });
  }

  async deleteReview(reviewId: string) {
    await this.prisma.review.delete({ where: { id: reviewId } });
    return { success: true, message: 'Review deleted' };
  }

  // ============================================
  // Hotel Onboarding (Self-Serve)
  // ============================================

  async onboardHotel(input: {
    // Hotel details
    hotelName: string;
    city: string;
    state: string;
    address: string;
    pincode: string;
    phone: string;
    hotelEmail: string;
    description?: string;
    starRating?: number;
    bookingModel?: string;
    // Admin user details
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminPhone?: string;
    // Optional
    domain?: string;
  }) {
    // Validate unique constraints
    const slug = input.hotelName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const [existingSlug, existingEmail] = await Promise.all([
      this.prisma.hotel.findUnique({ where: { slug } }),
      this.prisma.user.findFirst({ where: { email: input.adminEmail.toLowerCase() } }),
    ]);

    if (existingSlug) {
      throw new ConflictException(`Hotel slug "${slug}" already exists. Choose a different name.`);
    }
    if (existingEmail) {
      throw new ConflictException('Admin email already registered. Please use a different email or login.');
    }

    const hashedPassword = await bcrypt.hash(input.adminPassword, 12);

    // Create everything in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create hotel
      const hotel = await tx.hotel.create({
        data: {
          name: input.hotelName,
          slug,
          description: input.description || null,
          address: input.address,
          city: input.city,
          state: input.state,
          country: 'India',
          pincode: input.pincode,
          phone: input.phone,
          email: input.hotelEmail,
          starRating: input.starRating || 3,
          bookingModel: (input.bookingModel as any) || 'DAILY',
          commissionRate: 0.10, // Default 10%
          isActive: false, // Needs platform admin approval
          isFeatured: false,
        },
      });

      // 2. Create admin user linked to hotel
      const adminUser = await tx.user.create({
        data: {
          name: input.adminName,
          email: input.adminEmail.toLowerCase(),
          phone: input.adminPhone || null,
          password: hashedPassword,
          role: 'HOTEL_ADMIN',
          hotelId: hotel.id,
          isActive: true,
          emailVerified: false,
          phoneVerified: false,
        },
      });

      // 3. Optionally create domain mapping
      if (input.domain) {
        await tx.hotelDomain.create({
          data: {
            hotelId: hotel.id,
            domain: input.domain.toLowerCase(),
            isPrimary: true,
          },
        });
      }

      return { hotel, adminUser };
    });

    return {
      success: true,
      message: 'Hotel registered successfully! It will be reviewed and activated by the platform team.',
      hotelId: result.hotel.id,
      hotelSlug: result.hotel.slug,
      adminEmail: result.adminUser.email,
    };
  }
}
