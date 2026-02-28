import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileInput } from './dto/update-user.input';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        role: true,
        hotelId: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        role: true,
        hotelId: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for unique constraints
    if (input.email && input.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (input.phone && input.phone !== user.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: input.phone },
      });
      if (existing) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.email && { 
          email: input.email.toLowerCase(),
          emailVerified: false, // Reset verification on email change
        }),
        ...(input.phone && { 
          phone: input.phone,
          phoneVerified: false, // Reset verification on phone change
        }),
        ...(input.avatarUrl && { avatarUrl: input.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        role: true,
        hotelId: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string, limit = 10, offset = 0) {
    return this.prisma.booking.findMany({
      where: { guestId: userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: {
          select: { id: true, name: true, slug: true, city: true },
        },
        roomType: {
          select: { id: true, name: true, images: true },
        },
      },
    });
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId: string, limit = 10, offset = 0) {
    return this.prisma.review.findMany({
      where: { guestId: userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * Get hotel staff users (for hotel admin dashboard)
   */
  async getHotelStaff(hotelId: string) {
    return this.prisma.user.findMany({
      where: {
        hotelId,
        role: {
          in: [UserRole.HOTEL_ADMIN, UserRole.HOTEL_STAFF],
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { success: true, message: 'Account deactivated' };
  }
}
